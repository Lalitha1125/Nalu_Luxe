
package com.naluluxe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class DireccionDto {

    private DireccionDto() {}

    public record Guardar(

        @NotBlank(message = "La etiqueta es obligatoria")
        @Size(max = 50)
        String etiqueta,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 100)
        String ciudad,

        @Size(max = 100)
        String localidad,

        @Size(max = 100)
        String barrio,

        @NotBlank(message = "La dirección es obligatoria")
        @Size(max = 200)
        String direccion,

        @Size(max = 300)
        String indicaciones,

        boolean principal
    ) {}

    public record Respuesta(
        Long id,
        String etiqueta,
        String ciudad,
        String localidad,
        String barrio,
        String direccion,
        String indicaciones,
        boolean principal
    ) {}

    public record Mensaje(String mensaje) {}
}
