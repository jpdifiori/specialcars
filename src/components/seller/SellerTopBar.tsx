'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

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
                height: 52,
                backgroundColor: '#0B0E14',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                zIndex: 90
            }}
        >
            <Link href="/vendedor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: -0.5, fontStyle: 'italic', lineHeight: 1 }}>
                    <span style={{ color: '#FFFFFF' }}>Special</span>
                    <span style={{ color: '#EA580C', marginLeft: 3 }}>Cars</span>
                </span>
            </Link>

            <button
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    padding: 8,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <LogOut size={18} />
            </button>
        </header>
    );
}
