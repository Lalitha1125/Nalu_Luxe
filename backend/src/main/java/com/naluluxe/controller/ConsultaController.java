
package com.naluluxe.controller;

import com.naluluxe.dto.ConsultaDto;
import com.naluluxe.service.ConsultaService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(
            ConsultaService consultaService
    ) {
        this.consultaService = consultaService;
    }

    @PostMapping("/consultas")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaDto.Mensaje crear(
            @Valid @RequestBody
            ConsultaDto.Crear datos
    ) {
        return consultaService.crear(datos);
    }

    @GetMapping("/admin/consultas")
    public List<ConsultaDto.Respuesta> listar() {
        return consultaService.listar();
    }

    @PatchMapping("/admin/consultas/{id}/estado")
    public ConsultaDto.Mensaje cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody
            ConsultaDto.CambiarEstado datos
    ) {
        return consultaService.cambiarEstado(id, datos);
    }
}
