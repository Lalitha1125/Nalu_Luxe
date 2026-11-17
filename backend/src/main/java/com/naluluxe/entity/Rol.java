
package com.naluluxe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "nombre",
        nullable = false,
        unique = true,
        length = 30
    )
    private String nombre;

    @Column(name = "descripcion", length = 150)
    private String descripcion;

    public Rol() {
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
