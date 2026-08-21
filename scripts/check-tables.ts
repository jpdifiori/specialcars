import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function checkTables() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const tables = ['vehicles', 'clients', 'operations', 'consignments', 'reservations', 'agency_settings', 'vehicle_images'];

    console.log('🔍 Verificando tablas en Supabase...');
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Tabla "${t}": no existe o error ->`, error.message);
        } else {
            console.log(`✅ Tabla "${t}": disponible`);
        }
    }
}

checkTables().catch(console.error);
