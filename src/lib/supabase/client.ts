import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wxsvznvmeuylzbkxgcde.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4c3Z6bnZtZXV5bHpia3hnY2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjA2ODgsImV4cCI6MjEwMjg5NjY4OH0.sdl4ELZ1MdAnmBOgjsv2Q60gpd09KUAMySiAN7fKr2o';

    return createBrowserClient(supabaseUrl, supabaseKey);
}
