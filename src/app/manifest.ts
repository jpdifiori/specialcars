import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Special Cars - Salón de Ventas',
        short_name: 'SpecialCars Salón',
        description: 'App para vendedores de salón de Special Cars: catálogo en vivo, reservas y clientes.',
        start_url: '/vendedor',
        display: 'standalone',
        background_color: '#0B0E14',
        theme_color: '#0B0E14',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml'
            },
            {
                src: '/images/specialcars-icon.png',
                sizes: '512x512',
                type: 'image/png'
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png'
            }
        ]
    };
}
