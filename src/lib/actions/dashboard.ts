'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardStats } from '@/lib/types';

/**
 * Obtiene las métricas y KPIs ejecutivos del Dashboard en ARS.
 */
export async function getDashboardData(): Promise<{
    stats: DashboardStats;
    recentOperations: any[];
    recentClients: any[];
    stagnantVehicles: any[];
}> {
    const adminClient = createAdminClient();

    // 1. Obtener vehículos activos
    const { data: vehicles } = await adminClient
        .from('vehicles')
        .select(`
            id, stock_code, brand, model, version, year, plate, sale_price, purchase_price,
            origin_type, status, published, purchase_date, created_at,
            expenses:vehicle_expenses(amount),
            images:vehicle_images(id)
        `)
        .eq('is_deleted', false);

    const vehList = vehicles || [];

    // Contadores de stock
    let totalStock = vehList.length;
    let availableStock = 0;
    let reservedStock = 0;
    let inPrepStock = 0;
    let soldStock = 0;
    let ownStock = 0;
    let consignedStock = 0;
    let tradeInStock = 0;

    let capitalInvested = 0;
    let potentialSaleValue = 0;

    let alertsNoPhotos = 0;
    let alertsNoPrice = 0;
    let alertsNotPublished = 0;
    let alertsStagnantStock = 0;
    const stagnantVehiclesList: any[] = [];

    const now = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    vehList.forEach((v: any) => {
        if (v.status === 'AVAILABLE') availableStock++;
        if (v.status === 'RESERVED') reservedStock++;
        if (v.status === 'IN_PREPARATION') inPrepStock++;
        if (v.status === 'SOLD') soldStock++;

        if (v.status !== 'SOLD') {
            if (v.origin_type === 'CONSIGNMENT') consignedStock++;
            else if (v.origin_type === 'TRADE_IN') tradeInStock++;
            else ownStock++;

            // Finanzas: sólo vehículos propios y de permuta cuentan para el capital invertido (las consignaciones NO son capital propio)
            const expTotal = (v.expenses || []).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
            const pPrice = Number(v.purchase_price) || 0;
            const sPrice = Number(v.sale_price) || 0;

            if (v.origin_type !== 'CONSIGNMENT') {
                capitalInvested += (pPrice + expTotal);
            }
            potentialSaleValue += sPrice;

            // Alertas
            if (!v.images || v.images.length === 0) alertsNoPhotos++;
            if (!v.sale_price || Number(v.sale_price) === 0) alertsNoPrice++;
            if (v.status === 'AVAILABLE' && !v.published) alertsNotPublished++;

            const pDate = new Date(v.purchase_date || v.created_at);
            if (pDate <= sixtyDaysAgo && (v.status === 'AVAILABLE' || v.status === 'RESERVED')) {
                alertsStagnantStock++;
                const daysIn = Math.ceil((now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
                stagnantVehiclesList.push({
                    id: v.id,
                    stock_code: v.stock_code,
                    title: `${v.brand} ${v.model} ${v.year}`,
                    plate: v.plate,
                    days: daysIn,
                    sale_price: v.sale_price
                });
            }
        }
    });

    const potentialProfit = potentialSaleValue - capitalInvested;
    const marginPercentage = capitalInvested > 0 ? (potentialProfit / capitalInvested) * 100 : 0;

    // 2. Operaciones y Ventas del Mes
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { data: monthOps } = await adminClient
        .from('operations')
        .select('agreed_price, trade_in_value')
        .in('type', ['SALE', 'SALE_WITH_TRADE_IN', 'CONSIGNMENT'])
        .eq('status', 'CLOSED')
        .gte('operation_date', firstDayOfMonth)
        .eq('is_deleted', false);

    let monthSalesTotal = 0;
    (monthOps || []).forEach((o: any) => {
        monthSalesTotal += Number(o.agreed_price) || 0;
    });
    const monthUnitsSold = (monthOps || []).length;

    // Ingresados este mes
    const monthUnitsEntered = vehList.filter((v: any) => new Date(v.created_at) >= new Date(firstDayOfMonth)).length;

    // 3. Actividades activas
    const { count: activeReservationsCount } = await adminClient
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')
        .eq('is_deleted', false);

    const { count: activeConsignmentsCount } = await adminClient
        .from('consignments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')
        .eq('is_deleted', false);

    // 4. Últimas operaciones
    const { data: recentOps } = await adminClient
        .from('operations')
        .select(`
            id, operation_code, type, status, agreed_price, operation_date,
            client:clients(id, first_name, last_name, phone),
            vehicles:operation_vehicles(role, vehicle:vehicles(id, stock_code, brand, model, version, year))
        `)
        .eq('is_deleted', false)
        .order('operation_date', { ascending: false })
        .limit(6);

    // 5. Últimos clientes
    const { data: recentClients } = await adminClient
        .from('clients')
        .select('id, first_name, last_name, phone, email, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(6);

    const stats: DashboardStats = {
        stock: {
            total: totalStock,
            available: availableStock,
            reserved: reservedStock,
            in_preparation: inPrepStock,
            sold: soldStock,
            own: ownStock,
            consigned: consignedStock,
            trade_in: tradeInStock
        },
        finance: {
            capital_invested: capitalInvested,
            potential_sale_value: potentialSaleValue,
            potential_profit: potentialProfit,
            margin_percentage: Math.round(marginPercentage * 100) / 100,
            month_sales_total: monthSalesTotal,
            month_units_sold: monthUnitsSold,
            month_units_entered: monthUnitsEntered
        },
        activity: {
            active_reservations: activeReservationsCount || 0,
            active_consignments: activeConsignmentsCount || 0
        },
        alerts: {
            no_photos: alertsNoPhotos,
            no_price: alertsNoPrice,
            not_published: alertsNotPublished,
            stagnant_stock: alertsStagnantStock
        }
    };

    return {
        stats,
        recentOperations: recentOps || [],
        recentClients: recentClients || [],
        stagnantVehicles: stagnantVehiclesList
    };
}
