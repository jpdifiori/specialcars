'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('juanpablo.difiori@gmail.com');
    const [password, setPassword] = useState('SpecialCars2026!');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error: authErr } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authErr) {
                setError(authErr.message === 'Invalid login credentials' 
                    ? 'Credenciales inválidas. Verificá tu email y contraseña.' 
                    : authErr.message);
                return;
            }

            if (data.user) {
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al intentar iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07090e',
            backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)',
            padding: 24
        }}>
            <div style={{
                width: '100%',
                maxWidth: 440,
                backgroundColor: '#0f1420',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '40px 32px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 22,
                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
                    }}>
                        SC
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                        Special Cars
                    </h1>
                    <p style={{ fontSize: 13.5, color: '#64748b' }}>
                        Acceso exclusivo al panel administrativo
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        color: '#fda4af',
                        fontSize: 13.5,
                        marginBottom: 20
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                            Email de Administrador
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu-email@gmail.com"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#151b2a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: '12px 14px 12px 42px',
                                    color: '#f8fafc',
                                    fontSize: 14
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#151b2a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                    padding: '12px 14px 12px 42px',
                                    color: '#f8fafc',
                                    fontSize: 14
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            padding: '13px',
                            borderRadius: 8,
                            fontSize: 14.5,
                            fontWeight: 700,
                            marginTop: 10,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <span>{loading ? 'Iniciando sesión...' : 'Ingresar al Panel'}</span>
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 28,
                    fontSize: 12,
                    color: '#64748b'
                }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span>Conexión segura cifrada con Supabase Auth</span>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#07090e' }} />}>
            <LoginForm />
        </Suspense>
    );
}
