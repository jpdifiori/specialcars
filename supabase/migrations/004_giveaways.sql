-- ==========================================================
-- MIGRACIÓN: Sorteos y Premios (Special Cars)
-- Archivo: 004_giveaways.sql
-- ==========================================================

-- 1. Tabla de Sorteos (Giveaways)
CREATE TABLE IF NOT EXISTS giveaways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    terms_and_conditions TEXT,
    banner_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Premios por Sorteo (1°, 2°, 3° premio, etc.)
CREATE TABLE IF NOT EXISTS giveaway_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    winner_participant_id UUID,
    winner_name TEXT,
    winner_announced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Participantes Inscriptos
CREATE TABLE IF NOT EXISTS giveaway_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_winner BOOLEAN NOT NULL DEFAULT FALSE,
    prize_position INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT giveaway_participants_email_unique UNIQUE (giveaway_id, email),
    CONSTRAINT giveaway_participants_phone_unique UNIQUE (giveaway_id, phone)
);

-- 4. Foreign Key cruzada para winner_participant_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'giveaway_prizes_winner_fk'
    ) THEN
        ALTER TABLE giveaway_prizes
        ADD CONSTRAINT giveaway_prizes_winner_fk
        FOREIGN KEY (winner_participant_id) REFERENCES giveaway_participants(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_giveaway_prizes_giveaway ON giveaway_prizes(giveaway_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_giveaway_participants_giveaway ON giveaway_participants(giveaway_id, created_at DESC);

-- 6. Bucket de Storage para Imágenes de Premios y Sorteos
INSERT INTO storage.buckets (id, name, public)
VALUES ('giveaways', 'giveaways', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Giveaways Public Storage Select' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Giveaways Public Storage Select"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'giveaways');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Giveaways Auth Storage All' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Giveaways Auth Storage All"
        ON storage.objects FOR ALL
        TO authenticated
        USING (bucket_id = 'giveaways')
        WITH CHECK (bucket_id = 'giveaways');
    END IF;
END $$;

-- 7. Habilitar RLS y Permisos
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_participants ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública
CREATE POLICY "Public Read Giveaways" ON giveaways
    FOR SELECT TO anon, authenticated, service_role
    USING (is_deleted = FALSE);

CREATE POLICY "Public Read Giveaway Prizes" ON giveaway_prizes
    FOR SELECT TO anon, authenticated, service_role
    USING (TRUE);

CREATE POLICY "Public Insert Giveaway Participants" ON giveaway_participants
    FOR INSERT TO anon, authenticated, service_role
    WITH CHECK (TRUE);

CREATE POLICY "Public Read Winner Participants" ON giveaway_participants
    FOR SELECT TO anon, authenticated, service_role
    USING (is_winner = TRUE);

-- Políticas de Administrador (Full Access para autenticados y service_role)
CREATE POLICY "Admin All Giveaways" ON giveaways
    FOR ALL TO authenticated, service_role
    USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin All Giveaway Prizes" ON giveaway_prizes
    FOR ALL TO authenticated, service_role
    USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin All Giveaway Participants" ON giveaway_participants
    FOR ALL TO authenticated, service_role
    USING (TRUE) WITH CHECK (TRUE);

-- 8. Otorgar permisos
GRANT ALL ON giveaways TO anon, authenticated, service_role;
GRANT ALL ON giveaway_prizes TO anon, authenticated, service_role;
GRANT ALL ON giveaway_participants TO anon, authenticated, service_role;
