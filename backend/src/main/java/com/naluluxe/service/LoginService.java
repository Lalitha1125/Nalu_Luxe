
package com.naluluxe.service;

import com.naluluxe.dto.LoginDto;
import com.naluluxe.entity.OtpCodigo;
import com.naluluxe.entity.SesionUsuario;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.OtpCodigoRepository;
import com.naluluxe.repository.SesionUsuarioRepository;
import com.naluluxe.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class LoginService {

    private static final String TIPO_LOGIN = "LOGIN";
    private static final int MAX_INTENTOS = 5;

    private final SecureRandom random = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final OtpCodigoRepository otpRepository;
    private final SesionUsuarioRepository sesionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;

    public LoginService(
            UsuarioRepository usuarioRepository,
            OtpCodigoRepository otpRepository,
            SesionUsuarioRepository sesionRepository,
            PasswordEncoder passwordEncoder,
            CorreoService correoService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.otpRepository = otpRepository;
        this.sesionRepository = sesionRepository;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    private String normalizar(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    public String hashToken(String token) {
        try {
            byte[] digest = MessageDigest
                .getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException(
                "No se pudo calcular el hash del token.",
                ex
            );
        }
    }

    private String nuevoToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(bytes);
    }

    private LoginDto.UsuarioRespuesta responderUsuario(
            Usuario usuario
    ) {
        return new LoginDto.UsuarioRespuesta(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol().getNombre()
        );
    }

    @Transactional
    public LoginDto.Mensaje iniciar(LoginDto.Iniciar datos) {

        String correo = normalizar(datos.correo());

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElse(null);

        if (usuario == null ||
            !usuario.isActivo() ||
            !passwordEncoder.matches(
                datos.contrasena(),
                usuario.getPasswordHash()
            )) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Correo o contraseña incorrectos."
            );
        }

        if (!usuario.isCorreoVerificado()) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Debes verificar tu correo antes de ingresar."
            );
        }

        // Evitar solicitar códigos repetidamente
        // mientras hay uno reciente.
        var anterior = otpRepository
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                correo,
                TIPO_LOGIN
            );

        if (anterior.isPresent()) {
            OtpCodigo anteriorOtp = anterior.get();

            if (anteriorOtp.getVenceEn().isAfter(
    ahora().plusMinutes(9)
)) {

                throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Espera un minuto antes de solicitar otro código."
                );
            }

            anteriorOtp.setUsado(true);
            otpRepository.save(anteriorOtp);
        }

        String codigo = String.format(
            "%06d",
            random.nextInt(1_000_000)
        );

        OtpCodigo otp = new OtpCodigo();
        otp.setUsuario(usuario);
        otp.setCorreo(correo);
        otp.setTipo(TIPO_LOGIN);
        otp.setCodigoHash(passwordEncoder.encode(codigo));
        otp.setVenceEn(ahora().plusMinutes(10));
        otp.setIntentos(0);
        otp.setUsado(false);

        otpRepository.saveAndFlush(otp);

        correoService.enviarCodigoLogin(correo, codigo);

        return new LoginDto.Mensaje(
            "Código de inicio de sesión generado."
        );
    }

    @Transactional(
        noRollbackFor = ResponseStatusException.class
    )
    public LoginDto.AccesoRespuesta verificar(
            LoginDto.Verificar datos
    ) {

        String correo = normalizar(datos.correo());

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "No fue posible verificar el acceso."
                )
            );

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "La cuenta no está habilitada."
            );
        }

        OtpCodigo otp = otpRepository
            .findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
                correo,
                TIPO_LOGIN
            )
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No existe un código de acceso pendiente."
                )
            );

        if (!ahora().isBefore(otp.getVenceEn())) {
            otp.setUsado(true);
            otpRepository.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código ha vencido."
            );
        }

        if (otp.getIntentos() >= MAX_INTENTOS) {
            otp.setUsado(true);
            otpRepository.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Se alcanzó el límite de intentos."
            );
        }

        otp.setIntentos(otp.getIntentos() + 1);

        if (!passwordEncoder.matches(
                datos.codigo(),
                otp.getCodigoHash()
        )) {
            if (otp.getIntentos() >= MAX_INTENTOS) {
                otp.setUsado(true);
            }

            otpRepository.saveAndFlush(otp);

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Código incorrecto."
            );
        }

        otp.setUsado(true);
        otpRepository.saveAndFlush(otp);

        String token = nuevoToken();

        SesionUsuario sesion = new SesionUsuario();
        sesion.setUsuario(usuario);
        sesion.setTokenHash(hashToken(token));
        sesion.setCreadoEn(ahora());
        sesion.setVenceEn(ahora().plusHours(8));
        sesion.setRevocada(false);

        sesionRepository.saveAndFlush(sesion);

        return new LoginDto.AccesoRespuesta(
            token,
            "Bearer",
            responderUsuario(usuario)
        );
    }

    @Transactional(readOnly = true)
    public Usuario usuarioDesdeToken(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        SesionUsuario sesion = sesionRepository
            .findByTokenHash(hashToken(token))
            .orElse(null);

        if (sesion == null ||
            sesion.isRevocada() ||
            !ahora().isBefore(sesion.getVenceEn())) {
            return null;
        }

        Usuario usuario = sesion.getUsuario();

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {
            return null;
        }

        return usuario;
    }

    @Transactional(readOnly = true)
    public LoginDto.UsuarioRespuesta perfil(String correo) {

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Sesión no válida."
                )
            );

        return responderUsuario(usuario);
    }

    @Transactional
    public void cerrarSesion(String token) {

        if (token == null || token.isBlank()) {
            return;
        }

        sesionRepository
            .findByTokenHash(hashToken(token))
            .ifPresent(sesion -> {
                sesion.setRevocada(true);
                sesionRepository.save(sesion);
            });
    }
}
