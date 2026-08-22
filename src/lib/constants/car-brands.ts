/**
 * Catálogo de Marcas y Modelos más comercializados en Argentina para LOVs y selects asistidos.
 */

export const POPULAR_CAR_BRANDS = [
    'Volkswagen',
    'Toyota',
    'Ford',
    'Chevrolet',
    'Fiat',
    'Peugeot',
    'Renault',
    'Jeep',
    'Audi',
    'BMW',
    'Mercedes-Benz',
    'Nissan',
    'Honda',
    'Citroën',
    'RAM',
    'Hyundai',
    'Kia',
    'Mini',
    'Volvo',
    'Mitsubishi',
    'Subaru',
    'Chery',
    'Otro'
] as const;

export const CAR_MODELS_BY_BRAND: Record<string, string[]> = {
    'Volkswagen': [
        'Amarok',
        'Taos',
        'Gol Trend',
        'Golf',
        'Polo',
        'Vento',
        'T-Cross',
        'Nivus',
        'Tiguan',
        'Virtus',
        'Saveiro',
        'Suran',
        'Bora',
        'Fox',
        'Scirocco',
        'Up!',
        'Passat'
    ],
    'Toyota': [
        'Hilux',
        'Corolla',
        'Corolla Cross',
        'Yaris',
        'SW4',
        'Etios',
        'RAV4',
        'Land Cruiser',
        'Prius',
        'Hiace',
        'Camry'
    ],
    'Ford': [
        'Ranger',
        'Territory',
        'Bronco Sport',
        'Focus',
        'EcoSport',
        'Fiesta',
        'Ka',
        'Maverick',
        'Kuga',
        'Mondeo',
        'F-150',
        'Transit',
        'Mustang'
    ],
    'Chevrolet': [
        'Tracker',
        'Cruze',
        'S10',
        'Onix',
        'Prisma',
        'Spin',
        'Equinox',
        'Trailblazer',
        'Joy',
        'Montana',
        'Camaro'
    ],
    'Fiat': [
        'Cronos',
        'Toro',
        'Pulse',
        'Fastback',
        'Strada',
        'Argo',
        'Mobi',
        'Fiorino',
        'Uno',
        'Palio',
        '500',
        'Ducato',
        'Siena'
    ],
    'Peugeot': [
        '208',
        '2008',
        '3008',
        '308',
        '408',
        'Partner',
        '5008',
        '207 Compact',
        'Expert',
        'Boxer'
    ],
    'Renault': [
        'Sandero',
        'Stepway',
        'Duster',
        'Kangoo',
        'Logan',
        'Oroch',
        'Alaskan',
        'Captur',
        'Kwid',
        'Master',
        'Fluence',
        'Clio',
        'Kardian'
    ],
    'Jeep': [
        'Renegade',
        'Compass',
        'Commander',
        'Grand Cherokee',
        'Wrangler',
        'Gladiator',
        'Cherokee'
    ],
    'Audi': [
        'A1',
        'A3',
        'A4',
        'A5',
        'A6',
        'Q2',
        'Q3',
        'Q5',
        'Q7',
        'Q8',
        'TT',
        'e-tron'
    ],
    'BMW': [
        'Serie 1',
        'Serie 2',
        'Serie 3',
        'Serie 4',
        'Serie 5',
        'X1',
        'X2',
        'X3',
        'X4',
        'X5',
        'X6',
        'M2',
        'M3',
        'Z4'
    ],
    'Mercedes-Benz': [
        'Clase A',
        'Clase C',
        'Clase E',
        'GLA',
        'GLB',
        'GLC',
        'GLE',
        'GLS',
        'Sprinter',
        'Vito',
        'Clase G'
    ],
    'Nissan': [
        'Frontier',
        'Kicks',
        'Versa',
        'Sentra',
        'X-Trail',
        'March',
        'Note',
        'Murano'
    ],
    'Honda': [
        'HR-V',
        'CR-V',
        'Civic',
        'Fit',
        'City',
        'ZR-V',
        'WR-V',
        'Accord'
    ],
    'Citroën': [
        'C3',
        'C4 Cactus',
        'C3 Aircross',
        'Berlingo',
        'C4 Lounge',
        'C4 Spacetourer',
        'Jumpy'
    ],
    'RAM': [
        '1500',
        'Rampage',
        '2500'
    ],
    'Hyundai': [
        'Tucson',
        'Creta',
        'Santa Fe',
        'HB20',
        'Veloster',
        'i10',
        'H1',
        'Kona'
    ],
    'Kia': [
        'Sportage',
        'Seltos',
        'Cerato',
        'Carnival',
        'Sorento',
        'Rio',
        'Picanto',
        'Niro'
    ]
};

// Años desde 2026 hacia atrás
const currentYear = new Date().getFullYear() + 1;
export const CAR_YEAR_OPTIONS: number[] = Array.from(
    { length: currentYear - 2005 + 1 },
    (_, i) => currentYear - i
);

export const TRANSMISSION_LOV = [
    { value: '', label: 'Indistinto / Cualquiera' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'AUTOMATIC', label: 'Automática' }
] as const;

export const BODY_TYPE_LOV = [
    { value: '', label: 'Indistinto / Cualquiera' },
    { value: 'SUV', label: 'SUV / Camioneta Urbana' },
    { value: 'PICKUP', label: 'Pickup / Camioneta' },
    { value: 'SEDAN', label: 'Sedán' },
    { value: 'HATCHBACK', label: 'Hatchback / 5 Puertas' },
    { value: 'UTILITY', label: 'Utilitario / Furgón' },
    { value: 'COUPE', label: 'Cupé / Deportivo' }
] as const;

export const FUEL_TYPE_LOV = [
    { value: '', label: 'Indistinto / Cualquiera' },
    { value: 'NAFTA', label: 'Nafta' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'GNC', label: 'GNC / Nafta' },
    { value: 'HYBRID', label: 'Híbrido' },
    { value: 'ELECTRIC', label: 'Eléctrico' }
] as const;
