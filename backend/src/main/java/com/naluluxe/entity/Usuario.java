
package com.naluluxe.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @Column(
        name = "nombre",
        nullable = false,
        length = 120
    )
    private String nombre;

    @Column(
        name = "correo",
        nullable = false,
        unique = true,
        length = 150
    )
    private String correo;

    @Column(
        name = "password_hash",
        nullable = false,
        length = 255
    )
    private String passwordHash;

    @Column(name = "telefono", length = 25)
    private String telefono;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "correo_verificado", nullable = false)
    private boolean correoVerificado = false;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(
        name = "fecha_registro",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaRegistro;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public Usuario() {
    }

    public Long getId() {
        return id;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public boolean isCorreoVerificado() {
        return correoVerificado;
    }

    public void setCorreoVerificado(boolean correoVerificado) {
        this.correoVerificado = correoVerificado;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public Long getVersion() {
        return version;
    }
}
