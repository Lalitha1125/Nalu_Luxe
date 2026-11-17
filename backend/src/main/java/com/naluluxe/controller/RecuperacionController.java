
package com.naluluxe.controller;

import com.naluluxe.dto.RecuperacionDto;
import com.naluluxe.service.RecuperacionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RecuperacionController {

    private final RecuperacionService recuperacionService;

    public RecuperacionController(
            RecuperacionService recuperacionService
    ) {
        this.recuperacionService = recuperacionService;
    }

    @PostMapping("/recuperar-clave")
    public RecuperacionDto.Mensaje solicitar(
            @Valid @RequestBody
            RecuperacionDto.Solicitar datos
    ) {
        return recuperacionService.solicitar(datos);
    }

    @PostMapping("/restablecer-clave")
    public RecuperacionDto.Mensaje restablecer(
            @Valid @RequestBody
            RecuperacionDto.Restablecer datos
    ) {
        return recuperacionService.restablecer(datos);
    }
}
