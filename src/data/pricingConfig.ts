/**
 * CENTRAL PRICING CONFIGURATION (2025)
 * ------------------------------------
 * This file contains the base rates and multipliers used across the application.
 * Edit this file to update prices globally.
 * 
 * TODO: In the future, fetch these from the Backend API (/config/pricing).
 */

export const PRICING_CONFIG = {
    // Base Rates (SEK)
    LABOR_HOURLY_RATE: 750, // Charged rate
    MATERIAL_MARKUP: 1.15,  // 15% markup

    // Regional Multipliers
    REGIONAL_FACTORS: {
        STOCKHOLM: 1.10,
        GOTEBORG: 1.05,
        MALMO: 1.00,
        NORTH: 1.15, // Norrland
        DEFAULT: 1.00
    },

    // Unit Costs (Material + Labor + Markup)
    COSTS: {
        // Structure
        WALL_EXTERIOR_ENERGY_260: 3800, // /m2
        WALL_INTERIOR_STD_70: 1450,     // /m2
        WALL_WET_ROOM: 4200,            // /m2
        SLAB_ON_GRADE: 3500,            // /m2
        INTER_FLOOR: 2800,              // /m2
        
        // Finishes
        PARQUET_OAK: 850,               // /m2
        TILES_STANDARD: 1600,           // /m2
        PAINTING_WALLS: 350,            // /m2

        // Electrical
        EL_POINT_STD: 1400,             // /st (Socket/Switch)
        EL_SPOTLIGHT: 1600,             // /st
        EL_CABINET_MEDIA: 8000,         // /st
        EL_CABINET_METER: 12000,        // /st

        // Plumbing
        VVS_WC_HUNG: 14000,             // /st
        VVS_BASIN_MIXER: 6000,          // /st
        VVS_SHOWER_WALL: 8000,          // /st
        VVS_FLOOR_DRAIN: 6500,          // /st
        VVS_HEAT_PUMP_F730: 125000,     // /st

        // Admin/Soft Costs
        ADMIN_BAS_PU: 60000,            // /project
        ADMIN_LCA: 20000,               // /project
        ADMIN_PERMIT: 40000,            // /project (avg)
        ADMIN_KA: 35000,                // /project
    }
};
