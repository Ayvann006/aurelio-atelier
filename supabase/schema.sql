-- ============================================
-- AURELIO MARTÍNEZ ATELIER — DATABASE SCHEMA
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(12,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('batas','tiaras','tocados','accesorios')),
  imagenes TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  variantes JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero TEXT UNIQUE,
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL,
  descuento NUMERIC(12,2) DEFAULT 0,
  cupon_codigo TEXT,
  total NUMERIC(12,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','pagado','preparando','enviado','entregado','cancelado')),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  mp_status TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cupones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  descuento_pct INTEGER CHECK (descuento_pct BETWEEN 1 AND 100),
  descuento_fijo NUMERIC(12,2),
  usos_max INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  vence_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE citas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('novia','quinceañera','gala','miss','otro')),
  tipo_cita TEXT NOT NULL DEFAULT 'primera-entrevista'
    CHECK (tipo_cita IN ('primera-entrevista','prueba','ajuste','entrega')),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'confirmada'
    CHECK (estado IN ('confirmada','completada','cancelada','no-asistio')),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  sena_pagada BOOLEAN DEFAULT false,
  monto_sena NUMERIC(12,2) DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE horarios_bloqueados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  todo_el_dia BOOLEAN DEFAULT false,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE SEQUENCE IF NOT EXISTS pedido_seq START 1;

CREATE OR REPLACE FUNCTION set_numero_pedido_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero = 'AM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('pedido_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_numero_pedido BEFORE INSERT ON pedidos FOR EACH ROW EXECUTE FUNCTION set_numero_pedido_fn();

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_public_read" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "pedidos_insert_public" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "citas_insert_public" ON citas FOR INSERT WITH CHECK (true);
CREATE POLICY "citas_select_public" ON citas FOR SELECT USING (true);
CREATE POLICY "horarios_public_read" ON horarios_bloqueados FOR SELECT USING (true);

INSERT INTO productos (nombre,descripcion,precio,categoria,stock,slug,activo,destacado,imagenes) VALUES
('Bata Cristales Plata','Bata de satén con bordado de cristales. Ideal para preparación.',42000,'batas',8,'bata-cristales-plata',true,true,'{}'),
('Tiara Perlas Reales','Tiara artesanal con perlas y baño en oro 18k. Edición limitada.',55000,'tiaras',5,'tiara-perlas-reales',true,true,'{}'),
('Tocado Floral Editorial','Tocado con flores bordadas a mano. Ajustable.',38000,'tocados',10,'tocado-floral-editorial',true,false,'{}'),
('Guantes Cristales Negros','Guantes largos con cristales cosidos a mano.',28000,'accesorios',12,'guantes-cristales-negros',true,false,'{}');

INSERT INTO cupones (codigo,descuento_pct,usos_max,activo) VALUES
('NOVIA10',10,50,true),('QUINCE15',15,30,true);

-- ============================================
-- TABLA: colecciones (galería de vestidos)
-- ============================================
CREATE TABLE IF NOT EXISTS colecciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_principal TEXT NOT NULL,
  imagenes TEXT[] DEFAULT '{}',
  categoria TEXT NOT NULL CHECK (categoria IN ('novias','quinceaneras','gala','miss')),
  año INTEGER DEFAULT 2025,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS provincia_envio TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ciudad_envio TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_envio TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS codigo_postal TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS costo_envio NUMERIC(12,2) DEFAULT 0;

ALTER TABLE colecciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "colecciones_public_read" ON colecciones FOR SELECT USING (activo = true);

-- Insertar ejemplos
INSERT INTO colecciones (nombre, descripcion, imagen_principal, categoria, destacado) VALUES
('Sirena Aquamarina', 'Vestido sirena con escote corazón y detalles en cristal.', '/images/cat-quinces.jpg', 'quinceaneras', true),
('Diamante Rosado', 'Vestido con cristales bordados a mano en tono rosado.', '/images/cat-miss.jpg', 'miss', true),
('Rojo Escarlata', 'Vestido rojo con corte asimétrico y pedrería en cuello.', '/images/hero.jpg', 'gala', false),
('Princesa Dorada', 'Vestido ball gown en tono dorado con tul brillante.', '/images/cat-quinces.jpg', 'quinceaneras', false);
