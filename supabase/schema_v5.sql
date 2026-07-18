-- ============================================
-- SCHEMA V5 — Panel de cupones + fix funcion faltante
-- ============================================

-- Esta funcion ya se llamaba desde el checkout (src/app/api/checkout/route.ts)
-- pero nunca se habia creado en la base, asi que el limite de usos de los
-- cupones (usos_max) nunca se hacia cumplir realmente.
CREATE OR REPLACE FUNCTION incrementar_uso_cupon(codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE cupones.codigo = incrementar_uso_cupon.codigo;
END;
$$ LANGUAGE plpgsql;
