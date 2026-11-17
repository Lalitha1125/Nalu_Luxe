
package com.naluluxe.repository;

import com.naluluxe.entity.Producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository
        extends JpaRepository<Producto, Long> {

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByActivoTrueOrderByNombreAsc();

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByActivoTrueAndCategoriaIdOrderByNombreAsc(
            Long categoriaId
    );

    @EntityGraph(attributePaths = "categoria")
    Optional<Producto> findByIdAndActivoTrue(Long id);

    @EntityGraph(attributePaths = "categoria")
    @Query("""
        SELECT p
        FROM Producto p
        WHERE p.activo = true
        AND (
            LOWER(p.nombre) LIKE LOWER(
                CONCAT('%', :busqueda, '%')
            )
            OR LOWER(COALESCE(p.descripcion, '')) LIKE LOWER(
                CONCAT('%', :busqueda, '%')
            )
        )
        ORDER BY p.nombre ASC
        """)
    List<Producto> buscar(
            @Param("busqueda") String busqueda
    );

    boolean existsBySku(String sku);
}
