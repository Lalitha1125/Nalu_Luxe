
package com.naluluxe.dto;

import com.naluluxe.entity.Categoria;
import com.naluluxe.entity.Producto;

import java.math.BigDecimal;

public final class CatalogoDto {

    private CatalogoDto() {
    }

    public record CategoriaRespuesta(
            Long id,
            String nombre,
            String descripcion
    ) {
        public static CategoriaRespuesta desde(Categoria c) {
            return new CategoriaRespuesta(
                    c.getId(),
                    c.getNombre(),
                    c.getDescripcion()
            );
        }
    }

    public record ProductoRespuesta(
            Long id,
            String sku,
            String nombre,
            String descripcion,
            String material,
            String color,
            BigDecimal precio,
            Integer stock,
            String imagenPrincipal,
            boolean destacado,
            CategoriaRespuesta categoria
    ) {
        public static ProductoRespuesta desde(Producto p) {
            return new ProductoRespuesta(
                    p.getId(),
                    p.getSku(),
                    p.getNombre(),
                    p.getDescripcion(),
                    p.getMaterial(),
                    p.getColor(),
                    p.getPrecio(),
                    p.getStock(),
                    p.getImagenPrincipal(),
                    p.isDestacado(),
                    CategoriaRespuesta.desde(p.getCategoria())
            );
        }
    }
}
