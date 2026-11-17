
package com.naluluxe.controller;

import com.naluluxe.dto.CatalogoDto;
import com.naluluxe.service.CatalogoService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/categorias")
    public List<CatalogoDto.CategoriaRespuesta> categorias() {
        return catalogoService.categorias();
    }

    @GetMapping("/productos")
    public List<CatalogoDto.ProductoRespuesta> productos(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String buscar
    ) {
        return catalogoService.productos(categoriaId, buscar);
    }

    @GetMapping("/productos/{id}")
    public CatalogoDto.ProductoRespuesta detalle(
            @PathVariable Long id
    ) {
        return catalogoService.detalle(id);
    }
}
