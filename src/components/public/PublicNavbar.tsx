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
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 18,
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
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
                        style={{ color: pathname === '/' ? '#60a5fa' : undefined, fontWeight: pathname === '/' ? 700 : undefined }}
                    >
                        Inicio
                    </Link>
                    <Link 
                        href="/vehiculos" 
                        className="public-nav-link"
                        style={{ color: pathname.startsWith('/vehiculos') ? '#60a5fa' : undefined, fontWeight: pathname.startsWith('/vehiculos') ? 700 : undefined }}
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
                        style={{ color: '#64748b', display: 'flex', alignItems: 'center', padding: 8 }}
                        title="Acceso Administración"
                    >
                        <Lock size={15} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
