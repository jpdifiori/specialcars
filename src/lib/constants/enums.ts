export type VehicleStatus = 
    | 'DRAFT' 
    | 'INCOMING' 
    | 'IN_PREPARATION' 
    | 'AVAILABLE' 
    | 'RESERVED' 
    | 'SOLD' 
    | 'WITHDRAWN' 
    | 'UNAVAILABLE';

export type VehicleOrigin = 
    | 'DIRECT_PURCHASE' 
    | 'TRADE_IN' 
    | 'CONSIGNMENT' 
    | 'OWN_VEHICLE' 
    | 'OTHER';

export type VehicleBodyType = 
    | 'AUTO' 
    | 'SUV' 
    | 'PICKUP' 
    | 'UTILITY' 
    | 'TRUCK' 
    | 'MOTORCYCLE' 
    | 'OTHER';

export type FuelType = 
    | 'NAFTA' 
    | 'DIESEL' 
    | 'GNC' 
    | 'HYBRID' 
    | 'ELECTRIC' 
    | 'OTHER';

export type TransmissionType = 
    | 'MANUAL' 
    | 'AUTOMATIC' 
    | 'CVT' 
    | 'OTHER';

export type OperationType = 
    | 'PURCHASE' 
    | 'SALE' 
    | 'SALE_WITH_TRADE_IN' 
    | 'CONSIGNMENT' 
    | 'RESERVATION' 
    | 'ZERO_KM_SALE';

export type OperationStatus = 
    | 'DRAFT' 
    | 'IN_PROGRESS' 
    | 'CONFIRMED' 
    | 'CLOSED' 
    | 'CANCELLED';

export type OperationVehicleRole = 
    | 'SOLD' 
    | 'RECEIVED_TRADE_IN' 
    | 'PURCHASED' 
    | 'CONSIGNED';

export type ConsignmentStatus = 
    | 'ACTIVE' 
    | 'RESERVED' 
    | 'SOLD' 
    | 'CANCELLED' 
    | 'EXPIRED' 
    | 'WITHDRAWN';

export type ReservationStatus = 
    | 'ACTIVE' 
    | 'CONFIRMED' 
    | 'CANCELLED' 
    | 'EXPIRED';

export type ZeroKmStatus = 
    | 'ORDERED' 
    | 'CONFIRMED' 
    | 'INVOICED' 
    | 'IN_TRANSIT' 
    | 'DELIVERED';

export type PaymentType = 
    | 'CASH' 
    | 'TRANSFER' 
    | 'CHECK' 
    | 'FINANCING' 
    | 'CARD' 
    | 'TRADE_IN' 
    | 'OTHER';

export type ExpenseCategory = 
    | 'MECHANICAL' 
    | 'BODYWORK' 
    | 'PAINT' 
    | 'DETAILING' 
    | 'TIRES' 
    | 'TRANSFER' 
    | 'PAPERWORK' 
    | 'TAXES' 
    | 'TRANSPORT' 
    | 'FUEL' 
    | 'LISTING' 
    | 'OTHER';

export type WantedVehiclePriority = 
    | 'LOW' 
    | 'MEDIUM' 
    | 'HIGH';

export type WantedVehicleStatus = 
    | 'SEARCHING' 
    | 'CONTACTED' 
    | 'FOUND' 
    | 'CLOSED' 
    | 'CANCELLED';

export type WantedVehicleCancellationReason = 
    | 'BOUGHT_ELSEWHERE' 
    | 'DECIDED_NOT_TO_CHANGE' 
    | 'BUDGET_CHANGED' 
    | 'FOUND_WITH_US' 
    | 'OTHER';
