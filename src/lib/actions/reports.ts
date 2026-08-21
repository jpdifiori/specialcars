'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export interface StockReportData {
    totalUnits: number;
    ownUnits: number;
    tradeInUnits: number;
    consignedUnits: number;
    capitalInvested: number;
    potentialValue: number;
    potentialProfit: number;
    avgDaysInStock: number;
    byCategory: { name: string; count: number; value: number }[];
}

export interface SalesReportData {
    totalSales: number;
    totalRevenue: number;
    avgTicket: number;
    salesByMonth: { month: string; salesCount: number; revenue: number }[];
}

export interface ProfitabilityReportData {
    totalRealizedProfit: number;
    avgProfitPerVehicle: number;
    avgROI: number;
    topProfitable: any[];
    leastProfitable: any[];
    profitByBrand: { brand: string; unitsSold: number; totalProfit: number; avgROI: number }[];
}

export interface AgingReportData {
    segments: {
        range: string;
        label: string;
        count: number;
        capital: number;
        vehicles: any[];
    }[];
    totalStagnantCapital: number;
}

export interface TradeInReportData {
    totalTradeInsReceived: number;
    totalValueReceived: number;
    currentlyInStock: number;
    currentlySold: number;
    profitRealizedOnTradeIns: number;
    avgROIEarned: number;
}

export interface ConsignmentReportData {
    activeCount: number;
    soldCount: number;
    expiredCount: number;
    totalListingValue: number;
    totalCommissionsEarned: number;
}

/**
 * Genera todos los reportes analíticos para el módulo de Reportes del Admin.
 */
export async function getFullReportsData() {
    const adminClient = createAdminClient();
    const now = new Date();

    // 1. Obtener todos los vehículos con gastos
    const { data: allVehicles } = await adminClient
        .from('vehicles')
        .select(`
            *,
            expenses:vehicle_expenses(amount),
            previous_client:clients(id, first_name, last_name)
        `)
        .eq('is_deleted', false);

    const vehList = allVehicles || [];

    // 2. Obtener todas las operaciones cerradas con pagos
    const { data: allOperations } = await adminClient
        .from('operations')
        .select(`
            *,
            client:clients(id, first_name, last_name),
            vehicles:operation_vehicles(role, vehicle:vehicles(*)),
            payments:operation_payments(*)
        `)
        .eq('is_deleted', false);

    const opList = allOperations || [];

    // 3. Consignaciones
    const { data: allConsignments } = await adminClient
        .from('consignments')
        .select('*')
        .eq('is_deleted', false);

    const consList = allConsignments || [];

    // -------------------------------------------------------------
    // REPORTE DE STOCK
    // -------------------------------------------------------------
    let ownUnits = 0;
    let tradeInUnits = 0;
    let consignedUnits = 0;
    let capitalInvested = 0;
    let potentialValue = 0;
    let totalStockDays = 0;
    let inStockCount = 0;

    const byCatMap: Record<string, { count: number; value: number }> = {};

    vehList.forEach((v: any) => {
        if (v.status !== 'SOLD') {
            inStockCount++;
            const expensesSum = (v.expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
            const pPrice = Number(v.purchase_price) || 0;
            const sPrice = Number(v.sale_price) || 0;

            if (v.origin_type === 'CONSIGNMENT') {
                consignedUnits++;
            } else if (v.origin_type === 'TRADE_IN') {
                tradeInUnits++;
                capitalInvested += (pPrice + expensesSum);
            } else {
                ownUnits++;
                capitalInvested += (pPrice + expensesSum);
            }

            potentialValue += sPrice;

            // Días
            const pDate = new Date(v.purchase_date || v.created_at);
            const days = Math.ceil((now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
            totalStockDays += days;

            // Por tipo de vehículo
            const bType = v.body_type || 'OTRO';
            if (!byCatMap[bType]) byCatMap[bType] = { count: 0, value: 0 };
            byCatMap[bType].count++;
            byCatMap[bType].value += sPrice;
        }
    });

    const stockReport: StockReportData = {
        totalUnits: inStockCount,
        ownUnits,
        tradeInUnits,
        consignedUnits,
        capitalInvested,
        potentialValue,
        potentialProfit: potentialValue - capitalInvested,
        avgDaysInStock: inStockCount > 0 ? Math.round(totalStockDays / inStockCount) : 0,
        byCategory: Object.entries(byCatMap).map(([name, data]) => ({ name, ...data }))
    };

    // -------------------------------------------------------------
    // REPORTE DE VENTAS
    // -------------------------------------------------------------
    const closedSales = opList.filter((o: any) => o.status === 'CLOSED' && (o.type === 'SALE' || o.type === 'SALE_WITH_TRADE_IN' || o.type === 'CONSIGNMENT'));
    let totalRevenue = 0;
    const monthsMap: Record<string, { salesCount: number; revenue: number }> = {};

    closedSales.forEach((o: any) => {
        const rev = Number(o.agreed_price) || 0;
        totalRevenue += rev;

        const date = new Date(o.operation_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthsMap[monthKey]) monthsMap[monthKey] = { salesCount: 0, revenue: 0 };
        monthsMap[monthKey].salesCount++;
        monthsMap[monthKey].revenue += rev;
    });

    const salesByMonth = Object.entries(monthsMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({ month, ...data }));

    const salesReport: SalesReportData = {
        totalSales: closedSales.length,
        totalRevenue,
        avgTicket: closedSales.length > 0 ? Math.round(totalRevenue / closedSales.length) : 0,
        salesByMonth
    };

    // -------------------------------------------------------------
    // REPORTE DE RENTABILIDAD
    // -------------------------------------------------------------
    const soldVehicles = vehList.filter((v: any) => v.status === 'SOLD' && v.origin_type !== 'CONSIGNMENT');
    let totalRealizedProfit = 0;
    let sumROI = 0;
    const profitabilityList: any[] = [];
    const brandProfitMap: Record<string, { count: number; profit: number; roiSum: number }> = {};

    soldVehicles.forEach((v: any) => {
        const expSum = (v.expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
        const pPrice = Number(v.purchase_price) || 0;
        const sPrice = Number(v.sale_price) || 0;
        const cost = pPrice + expSum;
        const profit = sPrice - cost;
        const roi = cost > 0 ? (profit / cost) * 100 : 0;

        totalRealizedProfit += profit;
        sumROI += roi;

        const item = {
            id: v.id,
            stock_code: v.stock_code,
            title: `${v.brand} ${v.model} (${v.year})`,
            brand: v.brand,
            cost,
            sale_price: sPrice,
            profit,
            roi: Math.round(roi * 10) / 10
        };
        profitabilityList.push(item);

        if (!brandProfitMap[v.brand]) brandProfitMap[v.brand] = { count: 0, profit: 0, roiSum: 0 };
        brandProfitMap[v.brand].count++;
        brandProfitMap[v.brand].profit += profit;
        brandProfitMap[v.brand].roiSum += roi;
    });

    profitabilityList.sort((a, b) => b.profit - a.profit);

    const profitabilityReport: ProfitabilityReportData = {
        totalRealizedProfit,
        avgProfitPerVehicle: soldVehicles.length > 0 ? Math.round(totalRealizedProfit / soldVehicles.length) : 0,
        avgROI: soldVehicles.length > 0 ? Math.round((sumROI / soldVehicles.length) * 10) / 10 : 0,
        topProfitable: profitabilityList.slice(0, 5),
        leastProfitable: [...profitabilityList].reverse().slice(0, 5),
        profitByBrand: Object.entries(brandProfitMap).map(([brand, data]) => ({
            brand,
            unitsSold: data.count,
            totalProfit: data.profit,
            avgROI: data.count > 0 ? Math.round((data.roiSum / data.count) * 10) / 10 : 0
        }))
    };

    // -------------------------------------------------------------
    // REPORTE DE ANTIGÜEDAD (AGING)
    // -------------------------------------------------------------
    const segmentsDef = [
        { range: '0-30', label: '0 a 30 días', min: 0, max: 30, count: 0, capital: 0, vehicles: [] as any[] },
        { range: '31-60', label: '31 a 60 días', min: 31, max: 60, count: 0, capital: 0, vehicles: [] as any[] },
        { range: '61-90', label: '61 a 90 días', min: 61, max: 90, count: 0, capital: 0, vehicles: [] as any[] },
        { range: '91-120', label: '91 a 120 días', min: 91, max: 120, count: 0, capital: 0, vehicles: [] as any[] },
        { range: '120+', label: 'Más de 120 días', min: 121, max: 99999, count: 0, capital: 0, vehicles: [] as any[] },
    ];

    let totalStagnantCapital = 0;

    vehList.forEach((v: any) => {
        if (v.status !== 'SOLD') {
            const pDate = new Date(v.purchase_date || v.created_at);
            const days = Math.ceil((now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
            const expSum = (v.expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
            const pPrice = Number(v.purchase_price) || 0;
            const cost = pPrice + expSum;

            for (const seg of segmentsDef) {
                if (days >= seg.min && days <= seg.max) {
                    seg.count++;
                    seg.capital += cost;
                    seg.vehicles.push({
                        id: v.id,
                        stock_code: v.stock_code,
                        title: `${v.brand} ${v.model} ${v.year}`,
                        plate: v.plate,
                        days,
                        cost,
                        sale_price: v.sale_price
                    });
                    if (seg.min >= 61) {
                        totalStagnantCapital += cost;
                    }
                    break;
                }
            }
        }
    });

    const agingReport: AgingReportData = {
        segments: segmentsDef,
        totalStagnantCapital
    };

    // -------------------------------------------------------------
    // REPORTE DE PERMUTAS
    // -------------------------------------------------------------
    const tradeInVehicles = vehList.filter((v: any) => v.origin_type === 'TRADE_IN');
    let totalTradeInVal = 0;
    let tradeInsInStock = 0;
    let tradeInsSold = 0;
    let profitTradeIns = 0;
    let sumTradeInROI = 0;

    tradeInVehicles.forEach((v: any) => {
        const val = Number(v.purchase_price) || 0;
        totalTradeInVal += val;
        if (v.status === 'SOLD') {
            tradeInsSold++;
            const exp = (v.expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
            const cost = val + exp;
            const sale = Number(v.sale_price) || 0;
            const prof = sale - cost;
            const roi = cost > 0 ? (prof / cost) * 100 : 0;
            profitTradeIns += prof;
            sumTradeInROI += roi;
        } else {
            tradeInsInStock++;
        }
    });

    const tradeInReport: TradeInReportData = {
        totalTradeInsReceived: tradeInVehicles.length,
        totalValueReceived: totalTradeInVal,
        currentlyInStock: tradeInsInStock,
        currentlySold: tradeInsSold,
        profitRealizedOnTradeIns: profitTradeIns,
        avgROIEarned: tradeInsSold > 0 ? Math.round((sumTradeInROI / tradeInsSold) * 10) / 10 : 0
    };

    // -------------------------------------------------------------
    // REPORTE DE CONSIGNACIONES
    // -------------------------------------------------------------
    let activeCons = 0;
    let soldCons = 0;
    let expiredCons = 0;
    let listingValCons = 0;
    let commEarned = 0;

    consList.forEach((c: any) => {
        if (c.status === 'ACTIVE') {
            activeCons++;
            listingValCons += Number(c.listing_price) || 0;
        } else if (c.status === 'SOLD') {
            soldCons++;
            commEarned += Number(c.commission_amount) || 0;
        } else if (c.status === 'EXPIRED') {
            expiredCons++;
        }
    });

    const consignmentReport: ConsignmentReportData = {
        activeCount: activeCons,
        soldCount: soldCons,
        expiredCount: expiredCons,
        totalListingValue: listingValCons,
        totalCommissionsEarned: commEarned
    };

    return {
        stock: stockReport,
        sales: salesReport,
        profitability: profitabilityReport,
        aging: agingReport,
        tradeIn: tradeInReport,
        consignment: consignmentReport
    };
}
