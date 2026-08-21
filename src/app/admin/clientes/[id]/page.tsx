import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClient360 } from '@/lib/actions/clients';
import { formatDate } from '@/lib/utils/dates';
import { 
    ArrowLeft, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    ArrowLeftRight, 
    Car, 
    Clock, 
    BookmarkCheck,
    FileSpreadsheet
} from 'lucide-react';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient360(id);

    if (!client) {
        notFound();
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Link href="/admin/clientes" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Clientes</span>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            backgroundColor: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                        }}>
                            {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <div>
                            <h1 className="admin-page-title" style={{ marginBottom: 2 }}>
                                {client.first_name} {client.last_name}
                            </h1>
                            <div style={{ fontSize: 13, color: '#000000' }}>
                                Cliente desde el {formatDate(client.created_at)} • {client.operations_count || 0} operaciones registradas
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href={`/admin/operaciones/nueva?clientId=${client.id}`} className="btn-primary">
                            <ArrowLeftRight size={15} />
                            <span>Crear Operación con este Cliente</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grid 360°: Info Personal + Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Columna Izquierda: Ficha de Contacto */}
                <div className="table-container" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                        Datos de Contacto & Documentación
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
                        {client.dni && (
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600 }}>DNI</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>{client.dni}</div>
                            </div>
                        )}

                        {client.cuit_cuil && (
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600 }}>CUIT / CUIL</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>{client.cuit_cuil}</div>
                            </div>
                        )}

                        {client.phone && (
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600 }}>Teléfono / WhatsApp</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 600 }}>
                                    <Phone size={14} />
                                    <span>{client.phone}</span>
                                </div>
                            </div>
                        )}

                        {client.email && (
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                                <div style={{ color: '#60a5fa' }}>{client.email}</div>
                            </div>
                        )}

                        {(client.address || client.city) && (
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600 }}>Dirección</div>
                                <div style={{ color: '#000000' }}>
                                    {client.address ? `${client.address}, ` : ''} {client.city || ''} {client.province ? `(${client.province})` : ''}
                                </div>
                            </div>
                        )}

                        {client.notes && (
                            <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Notas Internas</div>
                                <div style={{ fontSize: 13, color: '#000000', lineHeight: 1.5 }}>
                                    {client.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Timeline 360° de Actividad */}
                <div className="table-container" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                            Timeline 360° de Actividad
                        </h3>
                        <span style={{ fontSize: 12, color: '#000000' }}>
                            Historial completo de interacciones comerciales
                        </span>
                    </div>

                    {(!client.timeline || client.timeline.length === 0) ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>
                            <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                            <p style={{ fontSize: 14 }}>Aún no hay actividad registrada para este cliente.</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {client.timeline.map((event) => (
                                <div key={event.id} className="timeline-item">
                                    <div className="timeline-dot" />
                                    <div className="timeline-date">{formatDate(event.date)}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="timeline-title">{event.title}</span>
                                        {event.badge && (
                                            <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                                {event.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="timeline-desc">{event.description}</div>
                                    {event.link && (
                                        <Link href={event.link} style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginTop: 4, display: 'inline-block', textDecoration: 'underline' }}>
                                            Ver detalle de operación →
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
