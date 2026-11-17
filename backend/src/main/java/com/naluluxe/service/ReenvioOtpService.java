
package com.naluluxe.service;

import com.naluluxe.entity.OtpCodigo;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.OtpCodigoRepository;
import com.naluluxe.repository.UsuarioRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

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
public class ReenvioOtpService {

    private static final String TIPO_REGISTRO =
        "VERIFICAR_REGISTRO";

    private final UsuarioRepository usuarios;
    private final OtpCodigoRepository codigos;
    private final PasswordEncoder encoder;
    private final CorreoService correoService;
    private final JdbcTemplate jdbc;
    private final EntityManager entityManager;

    private final SecureRandom random = new SecureRandom();

    public ReenvioOtpService(
            UsuarioRepository usuarios,
            OtpCodigoRepository codigos,
            PasswordEncoder encoder,
            CorreoService correoService,
            JdbcTemplate jdbc,
            EntityManager entityManager
    ) {
        this.usuarios = usuarios;
        this.codigos = codigos;
        this.encoder = encoder;
        this.correoService = correoService;
        this.jdbc = jdbc;
        this.entityManager = entityManager;
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    @Transactional
    public String reenviarRegistro(String correoIngresado) {

        String correo = correoIngresado
            .trim()
            .toLowerCase(Locale.ROOT);

        Usuario usuario = usuarios
            .findByCorreoIgnoreCase(correo)
            .orElse(null);

        if (usuario == null ||
            !usuario.isActivo() ||
            usuario.isCorreoVerificado()) {

            return respuestaGenerica();
        }

        entityManager.lock(
            usuario,
            LockModeType.PESSIMISTIC_WRITE
        );

        var anterior = codigos
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                correo,
                TIPO_REGISTRO
            );

        if (anterior.isPresent() &&
            anterior.get().getVenceEn().isAfter(
                ahora().plusMinutes(9)
            )) {

            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Espera un minuto antes de pedir otro código."
            );
        }

        // Limpiar cambios pendientes antes del SQL.
        entityManager.flush();

        jdbc.update(
            """
            UPDATE otp_codigos
            SET usado = TRUE
            WHERE usuario_id = ?
              AND tipo = ?
              AND usado = FALSE
            """,
            usuario.getId(),
            TIPO_REGISTRO
        );

        String codigo = String.format(
            "%06d",
            random.nextInt(1_000_000)
        );

        OtpCodigo otp = new OtpCodigo();

        otp.setUsuario(usuario);
        otp.setCorreo(correo);
        otp.setTipo(TIPO_REGISTRO);
        otp.setCodigoHash(encoder.encode(codigo));
        otp.setVenceEn(ahora().plusMinutes(10));
        otp.setIntentos(0);
        otp.setUsado(false);

        codigos.saveAndFlush(otp);

        correoService.enviarCodigoRegistro(
            correo,
            codigo
        );

        return respuestaGenerica();
    }

    private String respuestaGenerica() {
        return "Si existe una cuenta pendiente de " +
            "verificación, se procesará la solicitud.";
    }
}
