-- ============================================
-- SCHEMA V3
-- ============================================

-- Categorías personalizadas de productos
CREATE TABLE IF NOT EXISTS categorias_producto (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categorias_producto ENABLE ROW LEVEL SECURITY;

-- Reviews de productos
CREATE TABLE IF NOT EXISTS reviews_productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  estrellas INTEGER CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews_productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews_productos FOR SELECT USING (activo = true);
CREATE POLICY "reviews_insert" ON reviews_productos FOR INSERT WITH CHECK (true);

-- Columna oculto en pedidos (para soft-hide cancelados)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS oculto BOOLEAN DEFAULT false;

-- Google Analytics ID in env (no DB change needed)
