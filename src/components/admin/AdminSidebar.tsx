'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Vehículos', href: '/admin/vehiculos', icon: Car },
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
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-logo-mark">SC</div>
                <div>
                    <div className="admin-logo-text">Special Cars</div>
                    <div className="admin-logo-sub">Panel de Control</div>
                </div>
            </div>

            <nav className="admin-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin' 
                        ? pathname === '/admin' 
                        : pathname.startsWith(item.href);

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
                    className="admin-public-link"
                    title="Ver página web pública"
                >
                    <ExternalLink size={14} />
                    <span>Ver Web</span>
                </Link>

                <button 
                    onClick={handleLogout} 
                    className="admin-public-link"
                    title="Cerrar sesión"
                    style={{ color: '#f43f5e' }}
                >
                    <LogOut size={14} />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
}
