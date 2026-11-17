
package com.naluluxe.service;

import com.naluluxe.dto.DireccionDto;
import com.naluluxe.entity.Direccion;
import com.naluluxe.entity.Usuario;
import com.naluluxe.repository.DireccionRepository;
import com.naluluxe.repository.UsuarioRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;

    public DireccionService(
            DireccionRepository direccionRepository,
            UsuarioRepository usuarioRepository,
            EntityManager entityManager
    ) {
        this.direccionRepository = direccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.entityManager = entityManager;
    }

    private Usuario buscarUsuario(String correo) {

        Usuario usuario = usuarioRepository
            .findByCorreoIgnoreCase(correo)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "La sesión no corresponde a un usuario válido."
                )
            );

        if (!usuario.isActivo() ||
            !usuario.isCorreoVerificado()) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Tu cuenta no está habilitada."
            );
        }

        return usuario;
    }

    private Usuario bloquearUsuario(String correo) {
        Usuario usuario = buscarUsuario(correo);

        // Serializa las modificaciones de direcciones
        // del mismo cliente dentro de MySQL.
        entityManager.lock(
            usuario,
            LockModeType.PESSIMISTIC_WRITE
        );

        return usuario;
    }

    private Direccion buscarPropia(
            Long id,
            Long usuarioId
    ) {
        return direccionRepository
            .findByIdAndUsuarioId(id, usuarioId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Dirección no encontrada."
                )
            );
    }

    private List<Direccion> direccionesDe(Long usuarioId) {
        return direccionRepository
            .findByUsuarioIdOrderByPrincipalDescIdDesc(
                usuarioId
            );
    }

    private DireccionDto.Respuesta convertir(Direccion d) {
        return new DireccionDto.Respuesta(
            d.getId(),
            d.getEtiqueta(),
            d.getCiudad(),
            d.getLocalidad(),
            d.getBarrio(),
            d.getDireccion(),
            d.getIndicaciones(),
            d.isPrincipal()
        );
    }

    private String textoOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private void asignarDatos(
            Direccion direccion,
            DireccionDto.Guardar datos
    ) {
        direccion.setEtiqueta(datos.etiqueta().trim());
        direccion.setCiudad(datos.ciudad().trim());

        direccion.setLocalidad(
            textoOpcional(datos.localidad())
        );

        direccion.setBarrio(
            textoOpcional(datos.barrio())
        );

        direccion.setDireccion(
            datos.direccion().trim()
        );

        direccion.setIndicaciones(
            textoOpcional(datos.indicaciones())
        );
    }

    private void quitarPrincipales(
            List<Direccion> direcciones
    ) {
        for (Direccion direccion : direcciones) {
            direccion.setPrincipal(false);
        }

        direccionRepository.saveAll(direcciones);
        direccionRepository.flush();
    }

    @Transactional(readOnly = true)
    public List<DireccionDto.Respuesta> listar(
            String correo
    ) {
        Usuario usuario = buscarUsuario(correo);

        return direccionesDe(usuario.getId())
            .stream()
            .map(this::convertir)
            .toList();
    }

    @Transactional
    public DireccionDto.Respuesta crear(
            String correo,
            DireccionDto.Guardar datos
    ) {
        Usuario usuario = bloquearUsuario(correo);

        List<Direccion> existentes =
            direccionesDe(usuario.getId());

        boolean principal =
            existentes.isEmpty() || datos.principal();

        if (principal) {
            quitarPrincipales(existentes);
        }

        Direccion direccion = new Direccion();

        direccion.setUsuario(usuario);
        asignarDatos(direccion, datos);
        direccion.setPrincipal(principal);

        Direccion guardada =
            direccionRepository.saveAndFlush(direccion);

        return convertir(guardada);
    }

    @Transactional
    public DireccionDto.Respuesta actualizar(
            String correo,
            Long id,
            DireccionDto.Guardar datos
    ) {
        Usuario usuario = bloquearUsuario(correo);

        Direccion direccion = buscarPropia(
            id,
            usuario.getId()
        );

        List<Direccion> existentes =
            direccionesDe(usuario.getId());

        boolean eraPrincipal = direccion.isPrincipal();

        asignarDatos(direccion, datos);

        if (datos.principal()) {

            quitarPrincipales(existentes);
            direccion.setPrincipal(true);

        } else if (eraPrincipal) {

            Direccion otra = existentes.stream()
                .filter(d -> !d.getId().equals(id))
                .findFirst()
                .orElse(null);

            if (otra != null) {
                direccion.setPrincipal(false);
                otra.setPrincipal(true);
                direccionRepository.save(otra);
            } else {
                // La única dirección sigue siendo principal.
                direccion.setPrincipal(true);
            }

        } else {
            direccion.setPrincipal(false);
        }

        Direccion guardada =
            direccionRepository.saveAndFlush(direccion);

        return convertir(guardada);
    }

    @Transactional
    public DireccionDto.Respuesta establecerPrincipal(
            String correo,
            Long id
    ) {
        Usuario usuario = bloquearUsuario(correo);

        Direccion seleccionada = buscarPropia(
            id,
            usuario.getId()
        );

        List<Direccion> existentes =
            direccionesDe(usuario.getId());

        quitarPrincipales(existentes);

        seleccionada.setPrincipal(true);

        return convertir(
            direccionRepository.saveAndFlush(
                seleccionada
            )
        );
    }

    @Transactional
    public void eliminar(
            String correo,
            Long id
    ) {
        Usuario usuario = bloquearUsuario(correo);

        Direccion direccion = buscarPropia(
            id,
            usuario.getId()
        );

        boolean eraPrincipal = direccion.isPrincipal();

        direccionRepository.delete(direccion);
        direccionRepository.flush();

        if (eraPrincipal) {
            List<Direccion> restantes =
                direccionesDe(usuario.getId());

            if (!restantes.isEmpty()) {
                Direccion nuevaPrincipal = restantes.get(0);
                nuevaPrincipal.setPrincipal(true);
                direccionRepository.save(nuevaPrincipal);
            }
        }
    }
}
