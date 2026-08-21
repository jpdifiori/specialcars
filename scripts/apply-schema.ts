import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

// Parsear .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        envVars[match[1]] = val;
    }
});

const databaseUrl = process.env.DATABASE_URL || envVars.DATABASE_URL;

async function applyMigrations() {
    if (!databaseUrl) {
        console.log('\n⚠️ Para aplicar el esquema automáticamente por consola, podés agregar:');
        console.log('DATABASE_URL="postgresql://postgres:[TU_CONTRASEÑA]@db.wxsvznvmeuylzbkxgcde.supabase.co:5432/postgres" a tu .env.local');
        console.log('\nO bien, podés copiar y pegar el contenido de:');
        console.log('📄 supabase/migrations/000_full_schema.sql');
        console.log('directamente en el SQL Editor de tu Dashboard de Supabase:');
        console.log('🔗 https://supabase.com/dashboard/project/wxsvznvmeuylzbkxgcde/sql/new\n');
        return;
    }

    console.log('🚀 Conectando a PostgreSQL de Supabase...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conexión exitosa a PostgreSQL.');

        const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/000_full_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Ejecutando script DDL completo (15 tablas, triggers, RPCs, RLS)...');
        await client.query(sqlContent);
        console.log('🎉 ¡Esquema de base de datos aplicado exitosamente!');

    } catch (err: any) {
        console.error('❌ Error aplicando migraciones:', err.message);
    } finally {
        await client.end();
    }
}

applyMigrations();
