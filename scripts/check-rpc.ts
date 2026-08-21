import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function checkRpcAndViews() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('🔍 Probando get_dashboard_stats()...');
    const { data: stats, error: statsErr } = await supabase.rpc('get_dashboard_stats');
    if (statsErr) {
        console.log('⚠️ get_dashboard_stats error:', statsErr.message);
    } else {
        console.log('✅ get_dashboard_stats OK:', stats);
    }

    console.log('🔍 Probando vista public_vehicle_catalog...');
    const { data: catalog, error: catErr } = await supabase.from('public_vehicle_catalog').select('*').limit(5);
    if (catErr) {
        console.log('⚠️ public_vehicle_catalog error:', catErr.message);
    } else {
        console.log('✅ public_vehicle_catalog OK, count:', catalog?.length);
    }

    console.log('🔍 Probando agency_settings...');
    const { data: settings, error: setErr } = await supabase.from('agency_settings').select('*').limit(1);
    if (setErr) {
        console.log('⚠️ agency_settings error:', setErr.message);
    } else {
        console.log('✅ agency_settings OK:', settings);
    }
}

checkRpcAndViews().catch(console.error);
