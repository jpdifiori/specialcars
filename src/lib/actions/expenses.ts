'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { ExpenseCategory, VehicleExpense } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Agrega un gasto a un vehículo y actualiza la fecha de modificación del vehículo.
 */
export async function addVehicleExpense(payload: {
    vehicle_id: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    provider?: string;
    receipt_path?: string;
    expense_date?: string;
}) {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
        .from('vehicle_expenses')
        .insert({
            vehicle_id: payload.vehicle_id,
            category: payload.category,
            description: payload.description.trim(),
            amount: Math.round(Number(payload.amount)),
            provider: payload.provider?.trim() || null,
            receipt_path: payload.receipt_path || null,
            expense_date: payload.expense_date || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Actualizar updated_at del vehículo
    await adminClient
        .from('vehicles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', payload.vehicle_id);

    revalidatePath(`/admin/vehiculos/${payload.vehicle_id}`);
    revalidatePath('/admin/vehiculos');
    return { success: true, expense: data as VehicleExpense };
}

/**
 * Elimina un gasto de un vehículo.
 */
export async function deleteVehicleExpense(expenseId: string, vehicleId: string) {
    const adminClient = createAdminClient();

    const { error } = await adminClient
        .from('vehicle_expenses')
        .delete()
        .eq('id', expenseId);

    if (error) {
        return { success: false, error: error.message };
    }

    await adminClient
        .from('vehicles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', vehicleId);

    revalidatePath(`/admin/vehiculos/${vehicleId}`);
    revalidatePath('/admin/vehiculos');
    return { success: true };
}
