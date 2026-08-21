import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wxsvznvmeuylzbkxgcde.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4c3Z6bnZtZXV5bHpia3hnY2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjA2ODgsImV4cCI6MjEwMjg5NjY4OH0.sdl4ELZ1MdAnmBOgjsv2Q60gpd09KUAMySiAN7fKr2o';

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refreshing the auth token
    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data?.user || null;
    } catch {
        user = null;
    }

    const isAccessingAdmin = request.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (isAccessingAdmin && !user) {
        // Redirigir a login si intenta entrar a /admin sin auth
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    if (isLoginPage && user) {
        // Redirigir a /admin si ya está logueado
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
