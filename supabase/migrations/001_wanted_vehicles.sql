-- ==============================================================================
-- MIGRACIÓN: Módulo Vehículos Buscados (Wanted Vehicles & Buyer Matching Engine)
-- ==============================================================================

-- 1. SECUENCIA PARA CÓDIGO DE BÚSQUEDA (BUSQ-1001, BUSQ-1002...)
CREATE SEQUENCE IF NOT EXISTS wanted_vehicles_seq START WITH 1001;

-- 2. TABLA DE VEHÍCULOS BUSCADOS POR CLIENTES
CREATE TABLE IF NOT EXISTS wanted_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL DEFAULT ('BUSQ-' || LPAD(nextval('wanted_vehicles_seq')::text, 4, '0')),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    -- Criterios Principales del Vehículo
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    version VARCHAR(100),
    year_min INT,
    year_max INT,
    max_mileage INT,
    fuel_type fuel_type,
    transmission transmission_type,
    body_type vehicle_body_type,
    preferred_color VARCHAR(50),
    max_budget BIGINT NOT NULL DEFAULT 0,
    
    -- Flags de Flexibilidad Comercial (Cruciales para el Motor de Coincidencias)
    accepts_similar_model BOOLEAN NOT NULL DEFAULT TRUE,
    accepts_different_version BOOLEAN NOT NULL DEFAULT TRUE,
    accepts_nearby_year BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Permuta / Toma de Usado
    has_trade_in BOOLEAN NOT NULL DEFAULT FALSE,
    trade_in_details TEXT,
    
    -- Gestión de Estado y Prioridad Comercial
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(30) NOT NULL DEFAULT 'SEARCHING' CHECK (status IN ('SEARCHING', 'CONTACTED', 'FOUND', 'CLOSED', 'CANCELLED')),
    cancellation_reason VARCHAR(100) CHECK (cancellation_reason IS NULL OR cancellation_reason IN ('BOUGHT_ELSEWHERE', 'DECIDED_NOT_TO_CHANGE', 'BUDGET_CHANGED', 'FOUND_WITH_US', 'OTHER')),
    
    -- Fechas y Seguimiento
    last_contact_date TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_client_id ON wanted_vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_status ON wanted_vehicles(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_brand_model ON wanted_vehicles(brand, model) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_budget ON wanted_vehicles(max_budget) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_priority ON wanted_vehicles(priority) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_wanted_vehicles_created_at ON wanted_vehicles(created_at DESC);

-- 4. TRIGGER PARA AUTO-ACTUALIZAR updated_at
CREATE OR REPLACE TRIGGER update_wanted_vehicles_updated_at
BEFORE UPDATE ON wanted_vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. SEGURIDAD A NIVEL DE FILA (RLS)
ALTER TABLE wanted_vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas para Usuarios Autenticados (Panel Admin)
CREATE POLICY "Admin full access wanted_vehicles"
ON wanted_vehicles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para Service Role
CREATE POLICY "Service role full access wanted_vehicles"
ON wanted_vehicles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Comentarios explicativos
COMMENT ON TABLE wanted_vehicles IS 'Registro de vehículos buscados por clientes y motor de demanda de stock';
COMMENT ON COLUMN wanted_vehicles.accepts_similar_model IS 'Si es TRUE, el motor busca modelos y marcas similares de la misma categoría; si es FALSE, exige modelo estricto';
COMMENT ON COLUMN wanted_vehicles.accepts_nearby_year IS 'Si es TRUE, admite tolerancia de +/- 1 a 2 años en el rango de búsqueda';
