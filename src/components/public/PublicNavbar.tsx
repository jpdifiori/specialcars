'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import { 
    MessageCircle, 
    Menu, 
    X, 
    Home, 
    Car, 
    Flame, 
    Search, 
    MapPin, 
    Phone, 
    ChevronRight
} from 'lucide-react';

export function PublicNavbar({ whatsappNumber }: { whatsappNumber?: string; agencyName?: string }) {
    const pathname = usePathname();
    const wp = whatsappNumber || '5492262574254';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Cerrar el menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevenir scroll de la página cuando el menú móvil está abierto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const navItems = [
        { label: 'Inicio', href: '/', icon: Home },
        { label: 'Catálogo de Vehículos', href: '/vehiculos', icon: Car },
        { 
            label: 'Ofertas Especiales', 
            href: '/ofertas', 
            icon: Flame, 
            badge: '🔥 HOT',
            isSpecial: true 
        },
        { label: 'Buscamos tu Auto', href: '/#buscar-auto', icon: Search },
        { label: 'Contacto & Ubicación', href: '/#contacto', icon: MapPin },
    ];

    return (
        <>
            <header className="public-navbar">
                <div className="public-nav-container">
                    {/* Logo con Isotipo Oficial */}
                    <Link href="/" className="public-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
                        <BrandLogo variant="light" size="sm" />
                    </Link>

                    {/* Enlaces de Navegación (Solo Desktop) */}
                    <nav className="public-nav-links desktop-only">
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
                            Catálogo
                        </Link>
                        <Link 
                            href="/ofertas" 
                            className="public-nav-link"
                            style={{ 
                                color: pathname.startsWith('/ofertas') ? '#EA580C' : undefined, 
                                fontWeight: pathname.startsWith('/ofertas') ? 800 : undefined,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                            }}
                        >
                            <span>Ofertas</span>
                            <span style={{
                                backgroundColor: '#EA580C',
                                color: '#FFFFFF',
                                fontSize: 10,
                                fontWeight: 900,
                                padding: '1px 6px',
                                borderRadius: 10,
                                lineHeight: 1.2
                            }}>
                                🔥
                            </span>
                        </Link>
                        <a href="/#buscar-auto" className="public-nav-link">
                            Buscamos tu Auto
                        </a>
                        <a href="/#contacto" className="public-nav-link">
                            Contacto
                        </a>
                    </nav>

                    {/* Acciones de la Derecha: WhatsApp + Botón de Menú Móvil */}
                    <div className="public-nav-actions">
                        {/* CTA WhatsApp Desktop */}
                        <a
                            href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la web de Special Cars para consultar por vehículos.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="public-nav-cta desktop-only"
                        >
                            <MessageCircle size={16} />
                            <span>WhatsApp</span>
                        </a>

                        {/* CTA WhatsApp Móvil (Icono Compacto Verde) */}
                        <a
                            href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la web de Special Cars para consultar por vehículos.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mobile-wa-icon-btn mobile-only"
                            aria-label="Contactar por WhatsApp"
                            title="Contactar por WhatsApp"
                        >
                            <MessageCircle size={20} />
                        </a>

                        {/* Botón Hamburguesa Móvil */}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="mobile-menu-toggle mobile-only"
                            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* MENÚ MÓVIL DESPLEGABLE / DRAWER */}
            {isMobileMenuOpen && (
                <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div 
                        className="mobile-drawer-content" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera del Drawer */}
                        <div className="mobile-drawer-header">
                            <BrandLogo variant="light" size="sm" />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mobile-drawer-close"
                                aria-label="Cerrar menú"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Enlaces de Navegación */}
                        <div className="mobile-drawer-links">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                                
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`mobile-drawer-link ${isActive ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="mobile-drawer-icon-box">
                                                <Icon size={18} />
                                            </div>
                                            <span style={{ fontWeight: isActive ? 800 : 600 }}>
                                                {item.label}
                                            </span>
                                        </div>

                                        {item.badge ? (
                                            <span className="mobile-drawer-badge">
                                                {item.badge}
                                            </span>
                                        ) : (
                                            <ChevronRight size={16} style={{ color: '#94A3B8' }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Card de Atención & WhatsApp */}
                        <div className="mobile-drawer-footer">
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde el menú de la web de Special Cars.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-drawer-wa-btn"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <MessageCircle size={20} />
                                <span>Escribinos al WhatsApp</span>
                            </a>

                            <div className="mobile-drawer-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <MapPin size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                                    <span>Necochea, Pcia. de Buenos Aires</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Phone size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                                    <span>Atención personalizada todos los días</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
