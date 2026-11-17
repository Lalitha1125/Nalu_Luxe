
package com.naluluxe.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class PedidoDto {

    private PedidoDto() {}

    public record Item(
        @NotNull @Positive Long productoId,
        @Min(1) @Max(99) int cantidad
    ) {}

    public record Crear(
        @NotNull Long direccionId,
        @NotEmpty List<@Valid Item> productos,
        @Size(max = 500) String observaciones
    ) {}

    public record Detalle(
        Long productoId,
        String nombreProducto,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
    ) {}

    public record Respuesta(
        Long id,
        String numero,
        LocalDateTime fecha,
        String estado,
        String direccionEntrega,
        BigDecimal subtotal,
        BigDecimal costoEnvio,
        BigDecimal total,
        String observaciones,
        List<Detalle> productos
    ) {}
}
