
package com.naluluxe.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class AdminDto {

    private AdminDto() {
    }

    public record Resumen(
        long totalProductos,
        long totalClientes,
        long totalPedidos,
        BigDecimal valorPedidosRegistrados,
        long productosSinStock
    ) {
    }

    public record Producto(
        Long id,
        String nombre,
        BigDecimal precio,
        int stock
    ) {
    }

    public record ActualizarInventario(
        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal precio,

        @NotNull
        @Min(0)
        Integer stock
    ) {
    }

    public record Pedido(
        Long id,
        String numero,
        LocalDateTime fecha,
        String estado,
        String cliente,
        String correo,
        String direccionEntrega,
        BigDecimal subtotal,
        BigDecimal costoEnvio,
        BigDecimal total,
        List<PedidoDto.Detalle> productos
    ) {
    }

    public record CambiarEstado(
        @NotNull
        @Size(min = 1, max = 30)
        String estado
    ) {
    }

    public record Mensaje(
        String mensaje
    ) {
    }
}
