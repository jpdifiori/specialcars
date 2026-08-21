'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import { MessageCircle } from 'lucide-react';

export function PublicNavbar({ whatsappNumber }: { whatsappNumber?: string; agencyName?: string }) {
    const pathname = usePathname();
    const wp = whatsappNumber || '5492262574254';

    return (
        <header className="public-navbar">
            <div className="public-nav-container">
                {/* Logo con Isotipo Oficial y Tipografía Special Cars */}
                <Link href="/">
                    <BrandLogo variant="light" size="md" />
                </Link>

                {/* Enlaces de Navegación */}
                <nav className="public-nav-links">
                    <Link 
                        href="/" 
                        className="public-nav-link"
                        style={{ color: pathname === '/' ? '#EA580C' : undefined, fontWeight: pathname === '/' ? 800 : undefined }}
                    >
                        Inicio
                    </Link>
                    <Link 
                        href="/vehiculos" 
                        className="public-nav-link"
                        style={{ color: pathname.startsWith('/vehiculos') ? '#EA580C' : undefined, fontWeight: pathname.startsWith('/vehiculos') ? 800 : undefined }}
                    >
                        Catálogo de Vehículos
                    </Link>
                    <a href="/#contacto" className="public-nav-link">
                        Contacto & Ubicación
                    </a>
                </nav>

                {/* CTA WhatsApp */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a
                        href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la página web de Special Cars para consultar por su catálogo de vehículos.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="public-nav-cta"
                    >
                        <MessageCircle size={17} />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </header>
    );
}
