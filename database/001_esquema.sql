
CREATE DATABASE IF NOT EXISTS nalu_luxe
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nalu_luxe;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

-- 2. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rol_id BIGINT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(25),
    foto_url VARCHAR(500),
    correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- 3. DIRECCIONES
CREATE TABLE IF NOT EXISTS direcciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    etiqueta VARCHAR(50) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    localidad VARCHAR(100),
    barrio VARCHAR(100),
    direccion VARCHAR(200) NOT NULL,
    indicaciones VARCHAR(300),
    principal BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_direcciones_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 4. CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    sku VARCHAR(40) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    material VARCHAR(100),
    color VARCHAR(60),
    precio DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_principal VARCHAR(500),
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT chk_productos_precio CHECK (precio > 0),
    CONSTRAINT chk_productos_stock CHECK (stock >= 0),

    CONSTRAINT fk_productos_categorias
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- 6. IMÁGENES ADICIONALES DE PRODUCTOS
CREATE TABLE IF NOT EXISTS producto_imagenes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    descripcion VARCHAR(200),
    orden INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_imagenes_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON DELETE CASCADE
);

-- 7. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    numero VARCHAR(40) NOT NULL UNIQUE,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO',
    direccion_entrega VARCHAR(400) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    costo_envio DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    observaciones VARCHAR(500),

    CONSTRAINT chk_pedidos_total CHECK (total >= 0),

    CONSTRAINT fk_pedidos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 8. DETALLES DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0),

    CONSTRAINT fk_detalles_pedidos
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),

    CONSTRAINT fk_detalles_productos
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- 9. CÓDIGOS DE VERIFICACIÓN OTP
CREATE TABLE IF NOT EXISTS otp_codigos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    correo VARCHAR(150) NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    vence_en DATETIME NOT NULL,
    intentos INT NOT NULL DEFAULT 0,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 10. INVITACIONES ADMINISTRATIVAS
CREATE TABLE IF NOT EXISTS invitaciones_admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(150) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    invitado_por BIGINT NOT NULL,
    vence_en DATETIME NOT NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invitaciones_admin
    FOREIGN KEY (invitado_por) REFERENCES usuarios(id)
);

-- 11. CONSULTAS DE CLIENTES
CREATE TABLE IF NOT EXISTS consultas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_consultas_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 12. AUDITORÍA
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    entidad_id BIGINT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detalle VARCHAR(500),

    CONSTRAINT fk_auditoria_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ÍNDICES
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_otp_correo_tipo ON otp_codigos(correo, tipo);
CREATE INDEX idx_direcciones_usuario ON direcciones(usuario_id);

-- ROLES INICIALES
INSERT INTO roles (nombre, descripcion)
VALUES
('CLIENTE', 'Cliente de la tienda virtual'),
('ADMIN', 'Administrador autorizado del sistema')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- CATEGORÍAS INICIALES
INSERT INTO categorias (nombre, descripcion)
VALUES
('Anillos', 'Anillos elegantes para cada ocasión'),
('Aretes', 'Aretes delicados y modernos'),
('Collares', 'Collares y cadenas de diferentes estilos'),
('Pulseras', 'Pulseras y accesorios para complementar tu estilo')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
