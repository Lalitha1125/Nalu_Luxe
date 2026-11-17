
package com.naluluxe.controller;

import com.naluluxe.dto.DireccionDto;
import com.naluluxe.service.DireccionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/direcciones")
public class DireccionController {

    private final DireccionService direccionService;

    public DireccionController(
            DireccionService direccionService
    ) {
        this.direccionService = direccionService;
    }

    @GetMapping
    public List<DireccionDto.Respuesta> listar(
            Authentication autenticacion
    ) {
        return direccionService.listar(
            autenticacion.getName()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DireccionDto.Respuesta crear(
            Authentication autenticacion,
            @Valid @RequestBody DireccionDto.Guardar datos
    ) {
        return direccionService.crear(
            autenticacion.getName(),
            datos
        );
    }

    @PutMapping("/{id}")
    public DireccionDto.Respuesta actualizar(
            Authentication autenticacion,
            @PathVariable Long id,
            @Valid @RequestBody DireccionDto.Guardar datos
    ) {
        return direccionService.actualizar(
            autenticacion.getName(),
            id,
            datos
        );
    }

    @PatchMapping("/{id}/principal")
    public DireccionDto.Respuesta establecerPrincipal(
            Authentication autenticacion,
            @PathVariable Long id
    ) {
        return direccionService.establecerPrincipal(
            autenticacion.getName(),
            id
        );
    }

    @DeleteMapping("/{id}")
    public DireccionDto.Mensaje eliminar(
            Authentication autenticacion,
            @PathVariable Long id
    ) {
        direccionService.eliminar(
            autenticacion.getName(),
            id
        );

        return new DireccionDto.Mensaje(
            "Dirección eliminada correctamente."
        );
    }
}
