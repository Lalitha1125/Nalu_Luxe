
package com.naluluxe.service;

import com.naluluxe.dto.PedidoDto;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PedidoService {

    private final JdbcTemplate jdbc;
    private final UsuarioRepository usuarios;

    public PedidoService(
            JdbcTemplate jdbc,
            UsuarioRepository usuarios
    ) {
        this.jdbc = jdbc;
        this.usuarios = usuarios;
    }

    private Long usuarioId(String correo) {
        Usuario usuario = usuarios
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Sesión no válida."
                )
            );

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Cuenta no habilitada."
            );
        }

        return usuario.getId();
    }

    private record ProductoDb(
        Long id,
        String nombre,
        BigDecimal precio,
        int stock
    ) {}

    private ProductoDb bloquearProducto(Long id) {
        List<ProductoDb> resultados = jdbc.query(
            """
            SELECT id, nombre, precio, stock
            FROM productos
            WHERE id = ?
            FOR UPDATE
            """,
            (rs, fila) -> new ProductoDb(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getBigDecimal("precio"),
                rs.getInt("stock")
            ),
            id
        );

        if (resultados.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Uno de los productos no existe."
            );
        }

        return resultados.get(0);
    }

    private String obtenerDireccion(
            Long usuarioId,
            Long direccionId
    ) {
        List<String> direcciones = jdbc.query(
            """
            SELECT ciudad, localidad, barrio,
                   direccion, indicaciones
            FROM direcciones
            WHERE id = ? AND usuario_id = ?
            """,
            (rs, fila) -> String.join(", ",
                Arrays.asList(
                    rs.getString("direccion"),
                    rs.getString("barrio"),
                    rs.getString("localidad"),
                    rs.getString("ciudad"),
                    rs.getString("indicaciones")
                ).stream()
                 .filter(s -> s != null && !s.isBlank())
                 .toList()
            ),
            direccionId, usuarioId
        );

        if (direcciones.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Selecciona una dirección válida."
            );
        }

        String direccion = direcciones.get(0);

        if (direccion.length() > 400) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La dirección supera el límite permitido."
            );
        }

        return direccion;
    }

    @Transactional
    public PedidoDto.Respuesta crear(
            String correo,
            PedidoDto.Crear datos
    ) {
        Long usuarioId = usuarioId(correo);

        String direccion = obtenerDireccion(
            usuarioId,
            datos.direccionId()
        );

        // Agrupamos productos repetidos y los
        // bloqueamos en un orden fijo.
        TreeMap<Long, Integer> cantidades = new TreeMap<>();

        for (PedidoDto.Item item : datos.productos()) {
            if (item.productoId() == null ||
                item.cantidad() < 1 ||
                item.cantidad() > 99) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cantidad de producto no válida."
                );
            }

            cantidades.merge(
                item.productoId(),
                item.cantidad(),
                Integer::sum
            );
        }

        if (cantidades.isEmpty() ||
            cantidades.size() > 50) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El carrito no es válido."
            );
        }

        List<PedidoDto.Detalle> detalles =
            new ArrayList<>();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (var entrada : cantidades.entrySet()) {
            Long productoId = entrada.getKey();
            int cantidad = entrada.getValue();

            if (cantidad > 99) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hay demasiadas unidades de un producto."
                );
            }

            ProductoDb producto =
                bloquearProducto(productoId);

            if (producto.stock() < cantidad) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No hay existencias suficientes de: " +
                    producto.nombre()
                );
            }

            if (producto.precio() == null ||
                producto.precio().signum() < 0) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio del producto no es válido."
                );
            }

            BigDecimal totalLinea =
                producto.precio().multiply(
                    BigDecimal.valueOf(cantidad)
                );

            detalles.add(new PedidoDto.Detalle(
                productoId,
                producto.nombre(),
                cantidad,
                producto.precio(),
                totalLinea
            ));

            subtotal = subtotal.add(totalLinea);
        }

        // Prototipo: envío sin costo configurado.
        // No debe interpretarse como tarifa definitiva.
        BigDecimal costoEnvio = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(costoEnvio);

        String numero = "NL-" +
            UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 20)
                .toUpperCase(Locale.ROOT);

        String observaciones =
            datos.observaciones() == null
                ? null
                : datos.observaciones().trim();

        KeyHolder llave = new GeneratedKeyHolder();

        final BigDecimal subtotalFinal = subtotal;
        final BigDecimal totalFinal = total;

        jdbc.update(conexion -> {
            PreparedStatement ps =
                conexion.prepareStatement(
                    """
                    INSERT INTO pedidos
                    (usuario_id, numero, estado,
                     direccion_entrega, subtotal,
                     costo_envio, total, observaciones)
                    VALUES (?, ?, 'REGISTRADO', ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
                );

            ps.setLong(1, usuarioId);
            ps.setString(2, numero);
            ps.setString(3, direccion);
            ps.setBigDecimal(4, subtotalFinal);
            ps.setBigDecimal(5, costoEnvio);
            ps.setBigDecimal(6, totalFinal);
            ps.setString(7, observaciones);

            return ps;
        }, llave);

        Number identificador = llave.getKey();

        if (identificador == null) {
            throw new IllegalStateException(
                "No se generó el identificador del pedido."
            );
        }

        Long pedidoId = identificador.longValue();

        for (PedidoDto.Detalle detalle : detalles) {
            jdbc.update(
                """
                INSERT INTO pedido_detalles
                (pedido_id, producto_id, nombre_producto,
                 cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                pedidoId,
                detalle.productoId(),
                detalle.nombreProducto(),
                detalle.cantidad(),
                detalle.precioUnitario(),
                detalle.subtotal()
            );

            int actualizados = jdbc.update(
                """
                UPDATE productos
                SET stock = stock - ?
                WHERE id = ? AND stock >= ?
                """,
                detalle.cantidad(),
                detalle.productoId(),
                detalle.cantidad()
            );

            if (actualizados != 1) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El inventario cambió. Intenta nuevamente."
                );
            }
        }

        return obtenerPropio(usuarioId, pedidoId);
    }

    @Transactional(readOnly = true)
    public List<PedidoDto.Respuesta> listar(
            String correo
    ) {
        Long usuarioId = usuarioId(correo);

        List<Long> ids = jdbc.query(
            """
            SELECT id FROM pedidos
            WHERE usuario_id = ?
            ORDER BY fecha DESC, id DESC
            """,
            (rs, fila) -> rs.getLong("id"),
            usuarioId
        );

        return ids.stream()
            .map(id -> obtenerPropio(usuarioId, id))
            .toList();
    }

    @Transactional(readOnly = true)
    public PedidoDto.Respuesta consultar(
            String correo,
            Long pedidoId
    ) {
        return obtenerPropio(usuarioId(correo), pedidoId);
    }

    private PedidoDto.Respuesta obtenerPropio(
            Long usuarioId,
            Long pedidoId
    ) {
        var pedidos = jdbc.query(
            """
            SELECT id, numero, fecha, estado,
                   direccion_entrega, subtotal,
                   costo_envio, total, observaciones
            FROM pedidos
            WHERE id = ? AND usuario_id = ?
            """,
            (rs, fila) -> {
                Timestamp fecha = rs.getTimestamp("fecha");

                return new PedidoDto.Respuesta(
                    rs.getLong("id"),
                    rs.getString("numero"),
                    fecha.toLocalDateTime(),
                    rs.getString("estado"),
                    rs.getString("direccion_entrega"),
                    rs.getBigDecimal("subtotal"),
                    rs.getBigDecimal("costo_envio"),
                    rs.getBigDecimal("total"),
                    rs.getString("observaciones"),
                    List.of()
                );
            },
            pedidoId, usuarioId
        );

        if (pedidos.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Pedido no encontrado."
            );
        }

        var cabecera = pedidos.get(0);

        var detalles = jdbc.query(
            """
            SELECT producto_id, nombre_producto,
                   cantidad, precio_unitario, subtotal
            FROM pedido_detalles
            WHERE pedido_id = ?
            ORDER BY id
            """,
            (rs, fila) -> new PedidoDto.Detalle(
                rs.getLong("producto_id"),
                rs.getString("nombre_producto"),
                rs.getInt("cantidad"),
                rs.getBigDecimal("precio_unitario"),
                rs.getBigDecimal("subtotal")
            ),
            pedidoId
        );

        return new PedidoDto.Respuesta(
            cabecera.id(),
            cabecera.numero(),
            cabecera.fecha(),
            cabecera.estado(),
            cabecera.direccionEntrega(),
            cabecera.subtotal(),
            cabecera.costoEnvio(),
            cabecera.total(),
            cabecera.observaciones(),
            detalles
        );
    }
}
