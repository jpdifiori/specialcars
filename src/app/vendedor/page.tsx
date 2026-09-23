import { getSellerStock } from '@/lib/actions/seller';
import { SellerStockView } from '@/components/seller/SellerStockView';

export const dynamic = 'force-dynamic';

export default async function SellerHomePage() {
    const vehicles = await getSellerStock();

    return <SellerStockView initialVehicles={vehicles} />;
}
