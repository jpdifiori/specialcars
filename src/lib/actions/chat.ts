'use server';

import { getAgencySettings } from './settings';
import { getPublicVehicles } from './vehicles';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function sendMessageToAssistant(
    messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ success: boolean; reply: string }> {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

        // 1. Obtener información de la agencia y catálogo en tiempo real
        const [settings, vehiclesResult] = await Promise.all([
            getAgencySettings(),
            getPublicVehicles({ limit: 100 })
        ]);

        const vehiclesList = (vehiclesResult.data || []).map((v, i) => {
            const priceInfo = v.hide_price 
                ? 'Precio: A consultar / cotización personalizada según forma de pago y permuta'
                : `Precio: $ ${v.price.toLocaleString('es-AR')} ARS`;

            return `${i + 1}. ${v.brand} ${v.model} ${v.version || ''} (${v.year})
   - Estado: ${v.status === 'AVAILABLE' ? 'Disponible para entrega inmediata' : 'Reservado'}
   - Kilometraje: ${v.mileage === 0 ? '0 KM (Nuevo sin rodar)' : `${v.mileage.toLocaleString('es-AR')} km`}
   - Transmisión: ${v.transmission} | Combustible: ${v.fuel_type} | Carrocería: ${v.body_type}
   - Color: ${v.exterior_color || 'No especificado'}
   - ${priceInfo}
   - Link ficha web: /vehiculos/${v.slug || v.id}
   ${v.description ? `- Descripción: ${v.description.slice(0, 150)}...` : ''}`;
        }).join('\n\n');

        const systemPrompt = `Eres "Special Bot", el asistente de Inteligencia Artificial oficial de la concesionaria "Special Cars" en Necochea, Buenos Aires, Argentina.
Tu misión es atender a los visitantes de nuestra web con extrema calidez, rapidez, amabilidad y profesionalismo, respondiendo todas sus consultas sobre nuestros vehículos, servicios, ubicación y formas de contacto.

=== INFORMACIÓN OFICIAL DE SPECIAL CARS ===
- Nombre de la Concesionaria: ${settings.name || 'Special Cars'}
- Dirección del Showroom: ${settings.address || 'Calle 48 2350'}${settings.city ? `, ${settings.city}` : ''}${settings.province ? `, ${settings.province}` : ''}
- Teléfono de Atención: ${settings.phone || '+54 2262 57-4254'}
- WhatsApp Oficial: ${settings.whatsapp || '5492262574254'} (+54 9 2262 57-4254)
- Enlace directo a WhatsApp: https://wa.me/${settings.whatsapp || '5492262574254'}
- Horarios de Atención: ${settings.business_hours || 'Lunes a Viernes de 8:00 a 17:00 hs. Sábados de 08:00 a 12:30 hs.'}
- Email: ${settings.email || 'contacto@specialcars.com.ar'}
- Servicios que brindamos:
  1. Venta de autos usados seleccionados y garantizados.
  2. Venta de unidades 0 KM multimarcas.
  3. Tomamos tu auto usado en parte de pago (Permutas al mejor valor de plaza).
  4. Financiación a medida (créditos prendarios / cuotas fijas en pesos).
  5. Consignaciones: vendemos tu vehículo con la mayor seguridad y exposición.
  6. Gestoría automotor integral para transferencia rápida y segura.

=== CATÁLOGO DE VEHÍCULOS DISPONIBLES EN STOCK HOY ===
${vehiclesList.length > 0 ? vehiclesList : 'Actualmente todo nuestro stock está en rotación. Por favor consultanos por WhatsApp para consultar ingresos recientes.'}

=== REGLAS Y DIRECTIVAS DE COMPORTAMIENTO ===
1. Responde SIEMPRE en español de Argentina con tono cordial, profesional y cercano ("Hola!", "Podés", "Tenés", "Te esperamos", etc.).
2. Solo recomienda vehículos que se encuentren en la lista de catálogo anterior. Si el cliente pregunta por una marca o modelo que no tenemos en stock, sé sincero, decile que en este momento no lo tenemos disponible pero podemos tomárselo a pedido o ver qué opciones similares tenemos.
3. Si un vehículo tiene precio a consultar o el cliente pregunta el precio, explícale cordialmente que por política comercial y para brindarle la mejor cotización según si paga al contado o entrega un vehículo en permuta, le invitamos a escribirnos por WhatsApp con el link directo para asesorarlo al instante.
4. Cuando menciones un auto en stock, incluye siempre el enlace a la ficha web en formato markdown: [Ver auto](/vehiculos/slug-del-auto).
5. Si el cliente quiere reservar, ver el auto en persona, cotizar su permuta o hablar con un asesor humano, bríndale el enlace de WhatsApp: https://wa.me/${settings.whatsapp || '5492262574254'}.
6. Mantén las respuestas claras, concisas y bien formateadas (usá viñetas y negritas cuando aporte claridad).`;

        // Si no hay API KEY configurada en el entorno actual
        if (!apiKey) {
            return {
                success: true,
                reply: `¡Hola! Bienvenido a **Special Cars**. 🚗✨\n\nEstamos en **${settings.address || 'Calle 48 2350'}** (${settings.business_hours || 'Lun a Vie de 8:00 a 17:00 hs'}).\n\nPodés explorar nuestro catálogo completo de vehículos publicados en la sección **Catálogo** o escribirnos directamente a nuestro **WhatsApp oficial (+54 9 2262 57-4254)** para una atención personalizada inmediata:\n\n👉 [Escribinos por WhatsApp](https://wa.me/${settings.whatsapp || '5492262574254'})`
            };
        }

        // 2. Llamada a la API de DeepSeek
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.slice(-8) // Últimos 8 mensajes para contexto óptimo
                ],
                temperature: 0.6,
                max_tokens: 1000
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API error:', response.status, errText);
            return {
                success: true,
                reply: `¡Hola! Podés consultar todo nuestro stock en la web o comunicarte directamente con nuestros asesores en WhatsApp (+54 9 2262 57-4254):\n\n👉 [Contactar por WhatsApp](https://wa.me/${settings.whatsapp || '5492262574254'})`
            };
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '¡Hola! ¿En qué vehículo o servicio de Special Cars estás interesado?';

        return { success: true, reply };
    } catch (error: any) {
        console.error('Error in sendMessageToAssistant:', error);
        return {
            success: true,
            reply: '¡Hola! Ocurrió una pequeña intermitencia de red. Podés escribirnos directamente a nuestro WhatsApp oficial (+54 9 2262 57-4254) para que un asesor te responda de inmediato.'
        };
    }
}
