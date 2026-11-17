
USE nalu_luxe;

-- ===========================================
-- NALÚ LUXE - SESIONES DE USUARIOS
-- ===========================================

CREATE TABLE IF NOT EXISTS sesiones_usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    token_hash CHAR(64) NOT NULL UNIQUE,

    creado_en DATETIME NOT NULL,

    vence_en DATETIME NOT NULL,

    revocada BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_sesiones_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    INDEX idx_sesiones_usuario (usuario_id),
    INDEX idx_sesiones_vencimiento (vence_en)
);
