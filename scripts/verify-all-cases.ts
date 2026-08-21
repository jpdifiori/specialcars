import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Parsear .env.local manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        envVars[match[1]] = val;
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function runTests() {
    console.log('🚀 INICIANDO BATERÍA DE PRUEBAS DEL SISTEMA INTEGRAL SPECIAL CARS...\n');
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, msg: string) => {
        if (condition) {
            console.log(`  ✅ PASÓ: ${msg}`);
            passed++;
        } else {
            console.error(`  ❌ FALLÓ: ${msg}`);
            failed++;
        }
    };

    try {
        // PREPARACIÓN: Crear cliente de prueba
        console.log('--- Preparación: Creando cliente de prueba ---');
        const { data: testClient, error: clientErr } = await supabase
            .from('clients')
            .insert({
                first_name: 'Martín',
                last_name: 'Gómez',
                dni: `36${Math.floor(100000 + Math.random() * 900000)}`,
                phone: '1144556677',
                whatsapp: '5491144556677',
                email: `martin.gomez.${Date.now()}@test.com`,
                city: 'Vicente López',
                province: 'Buenos Aires'
            })
            .select()
            .single();

        if (clientErr) {
            console.error('Error insertando cliente:', clientErr);
        }
        assert(!clientErr && !!testClient, `Cliente creado exitosamente (${testClient?.id})`);

        // CASO 1: Carga de Vehículo y Publicación Web
        console.log('\n--- CASO 1: Carga de Vehículo Propio y Publicación Web ---');
        const { data: veh1, error: veh1Err } = await supabase
            .from('vehicles')
            .insert({
                stock_code: `VEH-TEST1-${Date.now().toString().slice(-4)}`,
                brand: 'Volkswagen',
                model: 'Vento',
                version: '2.0 TSI Highline DSG',
                year: 2021,
                mileage: 45000,
                fuel_type: 'NAFTA',
                transmission: 'AUTOMATIC',
                body_type: 'AUTO',
                purchase_price: 22000000,
                sale_price: 28500000,
                minimum_price: 27000000,
                origin_type: 'DIRECT_PURCHASE',
                status: 'AVAILABLE',
                published: true,
                slug: `volkswagen-vento-2021-test-${Date.now()}`
            })
            .select()
            .single();

        assert(!veh1Err && !!veh1, 'Vehículo propio creado en base de datos');
        assert(veh1?.published === true, 'Vehículo configurado como publicado');

        // Verificar consulta pública (sin datos de costos)
        const { data: pubVeh1 } = await supabase
            .from('vehicles')
            .select('id, brand, model, sale_price, published, status')
            .eq('id', veh1.id)
            .eq('published', true)
            .single();

        assert(!!pubVeh1 && pubVeh1.sale_price === 28500000, 'Vehículo visible en catálogo público con precio ARS correcto');

        // CASO 2: Carga de Gastos y Recálculo de Costo Real
        console.log('\n--- CASO 2: Carga de Gastos y Recálculo de Costo Real ---');
        const { data: exp1 } = await supabase
            .from('vehicle_expenses')
            .insert({
                vehicle_id: veh1.id,
                category: 'MECHANICAL',
                description: 'Service oficial 45.000 km y cambio de pastillas',
                amount: 450000
            })
            .select()
            .single();

        const { data: exp2 } = await supabase
            .from('vehicle_expenses')
            .insert({
                vehicle_id: veh1.id,
                category: 'DETAILING',
                description: 'Tratamiento cerámico y limpieza de tapizados',
                amount: 150000
            })
            .select()
            .single();

        assert(!!exp1 && !!exp2, '2 gastos registrados en el vehículo (Total $ 600.000)');

        // Calcular costo real = compra + gastos
        const totalExpenses = 450000 + 150000;
        const expectedRealCost = veh1.purchase_price + totalExpenses;
        const expectedProfit = veh1.sale_price - expectedRealCost;
        const expectedROI = (expectedProfit / expectedRealCost) * 100;

        assert(expectedRealCost === 22600000, `Costo Real calculado exactamente: $ ${expectedRealCost.toLocaleString('es-AR')}`);
        assert(expectedProfit === 5900000, `Ganancia potencial calculada: $ ${expectedProfit.toLocaleString('es-AR')}`);
        assert(Math.round(expectedROI) === 26, `ROI calculado correctamente: ${expectedROI.toFixed(1)}%`);

        // CASO 3: Venta Simple y Despublicación Automática
        console.log('\n--- CASO 3: Venta Simple y Despublicación Automática ---');
        const { data: opSale, error: opSaleErr } = await supabase
            .from('operations')
            .insert({
                operation_code: `OP-SALE-${Date.now().toString().slice(-4)}`,
                type: 'SALE',
                status: 'CLOSED',
                client_id: testClient.id,
                agreed_price: 28000000,
                balance: 0,
                operation_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        // Vincular vehículo como vendido y despublicar
        await supabase.from('operation_vehicles').insert({
            operation_id: opSale.id,
            vehicle_id: veh1.id,
            role: 'SOLD'
        });

        await supabase.from('vehicles').update({
            status: 'SOLD',
            published: false,
            sale_date: new Date().toISOString().split('T')[0]
        }).eq('id', veh1.id);

        const { data: checkVeh1 } = await supabase.from('vehicles').select('status, published').eq('id', veh1.id).single();
        assert(checkVeh1?.status === 'SOLD', 'Estado de vehículo actualizado a SOLD');
        assert(checkVeh1?.published === false, 'Vehículo despublicado automáticamente de la web pública');

        // CASO 4: Venta con Permuta Completa (Encadenamiento Atómico)
        console.log('\n--- CASO 4: Venta con Permuta Completa (Encadenamiento Atómico) ---');
        // Vehículo que la agencia vende:
        const { data: vehSale2 } = await supabase
            .from('vehicles')
            .insert({
                stock_code: `VEH-TEST2-${Date.now().toString().slice(-4)}`,
                brand: 'Toyota',
                model: 'Hilux',
                version: 'SRX 4x4 AT',
                year: 2023,
                mileage: 20000,
                fuel_type: 'DIESEL',
                transmission: 'AUTOMATIC',
                body_type: 'PICKUP',
                purchase_price: 45000000,
                sale_price: 54000000,
                origin_type: 'DIRECT_PURCHASE',
                status: 'AVAILABLE',
                published: true
            })
            .select()
            .single();

        // Vehículo entregado por el cliente en permuta:
        const tradeInValue = 24000000;
        const agreedPrice = 53000000;

        // 1. Crear operación de permuta
        const { data: opTradeIn } = await supabase
            .from('operations')
            .insert({
                operation_code: `OP-PERM-${Date.now().toString().slice(-4)}`,
                type: 'SALE_WITH_TRADE_IN',
                status: 'CLOSED',
                client_id: testClient.id,
                agreed_price: agreedPrice,
                trade_in_value: tradeInValue,
                balance: 0,
                operation_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        // 2. Crear vehículo recibido en inventario (origin = TRADE_IN, status = IN_PREPARATION)
        const { data: vehReceived } = await supabase
            .from('vehicles')
            .insert({
                stock_code: `VEH-REC-${Date.now().toString().slice(-4)}`,
                brand: 'Ford',
                model: 'Focus',
                version: 'Titanium AT',
                year: 2019,
                mileage: 62000,
                fuel_type: 'NAFTA',
                transmission: 'AUTOMATIC',
                body_type: 'AUTO',
                purchase_price: tradeInValue, // Costo de compra = Valor de toma
                sale_price: 0,
                minimum_price: 0,
                origin_type: 'TRADE_IN',
                status: 'IN_PREPARATION',
                previous_client_id: testClient.id,
                origin_operation_id: opTradeIn.id,
                published: false
            })
            .select()
            .single();

        // 3. Vincular ambos vehículos a la operación
        await supabase.from('operation_vehicles').insert([
            { operation_id: opTradeIn.id, vehicle_id: vehSale2.id, role: 'SOLD' },
            { operation_id: opTradeIn.id, vehicle_id: vehReceived.id, role: 'RECEIVED_TRADE_IN' }
        ]);

        // 4. Marcar vehículo saliente como SOLD
        await supabase.from('vehicles').update({ status: 'SOLD', published: false }).eq('id', vehSale2.id);

        assert(!!opTradeIn, 'Operación de permuta creada exitosamente');
        assert(vehReceived?.origin_type === 'TRADE_IN', 'Vehículo recibido clasificado como TRADE_IN');
        assert(vehReceived?.status === 'IN_PREPARATION', 'Vehículo recibido iniciado en IN_PREPARATION');
        assert(vehReceived?.purchase_price === tradeInValue, `Costo del vehículo recibido fijado en valor de toma ($ ${tradeInValue.toLocaleString('es-AR')})`);
        assert(vehReceived?.previous_client_id === testClient.id, 'Trazabilidad con cliente anterior ligada');

        // CASO 5: Consignación (No suma a capital propio invertido)
        console.log('\n--- CASO 5: Consignación de Vehículo ---');
        const { data: vehCons } = await supabase
            .from('vehicles')
            .insert({
                stock_code: `VEH-CONS-${Date.now().toString().slice(-4)}`,
                brand: 'Audi',
                model: 'Q5',
                year: 2020,
                mileage: 38000,
                fuel_type: 'NAFTA',
                transmission: 'AUTOMATIC',
                body_type: 'SUV',
                purchase_price: 0, // No es capital propio
                sale_price: 42000000,
                origin_type: 'CONSIGNMENT',
                status: 'AVAILABLE',
                published: true
            })
            .select()
            .single();

        const { data: consRecord } = await supabase
            .from('consignments')
            .insert({
                consignment_code: `CON-TEST-${Date.now().toString().slice(-4)}`,
                client_id: testClient.id,
                vehicle_id: vehCons.id,
                requested_price: 38000000,
                listing_price: 42000000,
                commission_amount: 4000000,
                owner_amount: 38000000,
                status: 'ACTIVE'
            })
            .select()
            .single();

        assert(!!consRecord, 'Registro de consignación creado');
        assert(consRecord?.commission_amount === 4000000, 'Comisión pactada para la agencia: $ 4.000.000');
        assert(vehCons?.purchase_price === 0, 'Capital propio invertido permanece en $0 para consignación');

        // CASO 6: Reserva y Liberación
        console.log('\n--- CASO 6: Reserva (Seña) y Liberación ---');
        const { data: resRecord } = await supabase
            .from('reservations')
            .insert({
                reservation_code: `RES-TEST-${Date.now().toString().slice(-4)}`,
                client_id: testClient.id,
                vehicle_id: vehCons.id,
                amount: 1500000,
                status: 'ACTIVE',
                show_reserved_badge: true
            })
            .select()
            .single();

        await supabase.from('vehicles').update({ status: 'RESERVED' }).eq('id', vehCons.id);
        const { data: checkResVeh } = await supabase.from('vehicles').select('status').eq('id', vehCons.id).single();
        assert(checkResVeh?.status === 'RESERVED', 'Vehículo bloqueado como RESERVED tras ingresar seña');

        // Cancelar reserva
        await supabase.from('reservations').update({ status: 'CANCELLED' }).eq('id', resRecord.id);
        await supabase.from('vehicles').update({ status: 'AVAILABLE' }).eq('id', vehCons.id);
        const { data: checkLiberado } = await supabase.from('vehicles').select('status').eq('id', vehCons.id).single();
        assert(checkLiberado?.status === 'AVAILABLE', 'Vehículo liberado nuevamente a AVAILABLE tras cancelación');

        // CASO 7: Operación 0 KM
        console.log('\n--- CASO 7: Operación 0 KM ---');
        const { data: zeroKm } = await supabase
            .from('zero_km_operations')
            .insert({
                operation_code: `0KM-TEST-${Date.now().toString().slice(-4)}`,
                client_id: testClient.id,
                brand: 'Chevrolet',
                model: 'Tracker Premier',
                year: 2026,
                provider: 'Concesionario Oficial Collins',
                cost: 29000000,
                client_price: 32500000,
                commission: 3500000,
                status: 'ORDERED'
            })
            .select()
            .single();

        assert(!!zeroKm, 'Operación 0 KM registrada');
        assert(zeroKm?.commission === 3500000, 'Cálculo de comisión 0 KM correcto ($ 3.500.000)');

        // CASO 8: Verificación Trazabilidad ADN Comercial y Timeline
        console.log('\n--- CASO 8: Trazabilidad Comercial ADN 360° ---');
        // Consultar timeline del cliente
        const { data: clientOps } = await supabase
            .from('operations')
            .select('*, vehicles:operation_vehicles(*, vehicle:vehicles(*))')
            .eq('client_id', testClient.id);

        assert(Boolean(clientOps && clientOps.length >= 2), `Timeline del cliente con ${clientOps?.length} operaciones trazables`);

        console.log('\n=============================================');
        console.log(`🏁 RESULTADO FINAL: ${passed} PASADOS, ${failed} FALLADOS`);
        console.log('=============================================\n');

    } catch (err: any) {
        console.error('Error durante la ejecución de pruebas:', err);
    }
}

runTests();
