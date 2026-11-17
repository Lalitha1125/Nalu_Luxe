
package com.naluluxe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class RecuperacionDto {

    private RecuperacionDto() {}

    public record Solicitar(
        @NotBlank
        @Email
        String correo
    ) {}

    public record Restablecer(
        @NotBlank
        @Email
        String correo,

        @NotBlank
        @Pattern(
            regexp = "[0-9]{6}",
            message = "El código debe tener seis dígitos."
        )
        String codigo,

        @NotBlank
        @Size(
            min = 12,
            message = "La contraseña debe tener al menos 12 caracteres."
        )
        String nuevaContrasena
    ) {}

    public record Mensaje(
        String mensaje
    ) {}
}
