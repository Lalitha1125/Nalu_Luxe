
package com.naluluxe.service;

import com.naluluxe.dto.AdminCatalogoDto;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Statement;
import java.util.List;
import java.util.Locale;

import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

@Service
public class AdminCatalogoService {

    private final JdbcTemplate jdbc;

    public AdminCatalogoService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private String opcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private String requerido(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private void validar(AdminCatalogoDto.Guardar datos) {
        if (datos.precio() == null ||
            datos.precio().compareTo(BigDecimal.ZERO) <= 0 ||
            datos.precio().scale() > 2 ||
            datos.precio().compareTo(
                new BigDecimal("9999999999.99")
            ) > 0 ||
            datos.stock() == null ||
            datos.stock() < 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El precio debe ser mayor que cero " +
                "y el inventario no puede ser negativo."
            );
        }

        if (requerido(datos.sku()).isBlank() ||
            requerido(datos.nombre()).isBlank()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El SKU y el nombre son obligatorios."
            );
        }

        Long categorias = jdbc.queryForObject(
            """
            SELECT COUNT(*)
            FROM categorias
            WHERE id = ?
            """,
            Long.class,
            datos.categoriaId()
        );

        if (categorias == null || categorias == 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La categoría seleccionada no existe."
            );
        }

        String imagen = opcional(datos.imagenPrincipal());

        if (imagen != null &&
            !(imagen.startsWith("/joyas/") ||
              imagen.startsWith("https://"))) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La fotografía debe utilizar una ruta " +
                "/joyas/ o una URL HTTPS."
            );
        }
    }

    private Long administradorId(String correo) {
        List<Long> ids = jdbc.query(
            """
            SELECT u.id
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE LOWER(u.correo) = ?
              AND u.activo = TRUE
              AND u.correo_verificado = TRUE
              AND r.nombre = 'ADMIN'
            """,
            (rs, fila) -> rs.getLong("id"),
            correo.trim().toLowerCase(Locale.ROOT)
        );

        if (ids.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Se requiere una cuenta ADMIN válida."
            );
        }

        return ids.get(0);
    }

    private void auditar(
            Long administradorId,
            String accion,
            Long productoId
    ) {
        jdbc.update(
            """
            INSERT INTO auditoria
            (usuario_id, accion, entidad,
             entidad_id, detalle)
            VALUES (?, ?, 'productos', ?, ?)
            """,
            administradorId,
            accion,
            productoId,
            "Operación sobre el catálogo NALÚ LUXE"
        );
    }

    private AdminCatalogoDto.Producto mapear(
            java.sql.ResultSet rs
    ) throws java.sql.SQLException {

        return new AdminCatalogoDto.Producto(
            rs.getLong("id"),
            rs.getLong("categoria_id"),
            rs.getString("categoria"),
            rs.getString("sku"),
            rs.getString("nombre"),
            rs.getString("descripcion"),
            rs.getString("material"),
            rs.getString("color"),
            rs.getBigDecimal("precio"),
            rs.getInt("stock"),
            rs.getString("imagen_principal"),
            rs.getBoolean("destacado"),
            rs.getBoolean("activo"),
            rs.getLong("version")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminCatalogoDto.Categoria> categorias() {
        return jdbc.query(
            """
            SELECT id, nombre
            FROM categorias
            ORDER BY nombre
            """,
            (rs, fila) -> new AdminCatalogoDto.Categoria(
                rs.getLong("id"),
                rs.getString("nombre")
            )
        );
    }

    @Transactional(readOnly = true)
    public List<AdminCatalogoDto.Producto> productos() {
        return jdbc.query(
            """
            SELECT p.id, p.categoria_id,
                   c.nombre AS categoria,
                   p.sku, p.nombre, p.descripcion,
                   p.material, p.color, p.precio,
                   p.stock, p.imagen_principal,
                   p.destacado, p.activo, p.version
            FROM productos p
            JOIN categorias c ON c.id = p.categoria_id
            ORDER BY p.id DESC
            """,
            (rs, fila) -> mapear(rs)
        );
    }

    @Transactional
    public AdminCatalogoDto.Producto crear(
            String correoAdmin,
            AdminCatalogoDto.Guardar datos
    ) {
        Long adminId = administradorId(correoAdmin);
        validar(datos);

        KeyHolder llave = new GeneratedKeyHolder();

        try {
            jdbc.update(conexion -> {
                var ps = conexion.prepareStatement(
                    """
                    INSERT INTO productos
                    (categoria_id, sku, nombre, descripcion,
                     material, color, precio, stock,
                     imagen_principal, destacado, activo,
                     version)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                    """,
                    Statement.RETURN_GENERATED_KEYS
                );

                ps.setLong(1, datos.categoriaId());
                ps.setString(
                    2,
                    requerido(datos.sku()).toUpperCase(Locale.ROOT)
                );
                ps.setString(3, requerido(datos.nombre()));
                ps.setString(4, opcional(datos.descripcion()));
                ps.setString(5, opcional(datos.material()));
                ps.setString(6, opcional(datos.color()));
                ps.setBigDecimal(7, datos.precio());
                ps.setInt(8, datos.stock());
                ps.setString(9, opcional(datos.imagenPrincipal()));
                ps.setBoolean(10, datos.destacado());
                ps.setBoolean(11, datos.activo());

                return ps;
            }, llave);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se pudo crear el producto. " +
                "Comprueba que el SKU sea único."
            );
        }

        Number idGenerado = llave.getKey();

        if (idGenerado == null) {
            throw new IllegalStateException(
                "No se obtuvo el ID del producto."
            );
        }

        Long productoId = idGenerado.longValue();

        auditar(adminId, "CREAR_PRODUCTO", productoId);

        return buscarProducto(productoId);
    }

    @Transactional
    public AdminCatalogoDto.Producto actualizar(
            String correoAdmin,
            Long productoId,
            AdminCatalogoDto.Guardar datos
    ) {
        Long adminId = administradorId(correoAdmin);
        validar(datos);

        if (datos.version() == null ||
            datos.version() < 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Actualiza el formulario antes de guardar."
            );
        }

        int actualizados;

        try {
            actualizados = jdbc.update(
                """
                UPDATE productos
                SET categoria_id = ?,
                    sku = ?,
                    nombre = ?,
                    descripcion = ?,
                    material = ?,
                    color = ?,
                    precio = ?,
                    stock = ?,
                    imagen_principal = ?,
                    destacado = ?,
                    activo = ?,
                    version = version + 1
                WHERE id = ? AND version = ?
                """,
                datos.categoriaId(),
                requerido(datos.sku())
                    .toUpperCase(Locale.ROOT),
                requerido(datos.nombre()),
                opcional(datos.descripcion()),
                opcional(datos.material()),
                opcional(datos.color()),
                datos.precio(),
                datos.stock(),
                opcional(datos.imagenPrincipal()),
                datos.destacado(),
                datos.activo(),
                productoId,
                datos.version()
            );
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El SKU ya existe o los datos " +
                "incumplen una restricción de MySQL."
            );
        }

        if (actualizados != 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Este producto fue modificado " +
                "o ya no existe. Actualiza los datos."
            );
        }

        auditar(adminId, "ACTUALIZAR_PRODUCTO", productoId);

        return buscarProducto(productoId);
    }

    private AdminCatalogoDto.Producto buscarProducto(
            Long id
    ) {
        List<AdminCatalogoDto.Producto> resultado = jdbc.query(
            """
            SELECT p.id, p.categoria_id,
                   c.nombre AS categoria,
                   p.sku, p.nombre, p.descripcion,
                   p.material, p.color, p.precio,
                   p.stock, p.imagen_principal,
                   p.destacado, p.activo, p.version
            FROM productos p
            JOIN categorias c ON c.id = p.categoria_id
            WHERE p.id = ?
            """,
            (rs, fila) -> mapear(rs),
            id
        );

        if (resultado.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado."
            );
        }

        return resultado.get(0);
    }
}
