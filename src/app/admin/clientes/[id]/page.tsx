import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClient360 } from '@/lib/actions/clients';
import { formatDate } from '@/lib/utils/dates';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { 
    ArrowLeft, 
    User, 
    Phone, 
    MessageCircle,
    Mail, 
    MapPin, 
    Calendar, 
    ArrowLeftRight, 
    Car, 
    Clock, 
    BookmarkCheck,
    FileSpreadsheet,
    Globe,
    UserCheck
} from 'lucide-react';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient360(id);

    if (!client) {
        notFound();
    }

    const isWebClient = Boolean(client.notes && (client.notes.includes('Landing Page') || client.notes.toLowerCase().includes('automáticamente')));

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
                            backgroundColor: isWebClient ? '#1E40AF' : '#1d4ed8',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <h1 className="admin-page-title" style={{ margin: 0 }}>
                                    {client.first_name} {client.last_name}
                                </h1>
                                {isWebClient ? (
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        backgroundColor: '#EFF6FF',
                                        color: '#1D4ED8',
                                        border: '1px solid #BFDBFE',
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <Globe size={11} />
                                        <span>Registrado desde Web (Landing Page)</span>
                                    </span>
                                ) : (
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        backgroundColor: '#F1F5F9',
                                        color: '#475569',
                                        border: '1px solid #CBD5E1',
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <UserCheck size={11} />
                                        <span>Cargado por Admin</span>
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                                Cliente desde el {formatDate(client.created_at)} • {client.operations_count || 0} operaciones registradas
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link 
                            href={`/admin/vehiculos-buscados/nuevo?client_id=${client.id}`} 
                            className="btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <span>+ Registrar Pedido de Auto</span>
                        </Link>
                        <Link href={`/admin/operaciones/nueva?clientId=${client.id}`} className="btn-primary">
                            <ArrowLeftRight size={15} />
                            <span>Crear Operación</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grid 360°: Info Personal + Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Columna Izquierda: Ficha de Contacto */}
                <div className="table-container" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 16 }}>
                        Datos de Contacto & Documentación
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
                        {client.dni && (
                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>DNI</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#000000' }}>{client.dni}</div>
                            </div>
                        )}

                        {client.cuit_cuil && (
                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>CUIT / CUIL</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#000000' }}>{client.cuit_cuil}</div>
                            </div>
                        )}

                        {client.phone && (
                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Teléfono / WhatsApp</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0F172A', fontWeight: 700 }}>
                                        <Phone size={14} style={{ color: '#64748B' }} />
                                        <span>{client.phone}</span>
                                    </span>
                                    <a
                                        href={buildWhatsAppUrl(
                                            client.phone,
                                            `Hola${client.first_name ? ' ' + client.first_name : ''}, te escribo de Special Cars. ¿Cómo estás?`
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Abrir chat en WhatsApp Web"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            backgroundColor: '#25D366',
                                            color: '#FFFFFF',
                                            boxShadow: '0 1px 3px rgba(37, 211, 102, 0.35)',
                                            textDecoration: 'none',
                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                            flexShrink: 0
                                        }}
                                    >
                                        <MessageCircle size={13} strokeWidth={2.4} />
                                    </a>
                                </div>
                            </div>
                        )}

                        {client.email && (
                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Email</div>
                                <div style={{ color: '#EA580C', fontWeight: 600 }}>{client.email}</div>
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
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000' }}>
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
