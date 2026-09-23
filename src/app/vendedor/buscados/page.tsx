import { getSellerWantedVehicles, getSellerClients, getSellerStockDemand } from '@/lib/actions/seller';
import { SellerWantedView } from '@/components/seller/SellerWantedView';

export const dynamic = 'force-dynamic';

export default async function SellerWantedPage() {
    const [wanted, clients, demand] = await Promise.all([
        getSellerWantedVehicles({ status: 'ALL' }),
        getSellerClients(),
        getSellerStockDemand()
    ]);

    return (
        <SellerWantedView
            initialWanted={wanted}
            initialClients={clients}
            initialDemand={demand}
        />
    );
}
