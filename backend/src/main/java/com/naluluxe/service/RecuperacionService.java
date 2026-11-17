
package com.naluluxe.service;

import com.naluluxe.dto.RecuperacionDto;
import com.naluluxe.entity.OtpCodigo;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.OtpCodigoRepository;
import com.naluluxe.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
public class RecuperacionService {

    private static final String TIPO =
        "RECUPERAR_PASSWORD";

    private static final int MAX_INTENTOS = 5;

    private final SecureRandom random =
        new SecureRandom();

    private final UsuarioRepository usuarios;
    private final OtpCodigoRepository codigos;
    private final PasswordEncoder encoder;
    private final CorreoService correo;
    private final JdbcTemplate jdbc;

    public RecuperacionService(
            UsuarioRepository usuarios,
            OtpCodigoRepository codigos,
            PasswordEncoder encoder,
            CorreoService correo,
            JdbcTemplate jdbc
    ) {
        this.usuarios = usuarios;
        this.codigos = codigos;
        this.encoder = encoder;
        this.correo = correo;
        this.jdbc = jdbc;
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    private String normalizar(String valor) {
        return valor.trim().toLowerCase(Locale.ROOT);
    }

    private RecuperacionDto.Mensaje mensajeGenerico() {
        return new RecuperacionDto.Mensaje(
            "Si el correo pertenece a una cuenta activa " +
            "y verificada, recibirás un código de recuperación."
        );
    }

    @Transactional
    public RecuperacionDto.Mensaje solicitar(
            RecuperacionDto.Solicitar datos
    ) {
        String email = normalizar(datos.correo());

        Usuario usuario = usuarios
            .findByCorreoIgnoreCase(email)
            .orElse(null);

        // No revelar si un correo está registrado.
        if (usuario == null ||
            !usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {
            return mensajeGenerico();
        }

        var anterior = codigos
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                email,
                TIPO
            );

        if (anterior.isPresent()) {
            OtpCodigo ultimo = anterior.get();

            // Evitar generar códigos continuamente.
            if (ultimo.getVenceEn() != null &&
                ultimo.getVenceEn().isAfter(
                    ahora().plusMinutes(9)
                )) {
                return mensajeGenerico();
            }

            ultimo.setUsado(true);
            codigos.saveAndFlush(ultimo);
        }

        String codigo = String.format(
            "%06d",
            random.nextInt(1_000_000)
        );

        OtpCodigo otp = new OtpCodigo();
        otp.setUsuario(usuario);
        otp.setCorreo(email);
        otp.setTipo(TIPO);
        otp.setCodigoHash(encoder.encode(codigo));
        otp.setVenceEn(ahora().plusMinutes(10));
        otp.setIntentos(0);
        otp.setUsado(false);

        codigos.saveAndFlush(otp);

        correo.enviarCodigoRecuperacion(
            email,
            codigo
        );

        return mensajeGenerico();
    }

    @Transactional(
        noRollbackFor = ResponseStatusException.class
    )
    public RecuperacionDto.Mensaje restablecer(
            RecuperacionDto.Restablecer datos
    ) {
        String email = normalizar(datos.correo());

        Usuario usuario = usuarios
            .findByCorreoIgnoreCase(email)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se pudo restablecer la contraseña."
                )
            );

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "No se pudo restablecer la contraseña."
            );
        }

        OtpCodigo otp = codigos
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                email,
                TIPO
            )
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El código es inválido o ha vencido."
                )
            );

        if (!ahora().isBefore(otp.getVenceEn())) {
            otp.setUsado(true);
            codigos.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código es inválido o ha vencido."
            );
        }

        if (otp.getIntentos() >= MAX_INTENTOS) {
            otp.setUsado(true);
            codigos.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Se alcanzó el límite de intentos."
            );
        }

        otp.setIntentos(otp.getIntentos() + 1);

        if (!encoder.matches(
            datos.codigo(),
            otp.getCodigoHash()
        )) {
            if (otp.getIntentos() >= MAX_INTENTOS) {
                otp.setUsado(true);
            }

            codigos.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código es incorrecto."
            );
        }

        // No permitir reutilizar la contraseña actual.
        if (encoder.matches(
            datos.nuevaContrasena(),
            usuario.getPasswordHash()
        )) {
            otp.setUsado(true);
            codigos.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Elige una contraseña diferente."
            );
        }

        // Usamos el OTP una sola vez.
        otp.setUsado(true);
        codigos.saveAndFlush(otp);

        usuario.setPasswordHash(
            encoder.encode(datos.nuevaContrasena())
        );

        usuarios.saveAndFlush(usuario);

        // Revocar sesiones antiguas tras cambiar la clave.
        jdbc.update(
            """
            UPDATE sesiones_usuario
            SET revocada = TRUE
            WHERE usuario_id = ?
              AND revocada = FALSE
            """,
            usuario.getId()
        );

        // Invalidar cualquier OTP de inicio de sesión
        // que hubiera quedado pendiente.
        jdbc.update(
            """
            UPDATE otp_codigos
            SET usado = TRUE
            WHERE usuario_id = ?
              AND tipo = 'LOGIN'
              AND usado = FALSE
            """,
            usuario.getId()
        );

        return new RecuperacionDto.Mensaje(
            "Contraseña actualizada. Inicia sesión nuevamente."
        );
    }
}
