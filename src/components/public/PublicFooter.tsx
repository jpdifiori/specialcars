import Link from 'next/link';
import { AgencySettings } from '@/lib/types';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

export function PublicFooter({ settings }: { settings: AgencySettings }) {
    const year = new Date().getFullYear();

    return (
        <footer className="public-footer" id="contacto">
            <div className="footer-container">
                {/* Columna 1: Branding y Propuesta */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <BrandLogo variant="dark" size="md" />
                    </div>
                    <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
                        {settings.description || 'Concesionaria líder en venta de automóviles seleccionados, seminuevos y 0 KM en Argentina.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {settings.instagram && (
                            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '6px 12px', background: '#1E293B', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                Instagram
                            </a>
                        )}
                        {settings.facebook && (
                            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '6px 12px', background: '#1E293B', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                Facebook
                            </a>
                        )}
                        {settings.tiktok && (
                            <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#CBD5E1', padding: '6px 12px', background: '#1E293B', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                TikTok
                            </a>
                        )}
                    </div>
                </div>

                {/* Columna 2: Navegación Rápida */}
                <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FFFFFF', marginBottom: 16 }}>
                        Navegación
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                        <li>
                            <Link href="/" style={{ color: '#94A3B8' }}>Inicio</Link>
                        </li>
                        <li>
                            <Link href="/vehiculos" style={{ color: '#94A3B8' }}>Catálogo de Stock</Link>
                        </li>
                        <li>
                            <a href="#contacto" style={{ color: '#94A3B8' }}>Ubicación y Horarios</a>
                        </li>
                        <li>
                            <Link href="/login" style={{ color: '#64748B', fontSize: 12 }}>Acceso Empleados / Admin</Link>
                        </li>
                    </ul>
                </div>

                {/* Columna 3: Contacto Directo */}
                <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FFFFFF', marginBottom: 16 }}>
                        Contacto Directo
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                        {settings.whatsapp && (
                            <a 
                                href={`https://wa.me/${settings.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#25D366', fontWeight: 700 }}
                            >
                                <MessageCircle size={16} />
                                <span>WhatsApp: +{settings.whatsapp}</span>
                            </a>
                        )}
                        {settings.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                                <Phone size={16} style={{ color: '#EA580C' }} />
                                <span>{settings.phone}</span>
                            </div>
                        )}
                        {settings.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                                <Mail size={16} style={{ color: '#EA580C' }} />
                                <span>{settings.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna 4: Ubicación & Horarios */}
                <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#FFFFFF', marginBottom: 16 }}>
                        Visitanos en la Agencia
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: '#94A3B8' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <MapPin size={16} style={{ color: '#EA580C', flexShrink: 0, marginTop: 3 }} />
                            <span>{settings.address || 'Av. del Libertador 4500'}, {settings.city || 'Palermo'}, {settings.province || 'CABA'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Clock size={16} style={{ color: '#EA580C', flexShrink: 0, marginTop: 3 }} />
                            <span>{settings.business_hours || 'Lunes a Viernes de 9:00 a 19:00 hs. Sábados de 10:00 a 14:00 hs.'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="footer-bottom">
                <div>
                    © {year} Special Cars. Todos los derechos reservados.
                </div>
                <div>
                    {settings.legal_info || 'Special Cars S.R.L. — CUIT 30-71234567-8'}
                </div>
            </div>
        </footer>
    );
}
