import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wxsvznvmeuylzbkxgcde.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'juanpablo.difiori@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'SpecialCars2026!';

async function setupSupabase() {
    console.log('🚀 Conectando a Supabase:', SUPABASE_URL);
    if (!SERVICE_ROLE_KEY) {
        console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en el entorno');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Crear usuario Admin en Auth si no existe
    console.log('👤 Verificando usuario Admin:', ADMIN_EMAIL);
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error('❌ Error listando usuarios:', listError.message);
    } else {
        const existingAdmin = users.users.find(u => u.email === ADMIN_EMAIL);
        let adminId = existingAdmin?.id;

        if (!existingAdmin) {
            console.log('✨ Creando usuario admin inicial...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: 'Juan Pablo Di Fiori (Admin)' }
            });

            if (createError) {
                console.error('❌ Error creando usuario admin:', createError.message);
            } else {
                adminId = newUser.user.id;
                console.log('✅ Usuario admin creado con ID:', adminId);
            }
        } else {
            console.log('✅ Usuario admin ya existe con ID:', adminId);
        }

        // 2. Registrar en tabla admins si existe
        if (adminId) {
            try {
                await supabase.from('admins').upsert({
                    id: adminId,
                    email: ADMIN_EMAIL,
                    full_name: 'Juan Pablo Di Fiori (Admin)'
                });
                console.log('✅ Registro en tabla admins verificado');
            } catch (err) {
                console.log('ℹ️ Tabla admins aún no creada (se registrará tras aplicar el schema SQL)');
            }
        }
    }

    // 3. Crear Buckets de Storage si no existen
    console.log('🗂️ Verificando buckets de Supabase Storage...');
    const bucketsToCreate = [
        { id: 'vehicle-images', public: true },
        { id: 'documents', public: false },
        { id: 'agency', public: true }
    ];

    for (const b of bucketsToCreate) {
        const { data: bucket, error: getErr } = await supabase.storage.getBucket(b.id);
        if (getErr || !bucket) {
            console.log(`📦 Creando bucket: ${b.id} (${b.public ? 'Público' : 'Privado'})...`);
            const { error: createErr } = await supabase.storage.createBucket(b.id, {
                public: b.public,
                fileSizeLimit: 15728640 // 15MB
            });
            if (createErr) {
                console.log(`⚠️ Aviso al crear bucket ${b.id}:`, createErr.message);
            } else {
                console.log(`✅ Bucket ${b.id} creado exitosamente.`);
            }
        } else {
            console.log(`✅ Bucket ${b.id} ya existe.`);
        }
    }

    console.log('🎉 Setup inicial de Auth y Storage completado.');
}

setupSupabase().catch(console.error);
