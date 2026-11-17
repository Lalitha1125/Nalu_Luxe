
package com.naluluxe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public final class LoginDto {

    private LoginDto() {}

    public record Iniciar(
        @NotBlank @Email String correo,
        @NotBlank String contrasena
    ) {}

    public record Verificar(
        @NotBlank @Email String correo,

        @NotBlank
        @Pattern(regexp = "[0-9]{6}")
        String codigo
    ) {}

    public record Mensaje(String mensaje) {}

    public record UsuarioRespuesta(
        Long id,
        String nombre,
        String correo,
        String rol
    ) {}

    public record AccesoRespuesta(
        String token,
        String tipo,
        UsuarioRespuesta usuario
    ) {}
}
