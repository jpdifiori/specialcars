import { notFound } from 'next/navigation';
import { getVehicleById } from '@/lib/actions/vehicles';
import { PrintClientView } from './PrintClientView';

interface PrintPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VehiclePrintPage({ params, searchParams }: PrintPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        notFound();
    }

    const priceParam = resolvedSearchParams.price;
    const showPrice = priceParam !== undefined ? priceParam === 'true' || priceParam === '1' : true;

    const qrParam = resolvedSearchParams.qr;
    const showQr = qrParam !== undefined ? qrParam === 'true' || qrParam === '1' : true;

    const featParam = resolvedSearchParams.feat;
    const showFeatures = featParam !== undefined ? featParam === 'true' || featParam === '1' : true;

    const autoParam = resolvedSearchParams.auto;
    const autoPrint = autoParam === 'true' || autoParam === '1';

    return (
        <PrintClientView
            vehicle={vehicle}
            initialPrice={showPrice}
            initialQr={showQr}
            initialFeatures={showFeatures}
            autoPrint={autoPrint}
        />
    );
}
