
package com.naluluxe.controller;

import com.naluluxe.dto.AdminCatalogoDto;
import com.naluluxe.service.AdminCatalogoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalogo")
public class AdminCatalogoController {

    private final AdminCatalogoService servicio;

    public AdminCatalogoController(
            AdminCatalogoService servicio
    ) {
        this.servicio = servicio;
    }

    @GetMapping("/categorias")
    public List<AdminCatalogoDto.Categoria> categorias() {
        return servicio.categorias();
    }

    @GetMapping("/productos")
    public List<AdminCatalogoDto.Producto> productos() {
        return servicio.productos();
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminCatalogoDto.Producto crear(
            Authentication autenticacion,
            @Valid @RequestBody
            AdminCatalogoDto.Guardar datos
    ) {
        return servicio.crear(
            autenticacion.getName(),
            datos
        );
    }

    @PutMapping("/productos/{id}")
    public AdminCatalogoDto.Producto actualizar(
            Authentication autenticacion,
            @PathVariable Long id,
            @Valid @RequestBody
            AdminCatalogoDto.Guardar datos
    ) {
        return servicio.actualizar(
            autenticacion.getName(),
            id,
            datos
        );
    }
}
