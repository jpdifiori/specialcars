export * from '../constants/enums';

import {
    VehicleStatus,
    VehicleOrigin,
    VehicleBodyType,
    FuelType,
    TransmissionType,
    OperationType,
    OperationStatus,
    OperationVehicleRole,
    ConsignmentStatus,
    ReservationStatus,
    ZeroKmStatus,
    PaymentType,
    ExpenseCategory
} from '../constants/enums';

export interface Vehicle {
    id: string;
    stock_code: string;
    plate?: string | null;
    vin?: string | null;
    engine_number?: string | null;
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    mileage: number;
    fuel_type: FuelType;
    transmission: TransmissionType;
    body_type: VehicleBodyType;
    doors: number;
    exterior_color?: string | null;
    interior_color?: string | null;
    
    // Financial (ARS - BigInt as numbers in JS)
    purchase_price: number;
    sale_price: number;
    minimum_price: number;
    
    // Origin & Status
    origin_type: VehicleOrigin;
    status: VehicleStatus;
    previous_client_id?: string | null;
    origin_operation_id?: string | null;
    
    // Web Publishing
    published: boolean;
    featured: boolean;
    hide_price?: boolean;
    commercial_title?: string | null;
    description?: string | null;
    equipment?: string | null;
    features?: string | null;
    slug?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;

    // Offers & Specials
    is_offer?: boolean;
    offer_price?: number | null;
    offer_start_date?: string | null;
    offer_end_date?: string | null;
    offer_label?: string | null;
    
    // Dates & Audit
    purchase_date: string;
    sale_date?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined relations
    images?: VehicleImage[];
    expenses?: VehicleExpense[];
    previous_client?: Client | null;
    origin_operation?: Operation | null;
    total_expenses?: number;
    real_cost?: number;
    potential_profit?: number;
    profitability_pct?: number;
    days_in_stock?: number;
}

export interface VehicleImage {
    id: string;
    vehicle_id: string;
    storage_path: string;
    url: string;
    is_primary: boolean;
    sort_order: number;
    file_name?: string | null;
    file_size?: number | null;
    mime_type?: string | null;
    created_at: string;
}

export interface VehicleExpense {
    id: string;
    vehicle_id: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    provider?: string | null;
    receipt_path?: string | null;
    expense_date: string;
    created_at: string;
}

export interface Client {
    id: string;
    first_name: string;
    last_name: string;
    dni?: string | null;
    cuit_cuil?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    
    // Joined relations for 360 view
    operations_count?: number;
    vehicles_bought?: Vehicle[];
    vehicles_sold_to_us?: Vehicle[];
    trade_ins_given?: Vehicle[];
    consignments?: Consignment[];
    reservations?: Reservation[];
    timeline?: TimelineEvent[];
}

export interface Operation {
    id: string;
    operation_code: string;
    type: OperationType;
    status: OperationStatus;
    client_id: string;
    agreed_price: number;
    trade_in_value: number;
    balance: number;
    total_expenses: number;
    operation_date: string;
    closed_date?: string | null;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined
    client?: Client;
    vehicles?: {
        role: OperationVehicleRole;
        vehicle: Vehicle;
    }[];
    payments?: OperationPayment[];
}

export interface OperationPayment {
    id: string;
    operation_id: string;
    payment_type: PaymentType;
    amount: number;
    reference?: string | null;
    payment_date: string;
    notes?: string | null;
    created_at: string;
}

export interface Consignment {
    id: string;
    consignment_code: string;
    client_id: string;
    vehicle_id: string;
    requested_price: number;
    listing_price: number;
    minimum_price: number;
    commission_amount: number;
    owner_amount: number;
    final_sale_price: number;
    buyer_client_id?: string | null;
    start_date: string;
    expiry_date?: string | null;
    sold_date?: string | null;
    status: ConsignmentStatus;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined
    client?: Client;
    vehicle?: Vehicle;
    buyer_client?: Client | null;
}

export interface Reservation {
    id: string;
    reservation_code: string;
    client_id: string;
    vehicle_id: string;
    amount: number;
    reservation_date: string;
    expiry_date?: string | null;
    receipt_path?: string | null;
    status: ReservationStatus;
    show_reserved_badge: boolean;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined
    client?: Client;
    vehicle?: Vehicle;
}

export interface ZeroKmOperation {
    id: string;
    operation_code: string;
    client_id: string;
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    color?: string | null;
    provider?: string | null;
    cost: number;
    client_price: number;
    commission: number;
    estimated_date?: string | null;
    delivery_date?: string | null;
    status: ZeroKmStatus;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined
    client?: Client;
}

export interface WantedVehicle {
    id: string;
    code: string;
    client_id: string;
    
    // Criterios de Búsqueda
    brand: string;
    model: string;
    version?: string | null;
    year_min?: number | null;
    year_max?: number | null;
    max_mileage?: number | null;
    fuel_type?: FuelType | null;
    transmission?: TransmissionType | null;
    body_type?: VehicleBodyType | null;
    preferred_color?: string | null;
    max_budget: number;
    
    // Flags de Flexibilidad
    accepts_similar_model: boolean;
    accepts_different_version: boolean;
    accepts_nearby_year: boolean;
    
    // Permuta
    has_trade_in: boolean;
    trade_in_details?: string | null;
    
    // Origen del Pedido
    source?: 'ADMIN' | 'WEB';

    // Estado y Comercial
    priority: import('../constants/enums').WantedVehiclePriority;
    status: import('../constants/enums').WantedVehicleStatus;
    cancellation_reason?: import('../constants/enums').WantedVehicleCancellationReason | null;
    last_contact_date?: string | null;
    notes?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    // Joined
    client?: Client;
    match_count?: number;
    matching_vehicles?: MatchResult[];
}

export interface MatchResult {
    score: number; // 0 to 100
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    breakdown: {
        brandScore: number;
        modelScore: number;
        yearScore: number;
        priceScore: number;
        transmissionScore: number;
        mileageScore: number;
    };
    highlights: string[];
    vehicle?: Vehicle;
    wantedVehicle?: WantedVehicle;
}

export interface StockDemandItem {
    vehicle: Vehicle;
    interestedCount: number;
    highMatchCount: number;
    topMatches: MatchResult[];
}

export interface AgencySettings {
    id: string;
    name: string;
    logo_url?: string | null;
    hero_image_url?: string | null;
    description: string;
    address: string;
    city: string;
    province: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    google_maps_url?: string | null;
    business_hours: string;
    legal_info?: string | null;
    updated_at: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    type: 'purchase' | 'sale' | 'trade_in' | 'consignment' | 'reservation' | 'expense' | 'note';
    link?: string;
    badge?: string;
}

export interface PublicVehicleItem {
    id: string;
    stock_code: string;
    slug: string;
    commercial_title?: string | null;
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    mileage: number;
    fuel_type: FuelType;
    transmission: TransmissionType;
    body_type: VehicleBodyType;
    doors: number;
    exterior_color?: string | null;
    price: number;
    description?: string | null;
    equipment?: string | null;
    features?: string | null;
    featured: boolean;
    hide_price?: boolean;
    status: VehicleStatus;
    meta_title?: string | null;
    meta_description?: string | null;
    created_at: string;
    primary_image_url?: string | null;

    // Offers & Specials
    is_offer?: boolean;
    offer_price?: number | null;
    offer_start_date?: string | null;
    offer_end_date?: string | null;
    offer_label?: string | null;
    is_offer_active?: boolean;
    savings?: number;
    discount_percentage?: number;

    images?: {
        id: string;
        url: string;
        sort_order: number;
        is_primary: boolean;
    }[];
}

export interface DashboardStats {
    stock: {
        total: number;
        available: number;
        reserved: number;
        in_preparation: number;
        sold: number;
        own: number;
        consigned: number;
        trade_in: number;
    };
    finance: {
        capital_invested: number;
        potential_sale_value: number;
        potential_profit: number;
        margin_percentage: number;
        month_sales_total: number;
        month_units_sold: number;
        month_units_entered: number;
    };
    activity: {
        active_reservations: number;
        active_consignments: number;
    };
    alerts: {
        no_photos: number;
        no_price: number;
        not_published: number;
        stagnant_stock: number;
    };
}
