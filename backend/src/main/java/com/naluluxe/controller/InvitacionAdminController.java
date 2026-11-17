
package com.naluluxe.controller;

import com.naluluxe.dto.InvitacionAdminDto;
import com.naluluxe.service.InvitacionAdminService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class InvitacionAdminController {

    private final InvitacionAdminService servicio;

    public InvitacionAdminController(
            InvitacionAdminService servicio
    ) {
        this.servicio = servicio;
    }

    @PostMapping("/api/admin/invitaciones")
    public InvitacionAdminDto.InvitacionCreada crear(
            Authentication autenticacion,
            @Valid @RequestBody
            InvitacionAdminDto.Crear datos
    ) {
        return servicio.crear(
            autenticacion.getName(),
            datos
        );
    }

    @PostMapping("/api/invitaciones-admin/aceptar")
    public InvitacionAdminDto.Mensaje aceptar(
            Authentication autenticacion,
            @Valid @RequestBody
            InvitacionAdminDto.Aceptar datos
    ) {
        return servicio.aceptar(
            autenticacion.getName(),
            datos
        );
    }
}
