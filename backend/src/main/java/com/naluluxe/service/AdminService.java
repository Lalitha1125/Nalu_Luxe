
package com.naluluxe.service;

import com.naluluxe.dto.AdminDto;
import com.naluluxe.dto.PedidoDto;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AdminService {

    private final JdbcTemplate jdbc;

    private static final Map<String, Set<String>>
        TRANSICIONES = Map.of(
            "REGISTRADO", Set.of("PREPARANDO"),
            "PREPARANDO", Set.of("ENVIADO"),
            "ENVIADO", Set.of("ENTREGADO"),
            "ENTREGADO", Set.of()
        );

    public AdminService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private long contar(String sql) {
        Long total = jdbc.queryForObject(
            sql, Long.class
        );

        return total == null ? 0L : total;
    }

    @Transactional(readOnly = true)
    public AdminDto.Resumen resumen() {

        long productos = contar(
            "SELECT COUNT(*) FROM productos"
        );

        long clientes = contar(
            """
            SELECT COUNT(*)
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE r.nombre = 'CLIENTE'
            """
        );

        long pedidos = contar(
            "SELECT COUNT(*) FROM pedidos"
        );

        long sinStock = contar(
            "SELECT COUNT(*) FROM productos WHERE stock <= 0"
        );

        BigDecimal valor = jdbc.queryForObject(
            """
            SELECT COALESCE(SUM(total), 0)
            FROM pedidos
            """,
            BigDecimal.class
        );

        return new AdminDto.Resumen(
            productos,
            clientes,
            pedidos,
            valor == null ? BigDecimal.ZERO : valor,
            sinStock
        );
    }

    @Transactional(readOnly = true)
    public List<AdminDto.Producto> listarProductos() {

        return jdbc.query(
            """
            SELECT id, nombre, precio, stock
            FROM productos
            ORDER BY id
            """,
            (rs, fila) -> new AdminDto.Producto(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getBigDecimal("precio"),
                rs.getInt("stock")
            )
        );
    }

    @Transactional
    public AdminDto.Producto actualizarInventario(
            Long id,
            AdminDto.ActualizarInventario datos
    ) {
        if (datos.precio() == null ||
            datos.stock() == null ||
            datos.precio().signum() < 0 ||
            datos.precio().scale() > 2 ||
            datos.precio().compareTo(
                new BigDecimal("9999999999.99")
            ) > 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Precio o cantidad no válidos."
            );
        }

        int actualizados = jdbc.update(
            """
            UPDATE productos
            SET precio = ?, stock = ?
            WHERE id = ?
            """,
            datos.precio(),
            datos.stock(),
            id
        );

        if (actualizados == 0) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado."
            );
        }

        List<AdminDto.Producto> resultado = jdbc.query(
            """
            SELECT id, nombre, precio, stock
            FROM productos
            WHERE id = ?
            """,
            (rs, fila) -> new AdminDto.Producto(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getBigDecimal("precio"),
                rs.getInt("stock")
            ),
            id
        );

        return resultado.get(0);
    }

    @Transactional(readOnly = true)
    public List<AdminDto.Pedido> listarPedidos() {

        var cabeceras = jdbc.query(
            """
            SELECT
                p.id,
                p.numero,
                p.fecha,
                p.estado,
                p.direccion_entrega,
                p.subtotal,
                p.costo_envio,
                p.total,
                u.nombre AS cliente,
                u.correo
            FROM pedidos p
            JOIN usuarios u ON u.id = p.usuario_id
            ORDER BY p.fecha DESC, p.id DESC
            """,
            (rs, fila) -> {
                Timestamp fecha = rs.getTimestamp("fecha");

                return new AdminDto.Pedido(
                    rs.getLong("id"),
                    rs.getString("numero"),
                    fecha.toLocalDateTime(),
                    rs.getString("estado"),
                    rs.getString("cliente"),
                    rs.getString("correo"),
                    rs.getString("direccion_entrega"),
                    rs.getBigDecimal("subtotal"),
                    rs.getBigDecimal("costo_envio"),
                    rs.getBigDecimal("total"),
                    List.of()
                );
            }
        );

        return cabeceras.stream()
            .map(pedido -> new AdminDto.Pedido(
                pedido.id(),
                pedido.numero(),
                pedido.fecha(),
                pedido.estado(),
                pedido.cliente(),
                pedido.correo(),
                pedido.direccionEntrega(),
                pedido.subtotal(),
                pedido.costoEnvio(),
                pedido.total(),
                detalles(pedido.id())
            ))
            .toList();
    }

    private List<PedidoDto.Detalle> detalles(Long pedidoId) {

        return jdbc.query(
            """
            SELECT
                producto_id,
                nombre_producto,
                cantidad,
                precio_unitario,
                subtotal
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
    }

    @Transactional
    public void actualizarEstado(
            Long pedidoId,
            AdminDto.CambiarEstado datos
    ) {
        List<String> resultados = jdbc.query(
            """
            SELECT estado
            FROM pedidos
            WHERE id = ?
            FOR UPDATE
            """,
            (rs, fila) -> rs.getString("estado"),
            pedidoId
        );

        if (resultados.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Pedido no encontrado."
            );
        }

        String actual = resultados.get(0);
        String nuevo = datos.estado();

        if (!TRANSICIONES
            .getOrDefault(actual, Set.of())
            .contains(nuevo)) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se permite cambiar de " +
                actual + " a " + nuevo + "."
            );
        }

        int actualizados = jdbc.update(
            """
            UPDATE pedidos
            SET estado = ?
            WHERE id = ? AND estado = ?
            """,
            nuevo,
            pedidoId,
            actual
        );

        if (actualizados != 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El estado cambió. Actualiza la página."
            );
        }
    }
}
