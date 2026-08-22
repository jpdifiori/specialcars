-- ==============================================================================
-- MIGRACIÓN: Agregar origen (source) a Vehículos Buscados (Admin vs Web/Landing)
-- ==============================================================================

-- 1. Agregar columna 'source' a wanted_vehicles
ALTER TABLE wanted_vehicles 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'ADMIN';

-- 2. Restricción para asegurar valores válidos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'wanted_vehicles_source_check'
    ) THEN
        ALTER TABLE wanted_vehicles 
        ADD CONSTRAINT wanted_vehicles_source_check 
        CHECK (source IN ('ADMIN', 'WEB'));
    END IF;
END $$;

-- 3. Índice para filtrado veloz por origen
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_source ON wanted_vehicles(source) WHERE is_deleted = FALSE;

-- 4. Comentario explicativo
COMMENT ON COLUMN wanted_vehicles.source IS 'Origen del pedido de búsqueda: ADMIN (cargado por el concesionario) o WEB (solicitud desde la Landing Page)';
