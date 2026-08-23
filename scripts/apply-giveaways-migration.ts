import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

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

async function run() {
    if (!databaseUrl) {
        console.log('No direct DATABASE_URL provided. Migration file ready at supabase/migrations/004_giveaways.sql');
        return;
    }

    console.log('Connecting to Postgres...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/004_giveaways.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sqlContent);
        console.log('✅ Migración 004_giveaways.sql ejecutada con éxito en PostgreSQL.');
    } catch (err: any) {
        console.error('Error ejecutando migración:', err.message);
    } finally {
        await client.end();
    }
}

run();
