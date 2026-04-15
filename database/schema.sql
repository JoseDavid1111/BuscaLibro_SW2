DROP VIEW IF EXISTS vista_reporte_mas_vendidos;
DROP VIEW IF EXISTS vista_frecuencia_categorias;

DROP TABLE IF EXISTS detalle_pedidos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS libros CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS autores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('Administrador', 'Vendedor', 'Cliente')) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    contrasena VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE autores (
    id_autor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nacionalidad VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE libros (
    id_libro SERIAL PRIMARY KEY,
    codigo_libro VARCHAR(30) UNIQUE,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_autor INT REFERENCES autores(id_autor) ON DELETE SET NULL,
    id_categoria INT REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    editorial VARCHAR(100),
    anio_publicacion INT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    esta_activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventario (
    id_inventario SERIAL PRIMARY KEY,
    id_libro INT UNIQUE REFERENCES libros(id_libro) ON DELETE CASCADE,
    stock_fisico INT DEFAULT 0 CHECK (stock_fisico >= 0),
    stock_reservado INT DEFAULT 0 CHECK (stock_reservado >= 0),
    ubicacion_pasillo VARCHAR(50),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Procesado', 'Completado', 'Cancelado')),
    precio_total DECIMAL(10,2) DEFAULT 0.0,
    direccion_entrega TEXT,
    archivo_intercambio_json JSONB
);

CREATE TABLE detalle_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_libro INT REFERENCES libros(id_libro),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_historico DECIMAL(10,2) NOT NULL
);

CREATE OR REPLACE VIEW vista_reporte_mas_vendidos AS
SELECT l.titulo, SUM(dp.cantidad) AS total_solicitado, l.isbn
FROM detalle_pedidos dp
JOIN libros l ON dp.id_libro = l.id_libro
JOIN pedidos p ON p.id_pedido = dp.id_pedido
WHERE p.estado <> 'Cancelado'
GROUP BY l.id_libro, l.titulo, l.isbn
ORDER BY total_solicitado DESC;

CREATE OR REPLACE VIEW vista_frecuencia_categorias AS
SELECT c.nombre_categoria, COUNT(dp.id_detalle) AS frecuencia_compra
FROM detalle_pedidos dp
JOIN pedidos p ON p.id_pedido = dp.id_pedido
JOIN libros l ON dp.id_libro = l.id_libro
JOIN categorias c ON l.id_categoria = c.id_categoria
WHERE p.estado <> 'Cancelado'
GROUP BY c.id_categoria, c.nombre_categoria
ORDER BY frecuencia_compra DESC;

CREATE OR REPLACE FUNCTION gestionar_inventario_detalle_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE inventario
        SET stock_fisico = stock_fisico - NEW.cantidad,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE id_libro = NEW.id_libro
          AND stock_fisico - stock_reservado >= NEW.cantidad;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Stock insuficiente para el libro %', NEW.id_libro;
        END IF;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE inventario
        SET stock_fisico = stock_fisico + OLD.cantidad,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE id_libro = OLD.id_libro;

        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventario
        SET stock_fisico = stock_fisico + OLD.cantidad,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE id_libro = OLD.id_libro;

        UPDATE inventario
        SET stock_fisico = stock_fisico - NEW.cantidad,
            ultima_actualizacion = CURRENT_TIMESTAMP
        WHERE id_libro = NEW.id_libro
          AND stock_fisico - stock_reservado >= NEW.cantidad;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Stock insuficiente para el libro %', NEW.id_libro;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_gestionar_inventario_detalle_pedido ON detalle_pedidos;

CREATE TRIGGER tr_gestionar_inventario_detalle_pedido
AFTER INSERT OR UPDATE OR DELETE ON detalle_pedidos
FOR EACH ROW
EXECUTE FUNCTION gestionar_inventario_detalle_pedido();

INSERT INTO usuarios (nombre, rol, correo, telefono, contrasena)
VALUES
    ('Jose David Meneses', 'Administrador', 'jose@buscalibro.local', '3000000001', '123456'),
    ('Thomas Rincon', 'Cliente', 'thomas@buscalibro.local', '3000000002', '123456'),
    ('Mateo Delgado', 'Cliente', 'mateo@buscalibro.local', '3000000003', '123456');

INSERT INTO autores (nombre, nacionalidad, descripcion)
VALUES
    ('Gabriel Garcia Marquez', 'Colombiana', 'Autor referente del realismo magico.'),
    ('Jose Eustasio Rivera', 'Colombiana', 'Autor de literatura clasica colombiana.'),
    ('Harper Lee', 'Estadounidense', 'Autora de novelas clasicas.'),
    ('Yuval Noah Harari', 'Israeli', 'Autor de ensayo e historia.'),
    ('Antoine de Saint-Exupery', 'Francesa', 'Autor de obras infantiles y filosoficas.');

INSERT INTO categorias (nombre_categoria)
VALUES
    ('Novela'),
    ('Clasico'),
    ('Drama'),
    ('Historia'),
    ('Infantil');

INSERT INTO libros (codigo_libro, isbn, titulo, descripcion, id_autor, id_categoria, editorial, anio_publicacion, precio, esta_activo)
VALUES
    ('BL-001', '9780307476463', 'Cien anos de soledad', 'Novela de realismo magico ambientada en Macondo.', 1, 1, 'Sudamericana', 1967, 69000, TRUE),
    ('BL-002', '9789584282696', 'La voragine', 'Clasico colombiano sobre la selva y la explotacion.', 2, 2, 'Panamericana', 1924, 52000, TRUE),
    ('BL-003', '9780061120084', 'Matar a un ruisenor', 'Historia sobre justicia, infancia y prejuicio.', 3, 3, 'Harper Perennial', 1960, 48000, TRUE),
    ('BL-004', '9788491050297', 'Sapiens', 'Ensayo sobre la historia de la humanidad.', 4, 4, 'Debate', 2011, 87000, TRUE),
    ('BL-005', '9786073193006', 'El principito', 'Fabula sobre amistad, amor y sentido de la vida.', 5, 5, 'Salamandra', 1943, 35000, TRUE);

INSERT INTO inventario (id_libro, stock_fisico, stock_reservado, ubicacion_pasillo)
VALUES
    (1, 12, 0, 'A1'),
    (2, 6, 0, 'A2'),
    (3, 9, 0, 'B1'),
    (4, 4, 0, 'C3'),
    (5, 15, 0, 'D2');
