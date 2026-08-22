import Link from 'next/link';
import { AgencySettings } from '@/lib/types';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

function InstagramIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46 6.27 6.27 0 0 0 1.94-4.52V8.71a8.21 8.21 0 0 0 4.79 1.52v-3.45a4.85 4.85 0 0 1-1-.09z"/>
        </svg>
    );
}

export function PublicFooter({ settings }: { settings: AgencySettings }) {
    const year = new Date().getFullYear();

    return (
        <footer className="public-footer" id="contacto">
            <div className="footer-container">
                {/* Columna 1: Branding y Redes */}
                <div>
                    <div style={{ marginBottom: 12 }}>
                        <BrandLogo variant="dark" size="md" />
                    </div>
                    <p className="desktop-only-block" style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 14 }}>
                        {settings.description || 'Concesionaria líder en vehículos premium, usados y 0 KM con más de 15 años de trayectoria.'}
                    </p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {settings.instagram && (
                            <a 
                                href={settings.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="Seguinos en Instagram"
                                aria-label="Instagram"
                                className="social-icon-btn social-instagram"
                            >
                                <InstagramIcon size={18} />
                            </a>
                        )}
                        {settings.facebook && (
                            <a 
                                href={settings.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="Seguinos en Facebook"
                                aria-label="Facebook"
                                className="social-icon-btn social-facebook"
                            >
                                <FacebookIcon size={18} />
                            </a>
                        )}
                        {settings.tiktok && (
                            <a 
                                href={settings.tiktok} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="Seguinos en TikTok"
                                aria-label="TikTok"
                                className="social-icon-btn social-tiktok"
                            >
                                <TikTokIcon size={18} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Columna 2: Navegación Rápida (Solo Desktop) */}
                <div className="desktop-only-block">
                    <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FFFFFF', marginBottom: 12 }}>
                        Navegación
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                        <li>
                            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Inicio</Link>
                        </li>
                        <li>
                            <Link href="/vehiculos" style={{ color: '#94A3B8', textDecoration: 'none' }}>Catálogo de Stock</Link>
                        </li>
                        <li>
                            <a href="#contacto" style={{ color: '#94A3B8', textDecoration: 'none' }}>Ubicación y Horarios</a>
                        </li>
                        <li>
                            <Link href="/login" style={{ color: '#64748B', fontSize: 11.5, textDecoration: 'none' }}>Acceso Empleados / Admin</Link>
                        </li>
                    </ul>
                </div>

                {/* Columna 3: Contacto y Ubicación (Compacto & Minimalista) */}
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FFFFFF', marginBottom: 12 }}>
                        Contacto & Ubicación
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13 }}>
                        {settings.whatsapp && (
                            <a 
                                href={`https://wa.me/${settings.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#25D366', fontWeight: 700, textDecoration: 'none' }}
                            >
                                <MessageCircle size={14} />
                                <span>WhatsApp: +{settings.whatsapp}</span>
                            </a>
                        )}
                        {settings.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#CBD5E1' }}>
                                <Mail size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                                <span>{settings.email}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94A3B8' }}>
                            <MapPin size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                            <span>{[settings.address || 'Calle 48 2350', settings.city].filter(Boolean).join(', ')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94A3B8', fontSize: 12 }}>
                            <Clock size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                            <span>Lun a Vie 8-17 hs • Sáb 8-12:30 hs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 16 }}>
                <div style={{ fontSize: 12 }}>
                    © {year} Special Cars. Todos los derechos reservados.
                </div>
                <div>
                    <Link href="/login" style={{ color: '#475569', fontSize: 11.5, textDecoration: 'none' }}>Acceso Admin</Link>
                </div>
            </div>
        </footer>
    );
}
