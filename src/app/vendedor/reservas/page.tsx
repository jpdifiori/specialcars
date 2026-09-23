import { getSellerReservations, getSellerStock } from '@/lib/actions/seller';
import { SellerReservationsView } from '@/components/seller/SellerReservationsView';

export const dynamic = 'force-dynamic';

export default async function SellerReservationsPage() {
    const [reservations, stock] = await Promise.all([
        getSellerReservations(),
        getSellerStock({ status: 'AVAILABLE' })
    ]);

    return (
        <SellerReservationsView
            initialReservations={reservations}
            availableVehicles={stock}
        />
    );
}
