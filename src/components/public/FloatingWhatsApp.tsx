'use client';

import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber?: string }) {
    const wp = whatsappNumber || '5491140980758';

    return (
        <a
            href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la página web de Special Cars para hacer una consulta.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-whatsapp"
            title="Consultar por WhatsApp"
        >
            <MessageCircle size={32} />
        </a>
    );
}
