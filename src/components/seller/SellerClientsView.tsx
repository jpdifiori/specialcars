'use client';

import { useState } from 'react';
import { Client } from '@/lib/types';
import { createSellerClient } from '@/lib/actions/seller';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { 
    Users, 
    Search, 
    X, 
    Phone, 
    Plus, 
    UserPlus, 
    Mail, 
    MapPin, 
    AlertCircle, 
    Check, 
    Loader2 
} from 'lucide-react';

export function SellerClientsView({ initialClients }: { initialClients: Client[] }) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formulario nuevo cliente
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredClients = clients.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase().trim();
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
        return fullName.includes(q) || (c.phone && c.phone.includes(q)) || (c.email && c.email.toLowerCase().includes(q));
    });

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await createSellerClient({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                city: city.trim() || undefined,
                notes: notes.trim() || undefined
            });

            if (!res.success || !res.client) {
                setError(res.error || 'No se pudo crear el cliente.');
                return;
            }

            setClients((prev) => [res.client as Client, ...prev]);
            setIsModalOpen(false);
            setFirstName('');
            setLastName('');
            setPhone('');
            setEmail('');
            setCity('');
            setNotes('');
        } catch (err: any) {
            setError(err.message || 'Error al guardar cliente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* ENCABEZADO */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.5 }}>
                        Clientes de Salón
                    </h1>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {filteredClients.length} {filteredClients.length === 1 ? 'contacto' : 'contactos'}
                    </div>
                </div>

                <button
                    onClick={() => {
                        setError(null);
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
                    <span>Nuevo</span>
                </button>
            </div>

            {/* BUSCADOR */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search
                    size={17}
                    style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748B'
                    }}
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, apellido o celular..."
                    style={{
                        width: '100%',
                        backgroundColor: '#111622',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '11px 40px 11px 42px',
                        color: '#FFFFFF',
                        fontSize: 14,
                        outline: 'none'
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            padding: 4,
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* LISTA DE CLIENTES */}
            {filteredClients.length === 0 ? (
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
                    <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                        No se encontraron clientes
                    </p>
                    <p style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                        Registrá un nuevo contacto con el botón "Nuevo".
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                        + Agregar Cliente
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredClients.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                backgroundColor: '#111622',
                                borderRadius: 14,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
                                    {c.first_name} {c.last_name}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4, fontSize: 12.5, color: '#94A3B8' }}>
                                    {c.phone && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#CBD5E1', fontWeight: 600 }}>
                                            <Phone size={12} style={{ color: '#64748B' }} />
                                            <span>{c.phone}</span>
                                        </span>
                                    )}
                                    {c.city && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={12} style={{ color: '#64748B' }} />
                                            <span>{c.city}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* BOTONES DE ACCIÓN DIRECTA */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                {c.phone && (
                                    <>
                                        <a
                                            href={`tel:${c.phone}`}
                                            title="Llamar al cliente"
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                color: '#FFFFFF',
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Phone size={15} />
                                        </a>

                                        <a
                                            href={buildWhatsAppUrl(
                                                c.whatsapp || c.phone,
                                                `Hola ${c.first_name}, te escribo de Special Cars. ¿Cómo estás?`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Enviar WhatsApp"
                                            style={{
                                                backgroundColor: '#25D366',
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <WhatsAppIcon size={18} color="#FFFFFF" />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL NUEVO CLIENTE RÁPIDO */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: '0 0 max(env(safe-area-inset-bottom), 0px) 0'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#111622',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            width: '100%',
                            maxWidth: 540,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: 20,
                            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#EA580C',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF'
                                    }}
                                >
                                    <UserPlus size={18} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                        Nuevo Cliente
                                    </h3>
                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                        Carga rápida para contacto de salón
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    padding: 6,
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    color: '#FCA5A5',
                                    fontSize: 12.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 14
                                }}
                            >
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Ej: Carlos"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            color: '#FFFFFF',
                                            fontSize: 13.5
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Ej: Pérez"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            color: '#FFFFFF',
                                            fontSize: 13.5
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                    Celular / WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Ej: 2262551122"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0B0E14',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        color: '#FFFFFF',
                                        fontSize: 13.5
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                        Email (opcional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            color: '#FFFFFF',
                                            fontSize: 13.5
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                        Localidad (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Ej: Necochea"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            color: '#FFFFFF',
                                            fontSize: 13.5
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                                    Notas comerciales
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ej: Interesado en cambiar su auto por una camioneta"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0B0E14',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        color: '#FFFFFF',
                                        fontSize: 13.5
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#EA580C',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '13px',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 800,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    marginTop: 6,
                                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)'
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={17} strokeWidth={2.5} />
                                        <span>Guardar Cliente</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
