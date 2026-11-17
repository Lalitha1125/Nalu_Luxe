
USE nalu_luxe;

-- ==============================================
-- NALU LUXE - CATALOGO INICIAL
-- 10 ANILLOS, 10 ARETES, 10 COLLARES, 10 PULSERAS
-- Valores ilustrativos en pesos colombianos
-- ==============================================

INSERT INTO productos
(categoria_id, sku, nombre, descripcion, material,
 color, precio, stock, imagen_principal, destacado)
VALUES

-- ANILLOS (10)
((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-001','Anillo Aurora',
 'Anillo delicado con detalle brillante central.',
 'Acero inoxidable','Dorado',45000,15,
 '/joyas/anillos/anillo-01.webp',1),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-002','Anillo Corazón',
 'Diseño romántico con corazón decorativo.',
 'Acero inoxidable','Dorado',39000,18,
 '/joyas/anillos/anillo-02.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-003','Anillo Perla',
 'Diseño minimalista con perla decorativa.',
 'Acero inoxidable','Dorado',42000,14,
 '/joyas/anillos/anillo-03.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-004','Anillo Flor',
 'Pieza femenina con detalle floral.',
 'Aleación de joyería','Dorado',35000,20,
 '/joyas/anillos/anillo-04.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-005','Anillo Estrella',
 'Diseño inspirado en pequeños destellos.',
 'Acero inoxidable','Dorado',38000,16,
 '/joyas/anillos/anillo-05.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-006','Anillo Infinito',
 'Anillo con símbolo de infinito.',
 'Acero inoxidable','Plateado',40000,12,
 '/joyas/anillos/anillo-06.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-007','Anillo Celestial',
 'Diseño delicado inspirado en la luna.',
 'Acero inoxidable','Dorado',46000,13,
 '/joyas/anillos/anillo-07.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-008','Anillo Esencia',
 'Anillo sencillo para uso diario.',
 'Acero inoxidable','Dorado',32000,21,
 '/joyas/anillos/anillo-08.webp',0),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-009','Anillo Destello',
 'Pieza decorativa con acabado brillante.',
 'Aleación de joyería','Dorado',49000,10,
 '/joyas/anillos/anillo-09.webp',1),

((SELECT id FROM categorias WHERE nombre='Anillos'),
 'ANI-010','Anillo Elegance',
 'Diseño clásico de estilo refinado.',
 'Acero inoxidable','Dorado',52000,11,
 '/joyas/anillos/anillo-10.webp',0),

-- ARETES (10)
((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-001','Aretes Perla',
 'Aretes elegantes con perlas decorativas.',
 'Acero inoxidable','Dorado',42000,20,
 '/joyas/aretes/arete-01.webp',1),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-002','Aretes Corazón',
 'Diseño romántico en forma de corazón.',
 'Acero inoxidable','Dorado',35000,18,
 '/joyas/aretes/arete-02.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-003','Aretes Estrella',
 'Aretes delicados con diseño de estrella.',
 'Acero inoxidable','Dorado',36000,16,
 '/joyas/aretes/arete-03.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-004','Aretes Flor',
 'Aretes con detalles florales.',
 'Aleación de joyería','Dorado',39000,17,
 '/joyas/aretes/arete-04.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-005','Aretes Luna',
 'Diseño inspirado en la luna.',
 'Acero inoxidable','Dorado',38000,14,
 '/joyas/aretes/arete-05.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-006','Aretes Gota',
 'Pieza alargada en forma de gota.',
 'Acero inoxidable','Dorado',45000,13,
 '/joyas/aretes/arete-06.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-007','Aretes Brillo',
 'Aretes pequeños con detalle brillante.',
 'Aleación de joyería','Plateado',33000,19,
 '/joyas/aretes/arete-07.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-008','Aretes Encanto',
 'Diseño moderno y delicado.',
 'Acero inoxidable','Dorado',41000,15,
 '/joyas/aretes/arete-08.webp',0),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-009','Aretes Aurora',
 'Aretes de estilo elegante para ocasiones especiales.',
 'Acero inoxidable','Dorado',48000,12,
 '/joyas/aretes/arete-09.webp',1),

((SELECT id FROM categorias WHERE nombre='Aretes'),
 'ARE-010','Aretes Clásicos',
 'Diseño sencillo y versátil.',
 'Acero inoxidable','Plateado',32000,22,
 '/joyas/aretes/arete-10.webp',0),

-- COLLARES (10)
((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-001','Collar Corazón',
 'Collar delicado con dije de corazón.',
 'Acero inoxidable','Dorado',58000,16,
 '/joyas/collares/collar-01.webp',1),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-002','Collar Luna',
 'Cadena con dije de luna.',
 'Acero inoxidable','Dorado',62000,14,
 '/joyas/collares/collar-02.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-003','Collar Estrella',
 'Collar fino con detalle de estrella.',
 'Acero inoxidable','Dorado',55000,18,
 '/joyas/collares/collar-03.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-004','Collar Perla',
 'Diseño clásico con perla decorativa.',
 'Acero inoxidable','Dorado',65000,12,
 '/joyas/collares/collar-04.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-005','Collar Esencia',
 'Cadena minimalista para uso diario.',
 'Acero inoxidable','Plateado',49000,20,
 '/joyas/collares/collar-05.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-006','Collar Aurora',
 'Collar con dije brillante central.',
 'Aleación de joyería','Dorado',69000,11,
 '/joyas/collares/collar-06.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-007','Collar Flor',
 'Collar de estilo floral y delicado.',
 'Acero inoxidable','Dorado',57000,15,
 '/joyas/collares/collar-07.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-008','Collar Infinito',
 'Cadena con símbolo de infinito.',
 'Acero inoxidable','Dorado',59000,13,
 '/joyas/collares/collar-08.webp',0),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-009','Collar Brillante',
 'Collar elegante para ocasiones especiales.',
 'Acero inoxidable','Dorado',75000,10,
 '/joyas/collares/collar-09.webp',1),

((SELECT id FROM categorias WHERE nombre='Collares'),
 'COL-010','Collar Elegance',
 'Diseño refinado con acabado delicado.',
 'Acero inoxidable','Dorado',72000,12,
 '/joyas/collares/collar-10.webp',0),

-- PULSERAS (10)
((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-001','Pulsera Elegancia',
 'Pulsera fina con detalles brillantes.',
 'Acero inoxidable','Dorado',52000,15,
 '/joyas/pulseras/pulsera-01.webp',1),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-002','Pulsera Perlas',
 'Pulsera con pequeñas perlas decorativas.',
 'Aleación de joyería','Dorado',49000,18,
 '/joyas/pulseras/pulsera-02.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-003','Pulsera Corazón',
 'Pulsera con dije romántico.',
 'Acero inoxidable','Dorado',45000,17,
 '/joyas/pulseras/pulsera-03.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-004','Pulsera Estrella',
 'Pulsera de diseño celestial.',
 'Acero inoxidable','Plateado',43000,16,
 '/joyas/pulseras/pulsera-04.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-005','Pulsera Luna',
 'Pulsera fina con detalle de luna.',
 'Acero inoxidable','Dorado',47000,14,
 '/joyas/pulseras/pulsera-05.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-006','Pulsera Encanto',
 'Pulsera delicada de estilo moderno.',
 'Acero inoxidable','Dorado',51000,13,
 '/joyas/pulseras/pulsera-06.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-007','Pulsera Aurora',
 'Pulsera con acabado luminoso.',
 'Aleación de joyería','Dorado',55000,12,
 '/joyas/pulseras/pulsera-07.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-008','Pulsera Infinito',
 'Pulsera con símbolo de infinito.',
 'Acero inoxidable','Plateado',46000,19,
 '/joyas/pulseras/pulsera-08.webp',0),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-009','Pulsera Destello',
 'Pulsera de estilo elegante con brillo decorativo.',
 'Acero inoxidable','Dorado',59000,11,
 '/joyas/pulseras/pulsera-09.webp',1),

((SELECT id FROM categorias WHERE nombre='Pulseras'),
 'PUL-010','Pulsera Clásica',
 'Pulsera sencilla y versátil.',
 'Acero inoxidable','Dorado',41000,22,
 '/joyas/pulseras/pulsera-10.webp',0)

ON DUPLICATE KEY UPDATE sku = sku;
