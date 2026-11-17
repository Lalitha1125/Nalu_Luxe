
package com.naluluxe.service;

import com.naluluxe.dto.RegistroDto;
import com.naluluxe.entity.OtpCodigo;
import com.naluluxe.entity.Rol;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.OtpCodigoRepository;
import com.naluluxe.repository.RolRepository;
import com.naluluxe.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
public class RegistroService {

    private static final String TIPO_REGISTRO =
        "VERIFICAR_REGISTRO";

    private static final int MAX_INTENTOS = 5;

    private final SecureRandom random = new SecureRandom();

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final OtpCodigoRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;

    public RegistroService(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            OtpCodigoRepository otpRepository,
            PasswordEncoder passwordEncoder,
            CorreoService correoService
    ) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private LocalDateTime ahoraUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    @Transactional
    public RegistroDto.MensajeRespuesta registrar(
            RegistroDto.SolicitudRegistro solicitud
    ) {

        String correo = normalizarCorreo(
            solicitud.correo()
        );

        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El correo ya está registrado."
            );
        }

        Rol rolCliente = rolRepository
            .findByNombre("CLIENTE")
            .orElseThrow(() ->
                new IllegalStateException(
                    "No existe el rol CLIENTE en MySQL."
                )
            );

        Usuario usuario = new Usuario();

        usuario.setNombre(
            solicitud.nombre().trim()
        );

        usuario.setCorreo(correo);

        usuario.setPasswordHash(
            passwordEncoder.encode(
                solicitud.contrasena()
            )
        );

        usuario.setTelefono(
            solicitud.telefono() == null
                ? null
                : solicitud.telefono().trim()
        );

        usuario.setRol(rolCliente);
        usuario.setActivo(true);
        usuario.setCorreoVerificado(false);

        // IMPORTANTE:
        // Usamos la instancia que devuelve JPA.
        // Esta será la entidad asociada al OTP.
        Usuario usuarioGuardado =
            usuarioRepository.saveAndFlush(usuario);

        String codigo = String.format(
            "%06d",
            random.nextInt(1_000_000)
        );

        OtpCodigo otp = new OtpCodigo();

        otp.setUsuario(usuarioGuardado);
        otp.setCorreo(correo);
        otp.setTipo(TIPO_REGISTRO);

        otp.setCodigoHash(
            passwordEncoder.encode(codigo)
        );

        otp.setVenceEn(
            ahoraUtc().plusMinutes(10)
        );

        otp.setIntentos(0);
        otp.setUsado(false);

        // Guardamos y sincronizamos el OTP.
        otpRepository.saveAndFlush(otp);

        correoService.enviarCodigoRegistro(
            correo,
            codigo
        );

        return new RegistroDto.MensajeRespuesta(
            "Cuenta creada. Verifica tu correo con el código enviado."
        );
    }

    @Transactional(
        noRollbackFor = ResponseStatusException.class
    )
    public RegistroDto.MensajeRespuesta verificar(
            RegistroDto.VerificarCorreo solicitud
    ) {

        String correo = normalizarCorreo(
            solicitud.correo()
        );

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se pudo verificar el correo."
                )
            );

        if (usuario.isCorreoVerificado()) {
            return new RegistroDto.MensajeRespuesta(
                "El correo ya está verificado."
            );
        }

        OtpCodigo otp = otpRepository
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                correo,
                TIPO_REGISTRO
            )
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No existe un código pendiente."
                )
            );

        if (otp.getIntentos() >= MAX_INTENTOS) {
            otp.setUsado(true);
            otpRepository.save(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Se alcanzó el máximo de intentos."
            );
        }

        if (!ahoraUtc().isBefore(otp.getVenceEn())) {
            otp.setUsado(true);
            otpRepository.save(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código ha vencido."
            );
        }

        otp.setIntentos(
            otp.getIntentos() + 1
        );

        boolean correcto = passwordEncoder.matches(
            solicitud.codigo(),
            otp.getCodigoHash()
        );

        if (!correcto) {
            otpRepository.save(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Código incorrecto."
            );
        }

        otp.setUsado(true);
        otpRepository.save(otp);

        usuario.setCorreoVerificado(true);
        usuarioRepository.save(usuario);

        return new RegistroDto.MensajeRespuesta(
            "Correo verificado correctamente."
        );
    }
}
