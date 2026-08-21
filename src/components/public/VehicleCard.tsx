import Link from 'next/link';
import { PublicVehicleItem } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { Gauge, Fuel, Cog, Calendar, ArrowRight, Image as ImageIcon, MessageCircle } from 'lucide-react';

export function VehicleCard({ vehicle }: { vehicle: PublicVehicleItem }) {
    const slugUrl = `/vehiculos/${vehicle.slug || vehicle.id}`;
    const wpNumber = '5492262574254';
    const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} (${vehicle.year})`.replace(/\s+/g, ' ').trim();
    const wpMsg = `Hola, necesito mas información sobre el vehículo ${vehicleName}`;
    const wpUrl = `https://wa.me/${wpNumber}?text=${encodeURIComponent(wpMsg)}`;

    return (
        <div className="vehicle-card">
            {/* Foto de Portada */}
            <Link href={slugUrl} className="vehicle-card-image-wrap">
                {vehicle.primary_image_url ? (
                    <img 
                        src={vehicle.primary_image_url} 
                        alt={`${vehicle.brand} ${vehicle.model}`} 
                        className="vehicle-card-img"
                        loading="lazy"
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ImageIcon size={32} />
                    </div>
                )}

                {vehicle.featured && (
                    <div className="vehicle-card-badge-featured">
                        Destacado
                    </div>
                )}

                {vehicle.status === 'RESERVED' && (
                    <div className="vehicle-card-badge-reserved">
                        Reservado
                    </div>
                )}
            </Link>

            {/* Cuerpo de la Card */}
            <div className="vehicle-card-body">
                <Link href={slugUrl}>
                    <h3 className="vehicle-card-title">
                        {vehicle.brand} {vehicle.model}
                    </h3>
                </Link>
                <div className="vehicle-card-version">
                    {vehicle.version || vehicle.commercial_title || `${vehicle.year}`}
                </div>

                {/* Especificaciones Clave */}
                <div className="vehicle-card-specs">
                    <div className="spec-item">
                        <Calendar size={13} className="spec-icon" />
                        <span>{vehicle.year}</span>
                    </div>
                    <div className="spec-item">
                        <Gauge size={13} className="spec-icon" />
                        <span>{vehicle.mileage?.toLocaleString('es-AR')} km</span>
                    </div>
                    <div className="spec-item">
                        <Fuel size={13} className="spec-icon" />
                        <span>{vehicle.fuel_type}</span>
                    </div>
                    <div className="spec-item">
                        <Cog size={13} className="spec-icon" />
                        <span>{vehicle.transmission}</span>
                    </div>
                </div>

                {/* Footer: Precio ARS y Link */}
                <div className="vehicle-card-footer">
                    <div>
                        <div className="vehicle-card-price-label">
                            {vehicle.hide_price ? 'Precio' : 'Precio Final'}
                        </div>
                        {vehicle.hide_price ? (
                            <a
                                href={wpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    color: '#EA580C',
                                    fontSize: 16.5,
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                title="Consultar precio por WhatsApp"
                            >
                                <span>Consultar precio!</span>
                                <span style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    backgroundColor: '#25D366',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF',
                                    flexShrink: 0,
                                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.4)'
                                }}>
                                    <MessageCircle size={13} />
                                </span>
                            </a>
                        ) : (
                            <div className="vehicle-card-price" style={{ color: '#EA580C', fontSize: 20, fontWeight: 800 }}>
                                {formatARS(vehicle.price)}
                            </div>
                        )}
                    </div>

                    <Link href={slugUrl} className="btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }}>
                        <span>Ver Detalle</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
