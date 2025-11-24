import { CostItem, ConstructionPhase, Unit } from '@/types';
import { PRICING_CONFIG } from './pricingConfig';

interface CatalogItem {
    id: string;
    label: string;
    unit: Unit;
    price: number;
    phase: ConstructionPhase;
    description?: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
    // WALLS (Structure)
    {
        id: 'wall-ext-260',
        label: 'Yttervägg (260mm Energy)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.WALL_EXTERIOR_ENERGY_260,
        phase: 'structure',
        description: 'Facade panel, air gap, wind board, 195+45mm studs, 260mm wool, plastic, OSB, Gypsum.'
    },
    {
        id: 'wall-int-70',
        label: 'Innervägg (Standard 70mm)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.WALL_INTERIOR_STD_70,
        phase: 'structure',
        description: '70mm studs (cc450), 45mm wool, OSB + Gypsum both sides.'
    },
    {
        id: 'wall-wet',
        label: 'Innervägg (Våtrum - Säker Vatten)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.WALL_WET_ROOM,
        phase: 'structure',
        description: '70mm studs (cc300), 15mm Ply, Humid Board, Foil System, Tiles, Grout.'
    },

    // FLOORS (Ground/Structure)
    {
        id: 'slab-grade',
        label: 'Platta på mark (Slab on Grade)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.SLAB_ON_GRADE,
        phase: 'ground',
        description: 'Excavation, gravel, 300mm EPS, Radon barrier, Rebar, Concrete, UFH pipes.'
    },
    {
        id: 'floor-inter',
        label: 'Mellanbjälklag (Inter-floor)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.INTER_FLOOR,
        phase: 'structure',
        description: '220mm joists, insulation, chipboard, secondary spacing, gypsum ceiling.'
    },

    // FINISHES (Interior)
    {
        id: 'finish-parquet',
        label: 'Parkettgolv (Ek 14mm)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.PARQUET_OAK,
        phase: 'interior',
        description: 'Oak parquet, 14mm.'
    },
    {
        id: 'finish-tiles',
        label: 'Klinker/Kakel (Standard)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.TILES_STANDARD,
        phase: 'interior',
        description: 'Tiles for Hall/Laundry/Bathroom.'
    },
    {
        id: 'finish-paint',
        label: 'Målning (Väggar)',
        unit: 'm2',
        price: PRICING_CONFIG.COSTS.PAINTING_WALLS,
        phase: 'interior',
        description: 'Spackling + 2 coats.'
    },

    // ELECTRICAL (Installations)
    {
        id: 'el-socket',
        label: 'Eluttag/Strömbrytare (Ny)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.EL_POINT_STD,
        phase: 'electrical',
        description: 'Box, flex pipe, wire, device, labor.'
    },
    {
        id: 'el-spotlight',
        label: 'Spotlight (LED)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.EL_SPOTLIGHT,
        phase: 'electrical',
        description: 'Pot, driver, light.'
    },
    {
        id: 'el-media',
        label: 'Mediasbksåp',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.EL_CABINET_MEDIA,
        phase: 'electrical',
        description: 'Media cabinet installation.'
    },
    {
        id: 'el-meter',
        label: 'Fasadmätarskåp',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.EL_CABINET_METER,
        phase: 'electrical',
        description: 'External meter cabinet.'
    },

    // PLUMBING (Installations)
    {
        id: 'vvs-wc',
        label: 'WC-stol (Vägg-hängd)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.VVS_WC_HUNG,
        phase: 'plumbing',
        description: 'Frame + Porcelain + Button + Install.'
    },
    {
        id: 'vvs-basin',
        label: 'Tvättställ + Blandare',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.VVS_BASIN_MIXER,
        phase: 'plumbing',
        description: 'Basin and mixer tap.'
    },
    {
        id: 'vvs-shower',
        label: 'Duschvägg (Glas)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.VVS_SHOWER_WALL,
        phase: 'plumbing',
        description: 'Glass shower wall.'
    },
    {
        id: 'vvs-drain',
        label: 'Golvbrunn (Montering)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.VVS_FLOOR_DRAIN,
        phase: 'plumbing',
        description: 'Floor drain installation.'
    },
    {
        id: 'vvs-heatpump',
        label: 'Frånluftsvärmepump (F730)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.VVS_HEAT_PUMP_F730,
        phase: 'plumbing',
        description: 'NIBE F730 or equivalent.'
    },

    // SOFT COSTS (Completion/Admin)
    {
        id: 'soft-bas',
        label: 'Projektledning & BAS-P/U',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.ADMIN_BAS_PU,
        phase: 'completion',
        description: 'Safety coordination and project management.'
    },
    {
        id: 'soft-lca',
        label: 'Klimatdeklaration (LCA)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.ADMIN_LCA,
        phase: 'completion',
        description: 'Life Cycle Assessment calculation (Mandatory).'
    },
    {
        id: 'soft-permit',
        label: 'Bygglovsavgifter (Estimerat)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.ADMIN_PERMIT,
        phase: 'completion',
        description: 'Municipal building permit fees.'
    },
    {
        id: 'soft-ka',
        label: 'Kontrollansvarig (KA)',
        unit: 'st',
        price: PRICING_CONFIG.COSTS.ADMIN_KA,
        phase: 'completion',
        description: 'Independent certified inspector.'
    }
];
