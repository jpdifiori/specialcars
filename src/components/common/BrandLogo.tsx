import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'light' | 'dark' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export function BrandLogo({ variant = 'light', size = 'md', showText = true }: BrandLogoProps) {
    const isDark = variant === 'dark';

    const iconSizes = {
        sm: 46, // +5px
        md: 65,
        lg: 79
    };

    const textSizes = {
        sm: { special: 27, cars: 28 }, // +5px
        md: { special: 34, cars: 35 },
        lg: { special: 43, cars: 44 }
    };

    const s = iconSizes[size] || 40;
    const ts = textSizes[size] || textSizes.md;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? 8 : 12, userSelect: 'none' }}>
            {/* Isotipo Circular Oficial */}
            <div style={{
                width: s,
                height: s,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                border: '1.5px solid rgba(234, 88, 12, 0.4)',
                backgroundColor: '#0F172A'
            }}>
                <img
                    src="/images/specialcars-icon.jpg"
                    alt="Special Cars Icon"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Tipografía Identitaria Special Cars */}
            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        letterSpacing: '-0.5px'
                    }}>
                        <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: ts.special }}>
                            Special
                        </span>
                        <span style={{ color: '#EA580C', fontSize: ts.cars, marginLeft: 2 }}>
                            Cars
                        </span>
                    </div>

                    {/* Subrayado bicolumnar oficial */}
                    <div style={{ display: 'flex', height: 2.5, marginTop: 3, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: '48%', backgroundColor: isDark ? '#FFFFFF' : '#0F172A' }} />
                        <div style={{ width: '52%', backgroundColor: '#EA580C' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
