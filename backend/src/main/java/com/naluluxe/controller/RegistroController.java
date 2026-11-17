
package com.naluluxe.controller;

import com.naluluxe.dto.RegistroDto;
import com.naluluxe.service.RegistroService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(
            RegistroService registroService
    ) {
        this.registroService = registroService;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroDto.MensajeRespuesta registrar(
            @Valid
            @RequestBody
            RegistroDto.SolicitudRegistro solicitud
    ) {
        return registroService.registrar(solicitud);
    }

    @PostMapping("/verificar-correo")
    public RegistroDto.MensajeRespuesta verificar(
            @Valid
            @RequestBody
            RegistroDto.VerificarCorreo solicitud
    ) {
        return registroService.verificar(solicitud);
    }
}
