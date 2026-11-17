
package com.naluluxe.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public final class AdminCatalogoDto {

    private AdminCatalogoDto() {}

    public record Categoria(
        Long id,
        String nombre
    ) {}

    public record Producto(
        Long id,
        Long categoriaId,
        String categoria,
        String sku,
        String nombre,
        String descripcion,
        String material,
        String color,
        BigDecimal precio,
        Integer stock,
        String imagenPrincipal,
        boolean destacado,
        boolean activo,
        Long version
    ) {}

    public record Guardar(
        @NotNull
        @Positive
        Long categoriaId,

        @NotBlank
        @Size(max = 40)
        String sku,

        @NotBlank
        @Size(max = 150)
        String nombre,

        String descripcion,

        @Size(max = 100)
        String material,

        @Size(max = 60)
        String color,

        @NotNull
        @DecimalMin(value = "0.01")
        @Digits(integer = 10, fraction = 2)
        BigDecimal precio,

        @NotNull
        @Min(0)
        Integer stock,

        @Size(max = 500)
        String imagenPrincipal,

        boolean destacado,
        boolean activo,

        Long version
    ) {}

    public record Mensaje(String mensaje) {}
}
