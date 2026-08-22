import Link from 'next/link';
import { AgencySettings } from '@/lib/types';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

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
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {settings.instagram && (
                            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '4px 10px', background: '#1E293B', borderRadius: 6, fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>
                                Instagram
                            </a>
                        )}
                        {settings.facebook && (
                            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '4px 10px', background: '#1E293B', borderRadius: 6, fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>
                                Facebook
                            </a>
                        )}
                        {settings.tiktok && (
                            <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '4px 10px', background: '#1E293B', borderRadius: 6, fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>
                                TikTok
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
