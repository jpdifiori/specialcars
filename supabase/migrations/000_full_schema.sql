-- ==============================================================================
-- SPECIAL CARS — ESQUEMA COMPLETO DE BASE DE DATOS (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONES Y LIMPIEZA INICIAL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM (
        'DRAFT', 'INCOMING', 'IN_PREPARATION', 'AVAILABLE', 
        'RESERVED', 'SOLD', 'WITHDRAWN', 'UNAVAILABLE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_origin AS ENUM (
        'DIRECT_PURCHASE', 'TRADE_IN', 'CONSIGNMENT', 'OWN_VEHICLE', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_body_type AS ENUM (
        'AUTO', 'SUV', 'PICKUP', 'UTILITY', 'TRUCK', 'MOTORCYCLE', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE fuel_type AS ENUM (
        'NAFTA', 'DIESEL', 'GNC', 'HYBRID', 'ELECTRIC', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE transmission_type AS ENUM (
        'MANUAL', 'AUTOMATIC', 'CVT', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE operation_type AS ENUM (
        'PURCHASE', 'SALE', 'SALE_WITH_TRADE_IN', 
        'CONSIGNMENT', 'RESERVATION', 'ZERO_KM_SALE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE operation_status AS ENUM (
        'DRAFT', 'IN_PROGRESS', 'CONFIRMED', 'CLOSED', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE operation_vehicle_role AS ENUM (
        'SOLD', 'RECEIVED_TRADE_IN', 'PURCHASED', 'CONSIGNED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE consignment_status AS ENUM (
        'ACTIVE', 'RESERVED', 'SOLD', 'CANCELLED', 'EXPIRED', 'WITHDRAWN'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM (
        'ACTIVE', 'CONFIRMED', 'CANCELLED', 'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE zero_km_status AS ENUM (
        'ORDERED', 'CONFIRMED', 'INVOICED', 'IN_TRANSIT', 'DELIVERED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM (
        'CASH', 'TRANSFER', 'CHECK', 'FINANCING', 'CARD', 'TRADE_IN', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM (
        'MECHANICAL', 'BODYWORK', 'PAINT', 'DETAILING', 'TIRES',
        'TRANSFER', 'PAPERWORK', 'TAXES', 'TRANSPORT', 'FUEL',
        'LISTING', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. SECUENCIAS PARA NUMERACIÓN AUTOMÁTICA
CREATE SEQUENCE IF NOT EXISTS vehicle_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS operation_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS consignment_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS reservation_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS zero_km_code_seq START 1;

-- 4. TABLAS PRINCIPALES

-- ADMINS (Vinculado a Supabase Auth)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CLIENTES (Registros internos del negocio, NO son cuentas de usuario)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT,
    cuit_cuil TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- VEHÍCULOS (Inventario central)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identificación
    stock_code TEXT UNIQUE NOT NULL,
    plate TEXT,
    vin TEXT,
    engine_number TEXT,
    -- Info General
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT,
    year INTEGER NOT NULL,
    mileage INTEGER DEFAULT 0,
    fuel_type fuel_type DEFAULT 'NAFTA',
    transmission transmission_type DEFAULT 'MANUAL',
    body_type vehicle_body_type DEFAULT 'AUTO',
    doors INTEGER DEFAULT 4,
    exterior_color TEXT,
    interior_color TEXT,
    -- Información Comercial (ARS - BIGINT)
    purchase_price BIGINT DEFAULT 0,
    sale_price BIGINT DEFAULT 0,
    minimum_price BIGINT DEFAULT 0,
    -- Origen y Estado
    origin_type vehicle_origin NOT NULL DEFAULT 'DIRECT_PURCHASE',
    status vehicle_status NOT NULL DEFAULT 'DRAFT',
    previous_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    origin_operation_id UUID, -- Relacionado con operations
    -- Publicación y Web
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    hide_price BOOLEAN DEFAULT TRUE,
    commercial_title TEXT,
    description TEXT,
    equipment TEXT,
    features TEXT,
    slug TEXT UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    -- Fechas
    purchase_date DATE DEFAULT CURRENT_DATE,
    sale_date DATE,
    -- Auditoría y Soft Delete
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- IMÁGENES DE VEHÍCULOS
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- GASTOS DEL VEHÍCULO
CREATE TABLE IF NOT EXISTS vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    category expense_category NOT NULL DEFAULT 'OTHER',
    description TEXT NOT NULL,
    amount BIGINT NOT NULL, -- ARS
    provider TEXT,
    receipt_path TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- OPERACIONES
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_code TEXT UNIQUE NOT NULL,
    type operation_type NOT NULL,
    status operation_status NOT NULL DEFAULT 'DRAFT',
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    -- Montos en ARS (BIGINT)
    agreed_price BIGINT DEFAULT 0,
    trade_in_value BIGINT DEFAULT 0,
    balance BIGINT DEFAULT 0,
    total_expenses BIGINT DEFAULT 0,
    -- Fechas
    operation_date DATE DEFAULT CURRENT_DATE,
    closed_date DATE,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RELACIÓN CIRCULAR: vehicles.origin_operation_id -> operations.id
DO $$ BEGIN
    ALTER TABLE vehicles 
    ADD CONSTRAINT fk_vehicles_origin_operation 
    FOREIGN KEY (origin_operation_id) REFERENCES operations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- OPERACIÓN - VEHÍCULOS (Relación muchos a muchos con rol específico)
CREATE TABLE IF NOT EXISTS operation_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    role operation_vehicle_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- COMPONENTES DE PAGO DE OPERACIÓN
CREATE TABLE IF NOT EXISTS operation_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    payment_type payment_type NOT NULL DEFAULT 'CASH',
    amount BIGINT NOT NULL, -- ARS
    reference TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CONSIGNACIONES
CREATE TABLE IF NOT EXISTS consignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consignment_code TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    -- Montos en ARS
    requested_price BIGINT DEFAULT 0,
    listing_price BIGINT DEFAULT 0,
    minimum_price BIGINT DEFAULT 0,
    commission_amount BIGINT DEFAULT 0,
    owner_amount BIGINT DEFAULT 0,
    final_sale_price BIGINT DEFAULT 0,
    buyer_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    -- Fechas
    start_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    sold_date DATE,
    status consignment_status NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RESERVAS
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    amount BIGINT DEFAULT 0, -- ARS
    reservation_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    receipt_path TEXT,
    status reservation_status NOT NULL DEFAULT 'ACTIVE',
    show_reserved_badge BOOLEAN DEFAULT TRUE,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- OPERACIONES 0 KM
CREATE TABLE IF NOT EXISTS zero_km_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_code TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT,
    year INTEGER NOT NULL,
    color TEXT,
    provider TEXT,
    cost BIGINT DEFAULT 0,
    client_price BIGINT DEFAULT 0,
    commission BIGINT DEFAULT 0,
    estimated_date DATE,
    delivery_date DATE,
    status zero_km_status NOT NULL DEFAULT 'ORDERED',
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENTACIÓN PRIVADA
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'vehicle', 'client', 'operation'
    entity_id UUID NOT NULL,
    document_type TEXT NOT NULL, -- 'DNI', 'TITULO', 'CEDULA', 'VTV', 'BOLETO', etc.
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CONFIGURACIÓN DE LA AGENCIA (Singleton)
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Special Cars',
    logo_url TEXT,
    hero_image_url TEXT,
    description TEXT DEFAULT 'Venta de vehículos seleccionados, usados y 0 KM en Argentina.',
    address TEXT DEFAULT 'Av. Libertador 4500',
    city TEXT DEFAULT 'Buenos Aires',
    province TEXT DEFAULT 'CABA',
    phone TEXT DEFAULT '+54 2262 57-4254',
    whatsapp TEXT DEFAULT '5492262574254',
    email TEXT DEFAULT 'contacto@specialcars.com.ar',
    instagram TEXT DEFAULT 'https://instagram.com/specialcarsneceochea',
    facebook TEXT DEFAULT 'https://facebook.com/specialcars',
    tiktok TEXT DEFAULT 'https://tiktok.com/@specialcars_neceochea',
    google_maps_url TEXT,
    business_hours TEXT DEFAULT 'Lunes a Viernes de 9:00 a 19:00 hs. Sábados de 10:00 a 14:00 hs.',
    legal_info TEXT DEFAULT 'Special Cars S.R.L. — CUIT 30-12345678-9',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- LOGS DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. VISTA PÚBLICA SEGURA (Sin información confidencial/financiera)
CREATE OR REPLACE VIEW public_vehicle_catalog AS
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

-- 6. FUNCIONES DE CÓDIGOS AUTOMÁTICOS
CREATE OR REPLACE FUNCTION generate_stock_code() RETURNS TEXT AS $$
BEGIN
    RETURN 'VEH-' || LPAD(nextval('vehicle_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_operation_code() RETURNS TEXT AS $$
BEGIN
    RETURN 'OP-' || LPAD(nextval('operation_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_consignment_code() RETURNS TEXT AS $$
BEGIN
    RETURN 'CON-' || LPAD(nextval('consignment_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_reservation_code() RETURNS TEXT AS $$
BEGIN
    RETURN 'RES-' || LPAD(nextval('reservation_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_zero_km_code() RETURNS TEXT AS $$
BEGIN
    RETURN '0KM-' || LPAD(nextval('zero_km_code_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGERS DE ASIGNACIÓN AUTOMÁTICA DE CÓDIGO
CREATE OR REPLACE FUNCTION trigger_set_vehicle_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_code IS NULL OR NEW.stock_code = '' THEN
        NEW.stock_code := generate_stock_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_vehicle_code ON vehicles;
CREATE TRIGGER trg_set_vehicle_code
BEFORE INSERT ON vehicles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_vehicle_code();

CREATE OR REPLACE FUNCTION trigger_set_operation_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.operation_code IS NULL OR NEW.operation_code = '' THEN
        NEW.operation_code := generate_operation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_operation_code ON operations;
CREATE TRIGGER trg_set_operation_code
BEFORE INSERT ON operations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_operation_code();

CREATE OR REPLACE FUNCTION trigger_set_consignment_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.consignment_code IS NULL OR NEW.consignment_code = '' THEN
        NEW.consignment_code := generate_consignment_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_consignment_code ON consignments;
CREATE TRIGGER trg_set_consignment_code
BEFORE INSERT ON consignments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_consignment_code();

CREATE OR REPLACE FUNCTION trigger_set_reservation_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reservation_code IS NULL OR NEW.reservation_code = '' THEN
        NEW.reservation_code := generate_reservation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_reservation_code ON reservations;
CREATE TRIGGER trg_set_reservation_code
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_reservation_code();

CREATE OR REPLACE FUNCTION trigger_set_zero_km_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.operation_code IS NULL OR NEW.operation_code = '' THEN
        NEW.operation_code := generate_zero_km_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_zero_km_code ON zero_km_operations;
CREATE TRIGGER trg_set_zero_km_code
BEFORE INSERT ON zero_km_operations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_zero_km_code();

-- 8. TRIGGER DE UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_update_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_timestamp ON vehicles;
CREATE TRIGGER trg_vehicles_timestamp BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS trg_clients_timestamp ON clients;
CREATE TRIGGER trg_clients_timestamp BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS trg_operations_timestamp ON operations;
CREATE TRIGGER trg_operations_timestamp BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS trg_consignments_timestamp ON consignments;
CREATE TRIGGER trg_consignments_timestamp BEFORE UPDATE ON consignments FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS trg_reservations_timestamp ON reservations;
CREATE TRIGGER trg_reservations_timestamp BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS trg_zero_km_timestamp ON zero_km_operations;
CREATE TRIGGER trg_zero_km_timestamp BEFORE UPDATE ON zero_km_operations FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

-- 9. FUNCIONES RPC PARA OPERACIONES ATÓMICAS (TRANSACCIONALES)

-- A. Venta Simple Atómica
CREATE OR REPLACE FUNCTION process_simple_sale(
    p_client_id UUID,
    p_vehicle_id UUID,
    p_agreed_price BIGINT,
    p_payments JSONB,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_op_id UUID;
    v_op_code TEXT;
    v_pay JSONB;
    v_total_paid BIGINT := 0;
BEGIN
    -- 1. Validar vehículo
    IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND status IN ('AVAILABLE', 'RESERVED') AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'El vehículo no está disponible para la venta';
    END IF;

    -- 2. Crear Operación
    INSERT INTO operations (
        type, status, client_id, agreed_price, balance, notes, operation_date, closed_date
    ) VALUES (
        'SALE', 'CLOSED', p_client_id, p_agreed_price, 0, p_notes, CURRENT_DATE, CURRENT_DATE
    ) RETURNING id, operation_code INTO v_op_id, v_op_code;

    -- 3. Vincular vehículo a la operación
    INSERT INTO operation_vehicles (operation_id, vehicle_id, role)
    VALUES (v_op_id, p_vehicle_id, 'SOLD');

    -- 4. Registrar componentes de pago
    FOR v_pay IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO operation_payments (operation_id, payment_type, amount, reference, notes)
        VALUES (
            v_op_id, 
            (v_pay->>'payment_type')::payment_type, 
            (v_pay->>'amount')::BIGINT, 
            v_pay->>'reference', 
            v_pay->>'notes'
        );
        v_total_paid := v_total_paid + (v_pay->>'amount')::BIGINT;
    END LOOP;

    -- 5. Actualizar vehículo a VENDIDO y DESPUBLICADO
    UPDATE vehicles 
    SET status = 'SOLD',
        published = FALSE,
        sale_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = p_vehicle_id;

    -- 6. Auditoría
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (
        p_user_id, 
        'CONFIRM_SALE', 
        'operation', 
        v_op_id, 
        jsonb_build_object('operation_code', v_op_code, 'vehicle_id', p_vehicle_id, 'agreed_price', p_agreed_price)
    );

    RETURN jsonb_build_object(
        'success', true, 
        'operation_id', v_op_id, 
        'operation_code', v_op_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Venta con Permuta Atómica
CREATE OR REPLACE FUNCTION process_trade_in_sale(
    p_client_id UUID,
    p_sold_vehicle_id UUID,
    p_agreed_price BIGINT,
    p_trade_in_data JSONB, -- Datos del vehículo recibido
    p_trade_in_value BIGINT,
    p_payments JSONB,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_op_id UUID;
    v_op_code TEXT;
    v_trade_in_vehicle_id UUID;
    v_pay JSONB;
    v_slug TEXT;
    v_count INT;
BEGIN
    -- 1. Validar vehículo que sale
    IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_sold_vehicle_id AND status IN ('AVAILABLE', 'RESERVED') AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'El vehículo a vender no está disponible';
    END IF;

    -- 2. Crear Operación
    INSERT INTO operations (
        type, status, client_id, agreed_price, trade_in_value, balance, notes, operation_date, closed_date
    ) VALUES (
        'SALE_WITH_TRADE_IN', 'CLOSED', p_client_id, p_agreed_price, p_trade_in_value, 0, p_notes, CURRENT_DATE, CURRENT_DATE
    ) RETURNING id, operation_code INTO v_op_id, v_op_code;

    -- 3. Crear vehículo recibido en inventario (IN_PREPARATION, origin=TRADE_IN)
    v_slug := lower(regexp_replace(COALESCE(p_trade_in_data->>'brand', 'auto') || '-' || COALESCE(p_trade_in_data->>'model', 'modelo') || '-' || COALESCE(p_trade_in_data->>'year', '2024'), '[^a-zA-Z0-9]+', '-', 'g'));
    
    -- Manejar posible colisión de slug
    SELECT count(*) INTO v_count FROM vehicles WHERE slug LIKE v_slug || '%';
    IF v_count > 0 THEN
        v_slug := v_slug || '-' || (v_count + 1)::TEXT;
    END IF;

    INSERT INTO vehicles (
        brand, model, version, year, mileage, fuel_type, transmission, body_type,
        exterior_color, interior_color, plate, vin, engine_number,
        purchase_price, sale_price, minimum_price,
        origin_type, status, previous_client_id, origin_operation_id,
        published, featured, slug, purchase_date
    ) VALUES (
        p_trade_in_data->>'brand',
        p_trade_in_data->>'model',
        p_trade_in_data->>'version',
        (p_trade_in_data->>'year')::INTEGER,
        COALESCE((p_trade_in_data->>'mileage')::INTEGER, 0),
        COALESCE((p_trade_in_data->>'fuel_type')::fuel_type, 'NAFTA'),
        COALESCE((p_trade_in_data->>'transmission')::transmission_type, 'MANUAL'),
        COALESCE((p_trade_in_data->>'body_type')::vehicle_body_type, 'AUTO'),
        p_trade_in_data->>'exterior_color',
        p_trade_in_data->>'interior_color',
        p_trade_in_data->>'plate',
        p_trade_in_data->>'vin',
        p_trade_in_data->>'engine_number',
        p_trade_in_value, -- Valor de compra = valor de toma reconocido
        COALESCE((p_trade_in_data->>'sale_price')::BIGINT, 0),
        COALESCE((p_trade_in_data->>'minimum_price')::BIGINT, 0),
        'TRADE_IN',
        'IN_PREPARATION',
        p_client_id,
        v_op_id,
        FALSE,
        FALSE,
        v_slug,
        CURRENT_DATE
    ) RETURNING id INTO v_trade_in_vehicle_id;

    -- 4. Registrar ambos vehículos en la tabla de relación
    INSERT INTO operation_vehicles (operation_id, vehicle_id, role)
    VALUES (v_op_id, p_sold_vehicle_id, 'SOLD');

    INSERT INTO operation_vehicles (operation_id, vehicle_id, role)
    VALUES (v_op_id, v_trade_in_vehicle_id, 'RECEIVED_TRADE_IN');

    -- 5. Registrar el componente de permuta como pago
    INSERT INTO operation_payments (operation_id, payment_type, amount, reference, notes)
    VALUES (v_op_id, 'TRADE_IN', p_trade_in_value, 'Vehículo recibido en permuta', 'Toma de vehículo');

    -- 6. Registrar pagos monetarios adicionales
    IF p_payments IS NOT NULL THEN
        FOR v_pay IN SELECT * FROM jsonb_array_elements(p_payments)
        LOOP
            INSERT INTO operation_payments (operation_id, payment_type, amount, reference, notes)
            VALUES (
                v_op_id, 
                (v_pay->>'payment_type')::payment_type, 
                (v_pay->>'amount')::BIGINT, 
                v_pay->>'reference', 
                v_pay->>'notes'
            );
        END LOOP;
    END IF;

    -- 7. Actualizar vehículo vendido
    UPDATE vehicles 
    SET status = 'SOLD',
        published = FALSE,
        sale_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = p_sold_vehicle_id;

    -- 8. Auditoría
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (
        p_user_id, 
        'CONFIRM_TRADE_IN_SALE', 
        'operation', 
        v_op_id, 
        jsonb_build_object(
            'operation_code', v_op_code, 
            'sold_vehicle_id', p_sold_vehicle_id, 
            'trade_in_vehicle_id', v_trade_in_vehicle_id,
            'agreed_price', p_agreed_price,
            'trade_in_value', p_trade_in_value
        )
    );

    RETURN jsonb_build_object(
        'success', true, 
        'operation_id', v_op_id, 
        'operation_code', v_op_code,
        'trade_in_vehicle_id', v_trade_in_vehicle_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Venta de Consignación Atómica
CREATE OR REPLACE FUNCTION process_consignment_sale(
    p_consignment_id UUID,
    p_buyer_client_id UUID,
    p_final_sale_price BIGINT,
    p_payments JSONB,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_cons RECORD;
    v_op_id UUID;
    v_op_code TEXT;
    v_pay JSONB;
    v_agency_commission BIGINT;
    v_owner_amount BIGINT;
BEGIN
    SELECT * INTO v_cons FROM consignments WHERE id = p_consignment_id;
    IF NOT FOUND OR v_cons.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'La consignación no está activa';
    END IF;

    -- Calcular montos
    IF v_cons.owner_amount > 0 THEN
        v_owner_amount := v_cons.owner_amount;
        v_agency_commission := p_final_sale_price - v_owner_amount;
    ELSE
        v_agency_commission := COALESCE(v_cons.commission_amount, 0);
        v_owner_amount := p_final_sale_price - v_agency_commission;
    END IF;

    -- 1. Crear Operación
    INSERT INTO operations (
        type, status, client_id, agreed_price, balance, notes, operation_date, closed_date
    ) VALUES (
        'CONSIGNMENT', 'CLOSED', p_buyer_client_id, p_final_sale_price, 0, p_notes, CURRENT_DATE, CURRENT_DATE
    ) RETURNING id, operation_code INTO v_op_id, v_op_code;

    -- 2. Vincular vehículo
    INSERT INTO operation_vehicles (operation_id, vehicle_id, role)
    VALUES (v_op_id, v_cons.vehicle_id, 'CONSIGNED');

    -- 3. Registrar pagos
    IF p_payments IS NOT NULL THEN
        FOR v_pay IN SELECT * FROM jsonb_array_elements(p_payments)
        LOOP
            INSERT INTO operation_payments (operation_id, payment_type, amount, reference, notes)
            VALUES (
                v_op_id, 
                (v_pay->>'payment_type')::payment_type, 
                (v_pay->>'amount')::BIGINT, 
                v_pay->>'reference', 
                v_pay->>'notes'
            );
        END LOOP;
    END IF;

    -- 4. Cerrar consignación
    UPDATE consignments
    SET status = 'SOLD',
        buyer_client_id = p_buyer_client_id,
        final_sale_price = p_final_sale_price,
        owner_amount = v_owner_amount,
        commission_amount = v_agency_commission,
        sold_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = p_consignment_id;

    -- 5. Actualizar vehículo
    UPDATE vehicles
    SET status = 'SOLD',
        published = FALSE,
        sale_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = v_cons.vehicle_id;

    RETURN jsonb_build_object(
        'success', true, 
        'operation_id', v_op_id, 
        'operation_code', v_op_code,
        'commission_amount', v_agency_commission,
        'owner_amount', v_owner_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Procesar Reserva Atómica
CREATE OR REPLACE FUNCTION process_reservation(
    p_client_id UUID,
    p_vehicle_id UUID,
    p_amount BIGINT,
    p_expiry_date DATE,
    p_receipt_path TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_res_id UUID;
    v_res_code TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND status = 'AVAILABLE' AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'El vehículo no está disponible para reservar';
    END IF;

    INSERT INTO reservations (
        client_id, vehicle_id, amount, expiry_date, receipt_path, notes, status
    ) VALUES (
        p_client_id, p_vehicle_id, p_amount, p_expiry_date, p_receipt_path, p_notes, 'ACTIVE'
    ) RETURNING id, reservation_code INTO v_res_id, v_res_code;

    UPDATE vehicles
    SET status = 'RESERVED',
        updated_at = now()
    WHERE id = p_vehicle_id;

    RETURN jsonb_build_object(
        'success', true, 
        'reservation_id', v_res_id, 
        'reservation_code', v_res_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. Cancelar Reserva Atómica
CREATE OR REPLACE FUNCTION cancel_reservation(
    p_reservation_id UUID,
    p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
BEGIN
    SELECT * INTO v_res FROM reservations WHERE id = p_reservation_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva no encontrada';
    END IF;

    UPDATE reservations
    SET status = 'CANCELLED',
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Restaurar vehículo a AVAILABLE si no hay otra operación
    UPDATE vehicles
    SET status = 'AVAILABLE',
        updated_at = now()
    WHERE id = v_res.vehicle_id AND status = 'RESERVED';

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- F. Estadísticas Ejecutivas del Dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats() RETURNS JSONB AS $$
DECLARE
    v_total_stock INT;
    v_available_stock INT;
    v_reserved_stock INT;
    v_prep_stock INT;
    v_sold_stock INT;
    v_own_stock INT;
    v_consigned_stock INT;
    v_trade_in_stock INT;
    
    v_capital_invested BIGINT;
    v_potential_sale_value BIGINT;
    v_potential_profit BIGINT;
    v_month_sales_total BIGINT;
    v_month_profit_realized BIGINT;
    v_month_units_sold INT;
    v_month_units_entered INT;
    
    v_active_reservations INT;
    v_active_consignments INT;
    
    v_alerts_no_photos INT;
    v_alerts_no_price INT;
    v_alerts_unapproved INT;
    v_alerts_long_stock INT;
BEGIN
    -- Stock Counts
    SELECT count(*) INTO v_total_stock FROM vehicles WHERE is_deleted = FALSE;
    SELECT count(*) INTO v_available_stock FROM vehicles WHERE status = 'AVAILABLE' AND is_deleted = FALSE;
    SELECT count(*) INTO v_reserved_stock FROM vehicles WHERE status = 'RESERVED' AND is_deleted = FALSE;
    SELECT count(*) INTO v_prep_stock FROM vehicles WHERE status = 'IN_PREPARATION' AND is_deleted = FALSE;
    SELECT count(*) INTO v_sold_stock FROM vehicles WHERE status = 'SOLD' AND is_deleted = FALSE;
    SELECT count(*) INTO v_own_stock FROM vehicles WHERE origin_type IN ('DIRECT_PURCHASE', 'OWN_VEHICLE') AND status != 'SOLD' AND is_deleted = FALSE;
    SELECT count(*) INTO v_consigned_stock FROM vehicles WHERE origin_type = 'CONSIGNMENT' AND status != 'SOLD' AND is_deleted = FALSE;
    SELECT count(*) INTO v_trade_in_stock FROM vehicles WHERE origin_type = 'TRADE_IN' AND status != 'SOLD' AND is_deleted = FALSE;

    -- Finanzas Stock Propio (Excluye consignaciones para capital invertido)
    SELECT 
        COALESCE(SUM(v.purchase_price + COALESCE(e.exp_sum, 0)), 0),
        COALESCE(SUM(v.sale_price), 0)
    INTO v_capital_invested, v_potential_sale_value
    FROM vehicles v
    LEFT JOIN (
        SELECT vehicle_id, SUM(amount) AS exp_sum 
        FROM vehicle_expenses 
        GROUP BY vehicle_id
    ) e ON e.vehicle_id = v.id
    WHERE v.origin_type != 'CONSIGNMENT' 
      AND v.status IN ('AVAILABLE', 'RESERVED', 'IN_PREPARATION')
      AND v.is_deleted = FALSE;

    v_potential_profit := v_potential_sale_value - v_capital_invested;

    -- Ventas del Mes
    SELECT 
        COALESCE(SUM(agreed_price), 0),
        count(*)
    INTO v_month_sales_total, v_month_units_sold
    FROM operations
    WHERE type IN ('SALE', 'SALE_WITH_TRADE_IN', 'CONSIGNMENT')
      AND status = 'CLOSED'
      AND operation_date >= date_trunc('month', CURRENT_DATE)
      AND is_deleted = FALSE;

    -- Ingresos del mes
    SELECT count(*) INTO v_month_units_entered
    FROM vehicles
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
      AND is_deleted = FALSE;

    -- Actividad
    SELECT count(*) INTO v_active_reservations FROM reservations WHERE status = 'ACTIVE' AND is_deleted = FALSE;
    SELECT count(*) INTO v_active_consignments FROM consignments WHERE status = 'ACTIVE' AND is_deleted = FALSE;

    -- Alertas
    SELECT count(*) INTO v_alerts_no_photos
    FROM vehicles v
    WHERE v.status IN ('AVAILABLE', 'IN_PREPARATION') 
      AND v.is_deleted = FALSE
      AND NOT EXISTS (SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id);

    SELECT count(*) INTO v_alerts_no_price
    FROM vehicles
    WHERE status IN ('AVAILABLE', 'IN_PREPARATION') 
      AND (sale_price IS NULL OR sale_price = 0)
      AND is_deleted = FALSE;

    SELECT count(*) INTO v_alerts_unapproved
    FROM vehicles
    WHERE status = 'AVAILABLE' AND published = FALSE AND is_deleted = FALSE;

    SELECT count(*) INTO v_alerts_long_stock
    FROM vehicles
    WHERE status IN ('AVAILABLE', 'RESERVED') 
      AND purchase_date <= (CURRENT_DATE - INTERVAL '60 days')
      AND is_deleted = FALSE;

    RETURN jsonb_build_object(
        'stock', jsonb_build_object(
            'total', v_total_stock,
            'available', v_available_stock,
            'reserved', v_reserved_stock,
            'in_preparation', v_prep_stock,
            'sold', v_sold_stock,
            'own', v_own_stock,
            'consigned', v_consigned_stock,
            'trade_in', v_trade_in_stock
        ),
        'finance', jsonb_build_object(
            'capital_invested', v_capital_invested,
            'potential_sale_value', v_potential_sale_value,
            'potential_profit', v_potential_profit,
            'margin_percentage', CASE WHEN v_capital_invested > 0 THEN ROUND((v_potential_profit::NUMERIC / v_capital_invested::NUMERIC) * 100, 2) ELSE 0 END,
            'month_sales_total', v_month_sales_total,
            'month_units_sold', v_month_units_sold,
            'month_units_entered', v_month_units_entered
        ),
        'activity', jsonb_build_object(
            'active_reservations', v_active_reservations,
            'active_consignments', v_active_consignments
        ),
        'alerts', jsonb_build_object(
            'no_photos', v_alerts_no_photos,
            'no_price', v_alerts_no_price,
            'not_published', v_alerts_unapproved,
            'stagnant_stock', v_alerts_long_stock
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. BÚSQUEDA GLOBAL MULTI-ENTIDAD
CREATE OR REPLACE FUNCTION global_search(p_query TEXT) RETURNS JSONB AS $$
DECLARE
    v_vehicles JSONB;
    v_clients JSONB;
    v_operations JSONB;
    v_clean_q TEXT := trim(p_query);
BEGIN
    IF length(v_clean_q) < 2 THEN
        RETURN jsonb_build_object('vehicles', '[]'::jsonb, 'clients', '[]'::jsonb, 'operations', '[]'::jsonb);
    END IF;

    -- Buscar vehículos
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'stock_code', stock_code,
            'title', brand || ' ' || model || ' ' || COALESCE(version, '') || ' (' || year || ')',
            'plate', plate,
            'vin', vin,
            'status', status,
            'sale_price', sale_price
        )
    ), '[]'::jsonb) INTO v_vehicles
    FROM vehicles
    WHERE is_deleted = FALSE
      AND (
        stock_code ILIKE '%' || v_clean_q || '%' OR
        plate ILIKE '%' || v_clean_q || '%' OR
        vin ILIKE '%' || v_clean_q || '%' OR
        brand ILIKE '%' || v_clean_q || '%' OR
        model ILIKE '%' || v_clean_q || '%' OR
        commercial_title ILIKE '%' || v_clean_q || '%'
      )
    LIMIT 10;

    -- Buscar clientes
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', first_name || ' ' || last_name,
            'dni', dni,
            'cuit_cuil', cuit_cuil,
            'phone', phone,
            'email', email
        )
    ), '[]'::jsonb) INTO v_clients
    FROM clients
    WHERE is_deleted = FALSE
      AND (
        first_name ILIKE '%' || v_clean_q || '%' OR
        last_name ILIKE '%' || v_clean_q || '%' OR
        dni ILIKE '%' || v_clean_q || '%' OR
        cuit_cuil ILIKE '%' || v_clean_q || '%' OR
        phone ILIKE '%' || v_clean_q || '%' OR
        email ILIKE '%' || v_clean_q || '%'
      )
    LIMIT 10;

    -- Buscar operaciones
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', o.id,
            'operation_code', o.operation_code,
            'type', o.type,
            'status', o.status,
            'client_name', c.first_name || ' ' || c.last_name,
            'agreed_price', o.agreed_price,
            'operation_date', o.operation_date
        )
    ), '[]'::jsonb) INTO v_operations
    FROM operations o
    JOIN clients c ON c.id = o.client_id
    WHERE o.is_deleted = FALSE
      AND (
        o.operation_code ILIKE '%' || v_clean_q || '%' OR
        c.first_name ILIKE '%' || v_clean_q || '%' OR
        c.last_name ILIKE '%' || v_clean_q || '%'
      )
    LIMIT 10;

    RETURN jsonb_build_object(
        'vehicles', v_vehicles,
        'clients', v_clients,
        'operations', v_operations
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_published ON vehicles(published);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_stock_code ON vehicles(stock_code);
CREATE INDEX IF NOT EXISTS idx_vehicles_catalog ON vehicles(published, is_deleted, status);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle ON vehicle_expenses(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_operations_client ON operations(client_id);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_code ON operations(operation_code);
CREATE INDEX IF NOT EXISTS idx_operation_vehicles_op ON operation_vehicles(operation_id);
CREATE INDEX IF NOT EXISTS idx_operation_vehicles_veh ON operation_vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payments_operation ON operation_payments(operation_id);

CREATE INDEX IF NOT EXISTS idx_clients_dni ON clients(dni);
CREATE INDEX IF NOT EXISTS idx_clients_cuit ON clients(cuit_cuil);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_consignments_vehicle ON consignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_consignments_client ON consignments(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zero_km_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para Admins Autenticados (Acceso Total)
CREATE POLICY "Admins full access" ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access vehicle_images" ON vehicle_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access vehicle_expenses" ON vehicle_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access operations" ON operations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access operation_vehicles" ON operation_vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access operation_payments" ON operation_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access consignments" ON consignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access zero_km_operations" ON zero_km_operations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access agency_settings" ON agency_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access audit_logs" ON audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas Públicas (Anon):
-- 1. agency_settings lectura pública
CREATE POLICY "Public read agency_settings" ON agency_settings FOR SELECT TO anon USING (true);
-- 2. vehicle_images lectura pública solo si el vehículo está publicado
CREATE POLICY "Public read vehicle_images" ON vehicle_images FOR SELECT TO anon USING (
    EXISTS (
        SELECT 1 FROM vehicles v 
        WHERE v.id = vehicle_images.vehicle_id 
          AND v.published = TRUE 
          AND v.is_deleted = FALSE 
          AND v.status IN ('AVAILABLE', 'RESERVED')
    )
);

-- 13. SEED INICIAL DE CONFIGURACIÓN DE AGENCIA
INSERT INTO agency_settings (
    name, description, address, city, province, phone, whatsapp, email, instagram, facebook, tiktok, business_hours, legal_info
) VALUES (
    'Special Cars',
    'Concesionaria líder en vehículos premium, usados y 0 KM. Más de 15 años brindando transparencia, calidad y confianza en cada operación.',
    'Calle 48 2350',
    '',
    '',
    '+54 2262 57-4254',
    '5492262574254',
    'juanpablo.difiori@gmail.com',
    'https://instagram.com/specialcars',
    'https://facebook.com/specialcars',
    'https://tiktok.com/@specialcars',
    'Lunes a Viernes de 8:00 a 17:00 hs. Sábados de 08:00 a 12:30 hs.',
    'Special Cars S.R.L. — CUIT 30-71234567-8'
) ON CONFLICT DO NOTHING;

-- 14. POLÍTICAS DE STORAGE (storage.objects)
DO $$
BEGIN
    -- Permitir lectura pública de imágenes de vehículos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access vehicle-images'
    ) THEN
        CREATE POLICY "Public Access vehicle-images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
    END IF;
END $$;

