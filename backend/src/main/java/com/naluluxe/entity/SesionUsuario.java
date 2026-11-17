
package com.naluluxe.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_usuario")
public class SesionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", nullable = false,
            unique = true, length = 64)
    private String tokenHash;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "vence_en", nullable = false)
    private LocalDateTime venceEn;

    @Column(nullable = false)
    private boolean revocada = false;

    public SesionUsuario() {}

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getVenceEn() {
        return venceEn;
    }

    public void setVenceEn(LocalDateTime venceEn) {
        this.venceEn = venceEn;
    }

    public boolean isRevocada() {
        return revocada;
    }

    public void setRevocada(boolean revocada) {
        this.revocada = revocada;
    }
}
