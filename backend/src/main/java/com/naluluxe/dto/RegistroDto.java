
package com.naluluxe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class RegistroDto {

    private RegistroDto() {
    }

    public record SolicitudRegistro(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120)
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(
            min = 12,
            max = 72,
            message = "La contraseña debe tener entre 12 y 72 caracteres"
        )
        String contrasena,

        @Size(max = 25)
        String telefono
    ) {
    }

    public record VerificarCorreo(

        @NotBlank
        @Email
        String correo,

        @NotBlank
        @Pattern(
            regexp = "[0-9]{6}",
            message = "El código debe tener seis dígitos"
        )
        String codigo
    ) {
    }

    public record MensajeRespuesta(
        String mensaje
    ) {
    }
}
