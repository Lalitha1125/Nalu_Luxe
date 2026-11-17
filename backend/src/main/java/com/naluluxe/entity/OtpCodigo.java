
package com.naluluxe.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codigos")
public class OtpCodigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String correo;

    @Column(name = "codigo_hash", nullable = false, length = 255)
    private String codigoHash;

    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(name = "vence_en", nullable = false)
    private LocalDateTime venceEn;

    @Column(nullable = false)
    private int intentos = 0;

    @Column(nullable = false)
    private boolean usado = false;

    @Column(
        name = "creado_en",
        insertable = false,
        updatable = false
    )
    private LocalDateTime creadoEn;

    public OtpCodigo() {
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getCodigoHash() {
        return codigoHash;
    }

    public void setCodigoHash(String codigoHash) {
        this.codigoHash = codigoHash;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getVenceEn() {
        return venceEn;
    }

    public void setVenceEn(LocalDateTime venceEn) {
        this.venceEn = venceEn;
    }

    public int getIntentos() {
        return intentos;
    }

    public void setIntentos(int intentos) {
        this.intentos = intentos;
    }

    public boolean isUsado() {
        return usado;
    }

    public void setUsado(boolean usado) {
        this.usado = usado;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }
}
