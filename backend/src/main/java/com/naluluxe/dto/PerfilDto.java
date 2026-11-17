
package com.naluluxe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class PerfilDto {

    private PerfilDto() {
    }

    public record ActualizarPerfil(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(
            max = 120,
            message = "El nombre no puede superar 120 caracteres"
        )
        String nombre,

        @Size(
            max = 25,
            message = "El teléfono no puede superar 25 caracteres"
        )
        String telefono
    ) {
    }

    public record PerfilRespuesta(
        Long id,
        String nombre,
        String correo,
        String telefono,
        String rol,
        boolean correoVerificado
    ) {
    }
}
