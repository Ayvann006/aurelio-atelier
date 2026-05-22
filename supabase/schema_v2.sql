-- ============================================
-- SCHEMA V2 — Clientes + campos extras
-- ============================================

-- Tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  provincia TEXT,
  ciudad TEXT,
  direccion TEXT,
  codigo_postal TEXT,
  tipo_evento_habitual TEXT,
  notas TEXT,
  total_citas INTEGER DEFAULT 0,
  total_pedidos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_service_all" ON clientes USING (auth.role() = 'service_role');

-- Agregar cliente_id a citas
ALTER TABLE citas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);

-- Horarios de sábado (bloqueo general, no individual)
-- Los sábados el atelier cierra a las 15hs — se maneja con horarios disponibles

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_citas_cliente_id ON citas(cliente_id);

-- Trigger updated_at en clientes
CREATE TRIGGER clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FICHAS DE CLIENTAS
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_clientas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
  
  -- Datos del proyecto
  tipo_vestido TEXT CHECK (tipo_vestido IN ('novia','15años','gala','reina','alta costura')),
  color_vestido TEXT,
  fecha_entrega DATE,
  estado_proyecto TEXT DEFAULT 'consulta-inicial' CHECK (estado_proyecto IN (
    'consulta-inicial','diseño','presupuesto-enviado','presupuesto-aprobado',
    'en-confeccion','bordado','primera-prueba','ajustes','terminado','entregado'
  )),
  
  -- Medidas (frente)
  busto NUMERIC(5,1),
  bajo_busto NUMERIC(5,1),
  cintura NUMERIC(5,1),
  cadera NUMERIC(5,1),
  largo_delantero NUMERIC(5,1),
  largo_espalda NUMERIC(5,1),
  largo_total NUMERIC(5,1),
  hombros NUMERIC(5,1),
  sisa NUMERIC(5,1),
  
  -- Medidas (brazo)
  brazo NUMERIC(5,1),
  biceps NUMERIC(5,1),
  muneca NUMERIC(5,1),
  
  -- Medidas (falda/pie)
  tiro NUMERIC(5,1),
  largo_falda NUMERIC(5,1),
  altura NUMERIC(5,1),
  talle NUMERIC(5,1),
  taco_zapato NUMERIC(5,1),
  
  -- Medidas espalda
  ancho_espalda NUMERIC(5,1),
  largo_manga NUMERIC(5,1),
  
  -- Notas de medidas
  notas_medidas TEXT,
  
  -- Historial de medidas (JSONB)
  historial_medidas JSONB DEFAULT '[]',
  
  -- Notas del proyecto (JSONB array)
  notas JSONB DEFAULT '[]',
  
  -- Fotos de referencia (URLs)
  fotos_referencia TEXT[] DEFAULT '{}',
  bocetos TEXT[] DEFAULT '{}',
  fotos_prueba TEXT[] DEFAULT '{}',
  
  -- Presupuesto (JSONB)
  presupuesto JSONB DEFAULT NULL,
  
  -- Pagos (JSONB array)
  pagos JSONB DEFAULT '[]',
  
  -- Timeline (JSONB array)
  timeline JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fichas_clientas ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER fichas_updated_at BEFORE UPDATE ON fichas_clientas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
