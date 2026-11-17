
package com.naluluxe.controller;

import com.naluluxe.dto.PedidoDto;
import com.naluluxe.service.PedidoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoDto.Respuesta crear(
            Authentication autenticacion,
            @Valid @RequestBody PedidoDto.Crear datos
    ) {
        return pedidoService.crear(
            autenticacion.getName(),
            datos
        );
    }

    @GetMapping
    public List<PedidoDto.Respuesta> listar(
            Authentication autenticacion
    ) {
        return pedidoService.listar(
            autenticacion.getName()
        );
    }

    @GetMapping("/{id}")
    public PedidoDto.Respuesta consultar(
            Authentication autenticacion,
            @PathVariable Long id
    ) {
        return pedidoService.consultar(
            autenticacion.getName(),
            id
        );
    }
}
