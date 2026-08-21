'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BrandLogo } from '@/components/common/BrandLogo';
import { 
    LayoutDashboard, 
    Car, 
    Users, 
    ArrowLeftRight, 
    FileSpreadsheet, 
    BookmarkCheck, 
    Sparkles, 
    BarChart3, 
    Settings, 
    LogOut,
    ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Vehículos (Stock)', href: '/admin/vehiculos', icon: Car },
    { label: 'Clientes', href: '/admin/clientes', icon: Users },
    { label: 'Operaciones', href: '/admin/operaciones', icon: ArrowLeftRight },
    { label: 'Consignaciones', href: '/admin/consignaciones', icon: FileSpreadsheet },
    { label: 'Reservas', href: '/admin/reservas', icon: BookmarkCheck },
    { label: '0 KM', href: '/admin/0km', icon: Sparkles },
    { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
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
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <Link href="/admin">
                    <BrandLogo variant="dark" size="sm" />
                </Link>
            </div>

            <nav className="admin-sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="admin-sidebar-footer">
                <Link
                    href="/"
                    target="_blank"
                    className="admin-nav-item"
                    style={{ color: '#94A3B8' }}
                >
                    <ExternalLink size={16} />
                    <span>Ver Web Pública</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="admin-nav-item"
                    style={{ color: '#EF4444', width: '100%', textAlign: 'left' }}
                >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
