
package com.naluluxe.service;

import com.naluluxe.dto.InvitacionAdminDto;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class InvitacionAdminService {

    private final JdbcTemplate jdbc;
    private final SecureRandom random = new SecureRandom();

    public InvitacionAdminService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    private String normalizar(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private String generarToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] hash = MessageDigest
                .getInstance("SHA-256")
                .digest(
                    token.getBytes(StandardCharsets.UTF_8)
                );

            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException(
                "Error al generar el hash.",
                e
            );
        }
    }

    private record Cuenta(
        Long id,
        String correo,
        String rol,
        boolean activa,
        boolean verificada
    ) {}

    private Cuenta buscarCuenta(String correo) {
        List<Cuenta> cuentas = jdbc.query(
            """
            SELECT u.id, u.correo,
                   u.activo, u.correo_verificado,
                   r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE LOWER(u.correo) = ?
            """,
            (rs, fila) -> new Cuenta(
                rs.getLong("id"),
                rs.getString("correo"),
                rs.getString("rol"),
                rs.getBoolean("activo"),
                rs.getBoolean("correo_verificado")
            ),
            correo
        );

        return cuentas.isEmpty() ? null : cuentas.get(0);
    }

    @Transactional
    public InvitacionAdminDto.InvitacionCreada crear(
            String correoAdministrador,
            InvitacionAdminDto.Crear datos
    ) {
        String administradorCorreo =
            normalizar(correoAdministrador);

        String invitadoCorreo =
            normalizar(datos.correo());

        Cuenta administrador =
            buscarCuenta(administradorCorreo);

        if (administrador == null ||
            !administrador.activa() ||
            !administrador.verificada() ||
            !"ADMIN".equals(administrador.rol())) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes autorización administrativa."
            );
        }

        Cuenta invitado = buscarCuenta(invitadoCorreo);

        if (invitado == null ||
            !invitado.activa() ||
            !invitado.verificada() ||
            !"CLIENTE".equals(invitado.rol())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El correo debe pertenecer a una " +
                "cuenta CLIENTE activa y verificada."
            );
        }

        // Impedir duplicar invitaciones pendientes.
        Long pendientes = jdbc.queryForObject(
            """
            SELECT COUNT(*)
            FROM invitaciones_admin
            WHERE LOWER(correo) = ?
              AND utilizado = FALSE
              AND vence_en > ?
            """,
            Long.class,
            invitadoCorreo,
            Timestamp.valueOf(ahora())
        );

        if (pendientes != null && pendientes > 0) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Esta cuenta ya tiene una invitación vigente."
            );
        }

        String token = generarToken();
        String tokenHash = hashToken(token);

        LocalDateTime vencimiento =
            ahora().plusHours(24);

        jdbc.update(
            """
            INSERT INTO invitaciones_admin
            (correo, token_hash, invitado_por,
             vence_en, utilizado)
            VALUES (?, ?, ?, ?, FALSE)
            """,
            invitadoCorreo,
            tokenHash,
            administrador.id(),
            Timestamp.valueOf(vencimiento)
        );

        Long invitacionId = jdbc.queryForObject(
            """
            SELECT id
            FROM invitaciones_admin
            WHERE token_hash = ?
            """,
            Long.class,
            tokenHash
        );

        jdbc.update(
            """
            INSERT INTO auditoria
            (usuario_id, accion, entidad,
             entidad_id, detalle)
            VALUES (?, 'INVITACION_ADMIN',
                    'invitaciones_admin', ?, ?)
            """,
            administrador.id(),
            invitacionId,
            "Invitación creada para una cuenta verificada."
        );

        return new InvitacionAdminDto.InvitacionCreada(
            "Invitación creada. Copia el token y " +
            "entrégalo de manera privada.",
            invitadoCorreo,
            token,
            vencimiento
        );
    }

    private record Invitacion(
        Long id,
        String correo,
        boolean utilizado,
        LocalDateTime venceEn
    ) {}

    @Transactional
    public InvitacionAdminDto.Mensaje aceptar(
            String correoAutenticado,
            InvitacionAdminDto.Aceptar datos
    ) {
        String email = normalizar(correoAutenticado);

        String token = datos.token().trim();

        // La cadena generada tiene exactamente 43 caracteres.
        if (!token.matches("[A-Za-z0-9_-]{43}")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La invitación no es válida."
            );
        }

        String tokenHash = hashToken(token);

        List<Invitacion> invitaciones = jdbc.query(
            """
            SELECT id, correo, utilizado, vence_en
            FROM invitaciones_admin
            WHERE token_hash = ?
            FOR UPDATE
            """,
            (rs, fila) -> new Invitacion(
                rs.getLong("id"),
                rs.getString("correo"),
                rs.getBoolean("utilizado"),
                rs.getTimestamp("vence_en")
                    .toLocalDateTime()
            ),
            tokenHash
        );

        if (invitaciones.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La invitación no es válida."
            );
        }

        Invitacion invitacion = invitaciones.get(0);

        if (invitacion.utilizado() ||
            !ahora().isBefore(invitacion.venceEn())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La invitación ya fue usada o venció."
            );
        }

        // El correo de la sesión debe ser el invitado.
        if (!normalizar(invitacion.correo())
            .equals(email)) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Esta invitación pertenece a otra cuenta."
            );
        }

        Cuenta cuenta = buscarCuenta(email);

        if (cuenta == null ||
            !cuenta.activa() ||
            !cuenta.verificada() ||
            !"CLIENTE".equals(cuenta.rol())) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "La cuenta no cumple los requisitos."
            );
        }

        int actualizados = jdbc.update(
            """
            UPDATE usuarios
            SET rol_id = (
                SELECT id
                FROM roles
                WHERE nombre = 'ADMIN'
            )
            WHERE id = ?
              AND rol_id = (
                SELECT id
                FROM roles
                WHERE nombre = 'CLIENTE'
            )
            """,
            cuenta.id()
        );

        if (actualizados != 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No fue posible activar la cuenta ADMIN."
            );
        }

        jdbc.update(
            """
            UPDATE invitaciones_admin
            SET utilizado = TRUE
            WHERE id = ?
            """,
            invitacion.id()
        );

        // La elevación del rol exige volver a autenticarse.
        jdbc.update(
            """
            UPDATE sesiones_usuario
            SET revocada = TRUE
            WHERE usuario_id = ?
              AND revocada = FALSE
            """,
            cuenta.id()
        );

        jdbc.update(
            """
            UPDATE otp_codigos
            SET usado = TRUE
            WHERE usuario_id = ?
              AND tipo = 'LOGIN'
              AND usado = FALSE
            """,
            cuenta.id()
        );

        jdbc.update(
            """
            INSERT INTO auditoria
            (usuario_id, accion, entidad,
             entidad_id, detalle)
            VALUES (?, 'ACEPTAR_INVITACION_ADMIN',
                    'usuarios', ?, ?)
            """,
            cuenta.id(),
            cuenta.id(),
            "Cuenta promovida a ADMIN por invitación."
        );

        return new InvitacionAdminDto.Mensaje(
            "Invitación aceptada. Tu cuenta ahora tiene " +
            "el rol ADMIN. Inicia sesión nuevamente."
        );
    }
}
