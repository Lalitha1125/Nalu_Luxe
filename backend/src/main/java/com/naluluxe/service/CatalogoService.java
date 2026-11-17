
package com.naluluxe.service;

import com.naluluxe.dto.CatalogoDto;
import com.naluluxe.repository.CategoriaRepository;
import com.naluluxe.repository.ProductoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogoService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CatalogoService(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository
    ) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<CatalogoDto.CategoriaRespuesta> categorias() {
        return categoriaRepository
                .findByActivaTrueOrderByNombreAsc()
                .stream()
                .map(CatalogoDto.CategoriaRespuesta::desde)
                .toList();
    }

    public List<CatalogoDto.ProductoRespuesta> productos(
            Long categoriaId,
            String busqueda
    ) {
        var productos = categoriaId != null
                ? productoRepository
                    .findByActivoTrueAndCategoriaIdOrderByNombreAsc(
                            categoriaId
                    )
                : busqueda != null && !busqueda.isBlank()
                    ? productoRepository.buscar(busqueda.trim())
                    : productoRepository.findByActivoTrueOrderByNombreAsc();

        String texto = busqueda == null
                ? ""
                : busqueda.trim().toLowerCase(
                        java.util.Locale.ROOT
                );

        return productos.stream()
                .filter(p -> texto.isEmpty()
                        || p.getNombre().toLowerCase(
                                java.util.Locale.ROOT
                        ).contains(texto)
                        || (p.getDescripcion() != null
                            && p.getDescripcion().toLowerCase(
                                    java.util.Locale.ROOT
                            ).contains(texto)))
                .map(CatalogoDto.ProductoRespuesta::desde)
                .toList();
    }

    public CatalogoDto.ProductoRespuesta detalle(Long id) {
        return productoRepository
                .findByIdAndActivoTrue(id)
                .map(CatalogoDto.ProductoRespuesta::desde)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado"
                ));
    }
}
