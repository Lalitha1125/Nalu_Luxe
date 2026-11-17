
package com.naluluxe.repository;

import com.naluluxe.entity.SesionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SesionUsuarioRepository
        extends JpaRepository<SesionUsuario, Long> {

    Optional<SesionUsuario> findByTokenHash(String tokenHash);
}
