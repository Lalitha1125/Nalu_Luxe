
package com.naluluxe.controller;

import com.naluluxe.service.ReenvioOtpService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class ReenvioOtpController {

    private final ReenvioOtpService reenvioOtpService;

    public ReenvioOtpController(
            ReenvioOtpService reenvioOtpService
    ) {
        this.reenvioOtpService = reenvioOtpService;
    }

    public record Solicitud(
        @NotBlank
        @Email
        String correo
    ) {}

    public record Respuesta(
        String mensaje
    ) {}

    @PostMapping("/reenviar-registro")
    public Respuesta reenviar(
            @Valid @RequestBody Solicitud solicitud
    ) {
        return new Respuesta(
            reenvioOtpService.reenviarRegistro(
                solicitud.correo()
            )
        );
    }
}
