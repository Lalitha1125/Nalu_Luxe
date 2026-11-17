
package com.naluluxe.service;

import com.naluluxe.dto.PerfilDto;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;

    public PerfilService(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario buscarUsuario(String correo) {

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "No se encontró una cuenta válida."
                )
            );

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "La cuenta no está habilitada."
            );
        }

        return usuario;
    }

    private PerfilDto.PerfilRespuesta convertir(
            Usuario usuario
    ) {
        return new PerfilDto.PerfilRespuesta(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getTelefono(),
            usuario.getRol().getNombre(),
            usuario.isCorreoVerificado()
        );
    }

    @Transactional(readOnly = true)
    public PerfilDto.PerfilRespuesta consultar(
            String correoAutenticado
    ) {
        Usuario usuario = buscarUsuario(correoAutenticado);

        return convertir(usuario);
    }

    @Transactional
    public PerfilDto.PerfilRespuesta actualizar(
            String correoAutenticado,
            PerfilDto.ActualizarPerfil datos
    ) {
        Usuario usuario = buscarUsuario(correoAutenticado);

        String nombre = datos.nombre().trim();

        if (nombre.length() < 2) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El nombre debe tener al menos dos caracteres."
            );
        }

        String telefono = datos.telefono() == null
            ? ""
            : datos.telefono().trim();

        usuario.setNombre(nombre);

        usuario.setTelefono(
            telefono.isEmpty() ? null : telefono
        );

        Usuario actualizado =
            usuarioRepository.saveAndFlush(usuario);

        return convertir(actualizado);
    }
}
