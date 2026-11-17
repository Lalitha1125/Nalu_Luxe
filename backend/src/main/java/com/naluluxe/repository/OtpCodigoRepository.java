
package com.naluluxe.repository;

import com.naluluxe.entity.OtpCodigo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpCodigoRepository
        extends JpaRepository<OtpCodigo, Long> {

    Optional<OtpCodigo>
    findFirstByCorreoIgnoreCaseAndTipoAndUsadoFalseOrderByIdDesc(
        String correo,
        String tipo
    );
}
