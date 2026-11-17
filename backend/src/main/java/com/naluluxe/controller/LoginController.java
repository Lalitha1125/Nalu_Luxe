
package com.naluluxe.controller;

import com.naluluxe.dto.LoginDto;
import com.naluluxe.service.LoginService;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public LoginDto.Mensaje iniciar(
            @Valid @RequestBody LoginDto.Iniciar datos
    ) {
        return loginService.iniciar(datos);
    }

    @PostMapping("/verificar-login")
    public LoginDto.AccesoRespuesta verificar(
            @Valid @RequestBody LoginDto.Verificar datos
    ) {
        return loginService.verificar(datos);
    }

    @GetMapping("/me")
    public LoginDto.UsuarioRespuesta yo(
            Authentication autenticacion
    ) {
        return loginService.perfil(
            autenticacion.getName()
        );
    }

    @PostMapping("/logout")
    public LoginDto.Mensaje cerrar(
            @RequestHeader(
                value = HttpHeaders.AUTHORIZATION,
                required = false
            ) String autorizacion
    ) {
        if (autorizacion != null &&
            autorizacion.startsWith("Bearer ")) {
            loginService.cerrarSesion(
                autorizacion.substring(7)
            );
        }

        return new LoginDto.Mensaje(
            "Sesión cerrada correctamente."
        );
    }
}
