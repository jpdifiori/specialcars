'use client';

import { useState } from 'react';
import { Reservation } from '@/lib/types';
import { SellerVehicle } from '@/lib/actions/seller';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { SellerQuickReservationModal } from '@/components/seller/SellerQuickReservationModal';
import { 
    BookmarkCheck, 
    Plus, 
    Car, 
    User, 
    Calendar, 
    Clock, 
    Phone, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

export function SellerReservationsView({ 
    initialReservations,
    availableVehicles
}: { 
    initialReservations: Reservation[];
    availableVehicles: SellerVehicle[];
}) {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<SellerVehicle | null>(availableVehicles[0] || null);

    return (
        <div>
            {/* ENCABEZADO */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.5 }}>
                        Señas de Salón
                    </h1>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {reservations.filter((r) => r.status === 'ACTIVE').length} reservas activas
                    </div>
                </div>

                {availableVehicles.length > 0 && (
                    <button
                        onClick={() => {
                            if (!selectedVehicle && availableVehicles.length > 0) {
                                setSelectedVehicle(availableVehicles[0]);
                            }
                            setIsModalOpen(true);
                        }}
                        style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(234, 88, 12, 0.35)'
                        }}
                    >
                        <Plus size={16} />
                        <span>Tomar Seña</span>
                    </button>
                )}
            </div>

            {/* LISTA DE RESERVAS */}
            {reservations.length === 0 ? (
                <div
                    style={{
                        backgroundColor: '#111622',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94A3B8'
                    }}
                >
                    <BookmarkCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                        No hay reservas activas en este momento
                    </p>
                    <p style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                        Cuando un cliente señe un auto para congelar el precio o la unidad, cargá la seña acá para bloquear el vehículo.
                    </p>
                    {availableVehicles.length > 0 && (
                        <button
                            onClick={() => {
                                setSelectedVehicle(availableVehicles[0]);
                                setIsModalOpen(true);
                            }}
                            style={{
                                backgroundColor: '#EA580C',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 16px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            + Tomar Seña de Auto
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reservations.map((r) => {
                        const isActive = r.status === 'ACTIVE';

                        return (
                            <div
                                key={r.id}
                                style={{
                                    backgroundColor: '#111622',
                                    borderRadius: 14,
                                    border: isActive ? '1px solid rgba(234, 88, 12, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    padding: 14,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                                            {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model} (${r.vehicle.year})` : 'Vehículo no especificado'}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                                            Cliente: <strong style={{ color: '#E2E8F0' }}>{r.client ? `${r.client.first_name} ${r.client.last_name}` : 'Anónimo'}</strong>
                                        </div>
                                    </div>

                                    <span
                                        style={{
                                            fontSize: 10.5,
                                            fontWeight: 800,
                                            padding: '3px 8px',
                                            borderRadius: 6,
                                            backgroundColor: isActive ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                                            color: isActive ? '#FB923C' : '#94A3B8',
                                            border: isActive ? '1px solid rgba(234, 88, 12, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        {r.status}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        marginTop: 8
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Seña Ingresada</div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                                            {formatARS(r.amount)}
                                        </div>
                                    </div>

                                    {r.expiry_date && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Vencimiento</div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>
                                                {formatDate(r.expiry_date)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTACTO CON EL CLIENTE */}
                                {r.client?.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                                            <Phone size={12} />
                                            <span>{r.client.phone}</span>
                                        </div>

                                        <a
                                            href={buildWhatsAppUrl(
                                                r.client.whatsapp || r.client.phone,
                                                `Hola ${r.client.first_name}, te escribo de Special Cars por la seña del ${r.vehicle ? r.vehicle.brand + ' ' + r.vehicle.model : 'vehículo'}. ¿Cómo estás?`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                backgroundColor: '#25D366',
                                                borderRadius: 14,
                                                padding: '4px 10px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                color: '#FFFFFF',
                                                fontSize: 11.5,
                                                fontWeight: 800,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <WhatsAppIcon size={13} color="#FFFFFF" />
                                            <span>WhatsApp</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE SEÑA RÁPIDA */}
            <SellerQuickReservationModal
                isOpen={isModalOpen}
                vehicle={selectedVehicle}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Refrescar página para traer la nueva reserva
                    window.location.reload();
                }}
            />
        </div>
    );
}
