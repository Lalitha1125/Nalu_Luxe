
package com.naluluxe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ConsultaDto {

    private ConsultaDto() {}

    public record Crear(
        @NotBlank
        @Size(max = 120)
        String nombre,

        @NotBlank
        @Email
        @Size(max = 150)
        String correo,

        @NotBlank
        @Size(max = 150)
        String asunto,

        @NotBlank
        @Size(max = 3000)
        String mensaje
    ) {}

    public record CambiarEstado(
        @NotBlank
        String estado
    ) {}

    public record Respuesta(
        Long id,
        String nombre,
        String correo,
        String asunto,
        String mensaje,
        String estado,
        LocalDateTime fecha
    ) {}

    public record Mensaje(String mensaje) {}
}
