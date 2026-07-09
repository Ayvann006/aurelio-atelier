-- ============================================
-- SCHEMA V4 — Imágenes editables del sitio
-- (hero, portadas de colecciones, grilla de Instagram)
-- ============================================

CREATE TABLE IF NOT EXISTS configuracion_sitio (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_imagen TEXT,
  portada_novias TEXT,
  portada_quinceaneras TEXT,
  portada_gala TEXT,
  portada_miss TEXT,
  instagram_imagenes TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT configuracion_sitio_single_row CHECK (id = 1)
);

ALTER TABLE configuracion_sitio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuracion_sitio_public_read" ON configuracion_sitio FOR SELECT USING (true);

-- Fila única por defecto (queda vacía hasta que se suban imágenes desde el Admin;
-- mientras tanto el sitio sigue mostrando las imágenes actuales como fallback)
INSERT INTO configuracion_sitio (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
