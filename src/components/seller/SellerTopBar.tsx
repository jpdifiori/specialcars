'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Shield } from 'lucide-react';

export function SellerTopBar() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Error logging out:', err);
        }
        router.push('/login');
        router.refresh();
    };

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                backgroundColor: '#0B0E14',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                zIndex: 90
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href="/vendedor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <BrandLogo variant="dark" size="sm" />
                </Link>
                <span
                    style={{
                        backgroundColor: 'rgba(234, 88, 12, 0.15)',
                        border: '1px solid rgba(234, 88, 12, 0.35)',
                        color: '#FB923C',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}
                >
                    Salón
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                    href="/admin"
                    title="Ir al panel administrativo de escritorio"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        color: '#94A3B8',
                        textDecoration: 'none',
                        padding: '5px 8px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <Shield size={13} style={{ color: '#EA580C' }} />
                    <span>Admin</span>
                </Link>

                <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        padding: 6,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
