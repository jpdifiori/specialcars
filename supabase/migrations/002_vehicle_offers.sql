-- ==========================================================
-- MIGRACIÓN: Ofertas de Vehículos (Special Cars)
-- Archivo: 002_vehicle_offers.sql
-- ==========================================================

-- 1. Agregar columnas de oferta a la tabla vehicles
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS offer_price BIGINT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offer_start_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offer_end_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offer_label TEXT DEFAULT 'OFERTA';

-- 2. Crear índice para optimizar consultas de ofertas activas
CREATE INDEX IF NOT EXISTS idx_vehicles_offer 
ON vehicles (is_offer, status, published, is_deleted) 
WHERE is_offer = TRUE AND published = TRUE AND is_deleted = FALSE;

-- 3. Eliminar la vista anterior para evitar error de orden/nombre de columnas (Postgres 42P16)
DROP VIEW IF EXISTS public_vehicle_catalog CASCADE;

-- 4. Recrear la vista pública del catálogo incluyendo las columnas de oferta y hide_price
CREATE VIEW public_vehicle_catalog AS
SELECT
    v.id,
    v.stock_code,
    v.slug,
    v.commercial_title,
    v.brand,
    v.model,
    v.version,
    v.year,
    v.mileage,
    v.fuel_type,
    v.transmission,
    v.body_type,
    v.doors,
    v.exterior_color,
    v.sale_price AS price,
    v.description,
    v.equipment,
    v.features,
    v.featured,
    v.status,
    v.meta_title,
    v.meta_description,
    v.created_at,
    v.hide_price,
    v.is_offer,
    v.offer_price,
    v.offer_start_date,
    v.offer_end_date,
    v.offer_label,
    (
        SELECT url FROM vehicle_images vi 
        WHERE vi.vehicle_id = v.id AND vi.is_primary = TRUE 
        LIMIT 1
    ) AS primary_image_url,
    (
        SELECT COALESCE(json_agg(
            json_build_object(
                'id', vi.id, 
                'url', vi.url, 
                'sort_order', vi.sort_order,
                'is_primary', vi.is_primary
            ) ORDER BY vi.sort_order ASC, vi.created_at ASC
        ), '[]'::json)
        FROM vehicle_images vi 
        WHERE vi.vehicle_id = v.id
    ) AS images
FROM vehicles v
WHERE v.published = TRUE
  AND v.is_deleted = FALSE
  AND v.status IN ('AVAILABLE', 'RESERVED');

-- 5. Otorgar permisos de lectura a roles públicos y autenticados
GRANT SELECT ON public_vehicle_catalog TO anon, authenticated, service_role;
