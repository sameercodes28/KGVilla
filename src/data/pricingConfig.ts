/**
 * CENTRAL PRICING CONFIGURATION (2025)
 * ------------------------------------
 * This file contains the base rates and multipliers used across the application.
 * Edit this file to update prices globally.
 *
 * Note: Future iteration could fetch these from the Backend API (/config/pricing).
 *
 * ============================================================================
 * PRICING SOURCES & REFERENCES (Last updated: November 2025)
 * ============================================================================
 *
 * LABOR_HOURLY_RATE (750 kr/hour):
 *   - This is the CHARGED rate (what client pays), not worker's wage
 *   - Worker wages: 170-253 kr/hour (Source: Byggnads, SCB 2025)
 *   - Charged rates for specialists: 500-600 kr/hour (electricians, plattsättare)
 *   - Our rate includes overhead, insurance, profit margin
 *   - Stockholm premium: +20-30% vs national average
 *
 * WALL_WET_ROOM (4,200 kr/m²):
 *   - Scope: Wall waterproofing + tiling only (not complete bathroom)
 *   - Includes: Våtrumsgips, tätskikt (2 coats), kakelfix, tiles, grout, labor
 *   - Source: Market estimate based on Bygghemma, HTH, contractor quotes 2025
 *   - Reference: Säker Vatten compliant installation required
 *   - Context: Complete bathroom reno = 18,000-46,000 kr/m² (HTH Sweden 2025)
 *
 * SLAB_ON_GRADE (3,500 kr/m²):
 *   - Scope: Platta på mark with insulation
 *   - Source: Wikells Sektionsfakta NYB, market average
 *   - Reference: BBR 6:1 (moisture), BBR 9:4 (energy) compliant
 *
 * WALL_EXTERIOR_ENERGY_260 (3,800 kr/m²):
 *   - Scope: 260mm energy-efficient timber frame wall
 *   - Source: Wikells Sektionsfakta, prefab supplier quotes
 *   - Reference: BBR 9 energy requirements (U≤0.18 W/m²K)
 *
 * WALL_INTERIOR_STD_70 (1,450 kr/m²):
 *   - Scope: Standard interior wall, 70mm steel stud, gypsum both sides
 *   - Source: Wikells Sektionsfakta, contractor quotes
 *
 * MARKET CONTEXT (2025):
 *   - Villa construction turnkey: 25,000-35,000 kr/m²
 *   - Realistic all-in cost: 40,000-50,000 kr/m²
 *   - Materials up 12-18% since 2023
 *   - Stockholm/Göteborg: +20-30% vs national
 *   - Rural areas: -15-25% vs national
 *
 * DISCLAIMER:
 * These are market estimates based on 2025 Swedish construction rates.
 * JB Villan should verify all prices against actual vendor quotes
 * and supplier agreements before presenting to clients.
 * ============================================================================
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
