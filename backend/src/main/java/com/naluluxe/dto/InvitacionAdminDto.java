
package com.naluluxe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class InvitacionAdminDto {

    private InvitacionAdminDto() {}

    public record Crear(
        @NotBlank
        @Email
        @Size(max = 150)
        String correo
    ) {}

    public record Aceptar(
        @NotBlank
        String token
    ) {}

    public record InvitacionCreada(
        String mensaje,
        String correo,
        String token,
        LocalDateTime venceEn
    ) {}

    public record Mensaje(String mensaje) {}
}
