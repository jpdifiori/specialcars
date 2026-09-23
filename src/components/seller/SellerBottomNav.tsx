'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Users, SearchCheck, BookmarkCheck } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: typeof Car;
    isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Stock',
        href: '/vendedor',
        icon: Car,
        isActive: (p) => p === '/vendedor' || p.startsWith('/vendedor/vehiculos')
    },
    {
        label: 'Clientes',
        href: '/vendedor/clientes',
        icon: Users,
        isActive: (p) => p.startsWith('/vendedor/clientes')
    },
    {
        label: 'Buscados',
        href: '/vendedor/buscados',
        icon: SearchCheck,
        isActive: (p) => p.startsWith('/vendedor/buscados')
    },
    {
        label: 'Señas',
        href: '/vendedor/reservas',
        icon: BookmarkCheck,
        isActive: (p) => p.startsWith('/vendedor/reservas')
    }
];

export function SellerBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 64,
                backgroundColor: 'rgba(11, 14, 20, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 8px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
            }}
        >
            {NAV_ITEMS.map((item) => {
                const active = item.isActive(pathname);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            flex: 1,
                            height: '100%',
                            color: active ? '#EA580C' : '#94A3B8',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                            position: 'relative'
                        }}
                    >
                        {active && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 24,
                                    height: 3,
                                    backgroundColor: '#EA580C',
                                    borderRadius: '0 0 3px 3px',
                                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.8)'
                                }}
                            />
                        )}
                        <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                        <span
                            style={{
                                fontSize: 10.5,
                                fontWeight: active ? 800 : 500,
                                letterSpacing: 0.2
                            }}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
