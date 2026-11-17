
package com.naluluxe.service;

import com.naluluxe.dto.ConsultaDto;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ConsultaService {

    private static final Set<String> ESTADOS =
        Set.of("PENDIENTE", "EN_PROCESO", "RESUELTA");

    private final JdbcTemplate jdbc;

    public ConsultaService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public ConsultaDto.Mensaje crear(
            ConsultaDto.Crear datos
    ) {
        String nombre = datos.nombre().trim();
        String correo = datos.correo()
            .trim()
            .toLowerCase(Locale.ROOT);
        String asunto = datos.asunto().trim();
        String mensaje = datos.mensaje().trim();

        if (nombre.length() < 2 ||
            asunto.length() < 3 ||
            mensaje.length() < 10) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Completa correctamente el formulario."
            );
        }

        // Un visitante puede contactar sin registrarse.
        // No confiamos en un ID de usuario recibido.
        jdbc.update(
            """
            INSERT INTO consultas
            (usuario_id, nombre, correo, asunto,
             mensaje, estado)
            VALUES (NULL, ?, ?, ?, ?, 'PENDIENTE')
            """,
            nombre,
            correo,
            asunto,
            mensaje
        );

        return new ConsultaDto.Mensaje(
            "Tu consulta fue registrada correctamente."
        );
    }

    @Transactional(readOnly = true)
    public List<ConsultaDto.Respuesta> listar() {

        return jdbc.query(
            """
            SELECT id, nombre, correo, asunto,
                   mensaje, estado, fecha
            FROM consultas
            ORDER BY fecha DESC, id DESC
            LIMIT 200
            """,
            (rs, fila) -> new ConsultaDto.Respuesta(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getString("correo"),
                rs.getString("asunto"),
                rs.getString("mensaje"),
                rs.getString("estado"),
                rs.getTimestamp("fecha").toLocalDateTime()
            )
        );
    }

    @Transactional
    public ConsultaDto.Mensaje cambiarEstado(
            Long id,
            ConsultaDto.CambiarEstado datos
    ) {
        String estado = datos.estado()
            .trim()
            .toUpperCase(Locale.ROOT);

        if (!ESTADOS.contains(estado)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Estado de consulta no válido."
            );
        }

        List<String> existentes = jdbc.query(
            """
            SELECT estado
            FROM consultas
            WHERE id = ?
            FOR UPDATE
            """,
            (rs, fila) -> rs.getString("estado"),
            id
        );

        if (existentes.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Consulta no encontrada."
            );
        }

        jdbc.update(
            """
            UPDATE consultas
            SET estado = ?
            WHERE id = ?
            """,
            estado,
            id
        );

        return new ConsultaDto.Mensaje(
            "Estado de la consulta actualizado."
        );
    }
}
