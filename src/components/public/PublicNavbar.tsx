'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MessageCircle, Phone, Compass, Lock } from 'lucide-react';

export function PublicNavbar({ whatsappNumber, agencyName }: { whatsappNumber?: string; agencyName?: string }) {
    const pathname = usePathname();
    const wp = whatsappNumber || '5491140980758';
    const brand = agencyName || 'Special Cars';

    return (
        <header className="public-navbar">
            <div className="public-nav-container">
                {/* Logo */}
                <Link href="/" className="public-logo">
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 18,
                        boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                    }}>
                        SC
                    </div>
                    <div className="public-logo-brand">
                        <span>{brand}</span>
                    </div>
                </Link>

                {/* Enlaces de Navegación */}
                <nav className="public-nav-links">
                    <Link 
                        href="/" 
                        className="public-nav-link"
                        style={{ color: pathname === '/' ? '#EA580C' : undefined, fontWeight: pathname === '/' ? 700 : undefined }}
                    >
                        Inicio
                    </Link>
                    <Link 
                        href="/vehiculos" 
                        className="public-nav-link"
                        style={{ color: pathname.startsWith('/vehiculos') ? '#EA580C' : undefined, fontWeight: pathname.startsWith('/vehiculos') ? 700 : undefined }}
                    >
                        Catálogo de Vehículos
                    </Link>
                    <a href="/#contacto" className="public-nav-link">
                        Contacto & Ubicación
                    </a>
                </nav>

                {/* CTA WhatsApp y Acceso Admin */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <a
                        href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la página web de Special Cars para consultar por su catálogo de vehículos.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="public-nav-cta"
                    >
                        <MessageCircle size={17} />
                        <span>WhatsApp</span>
                    </a>

                    <Link
                        href="/login"
                        style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 8 }}
                        title="Acceso Administración"
                    >
                        <Lock size={15} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
