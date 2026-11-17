
package com.naluluxe.controller;

import com.naluluxe.dto.PerfilDto;
import com.naluluxe.service.PerfilService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(
            PerfilService perfilService
    ) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public PerfilDto.PerfilRespuesta consultar(
            Authentication autenticacion
    ) {
        return perfilService.consultar(
            autenticacion.getName()
        );
    }

    @PutMapping
    public PerfilDto.PerfilRespuesta actualizar(
            Authentication autenticacion,

            @Valid
            @RequestBody
            PerfilDto.ActualizarPerfil datos
    ) {
        return perfilService.actualizar(
            autenticacion.getName(),
            datos
        );
    }
}
