/**
 * REGULATION MAPPING SYSTEM
 * -------------------------
 * Maps construction elements to applicable Swedish building regulations.
 * Used to display relevant compliance requirements on cost items.
 */

export interface RegulationRef {
    id: string;
    name: string;
    section?: string;           // Specific section reference
    requirement?: string;       // Brief requirement description
    regulationDetail?: string;  // Detailed explanation of what the regulation requires
    specificationDetail?: string; // How it should be built according to this standard
}

// Complete regulation definitions with colors for display
// Total: 22 Swedish building regulations tracked
export const REGULATION_COLORS: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    // Primary Building Regulations
    'bbr-2025': { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'pbl': { color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
    'eks': { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },

    // Water & Wet Room Standards
    'saker-vatten': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'bbv': { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
    'gvk': { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },

    // Electrical Standards
    'ss-436': { color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    'elsak-fs': { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },

    // Construction Standards
    'ama-hus': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    'abt-06': { color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    'ab-04': { color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200' },
    'ce-cpr': { color: 'text-blue-800', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },

    // Environmental & Energy
    'energidek': { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    'klimatdek': { color: 'text-lime-700', bgColor: 'bg-lime-50', borderColor: 'border-lime-200' },
    'ss-21054': { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    'radon': { color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },

    // Acoustic & Comfort
    'ss-25267': { color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    'ovk': { color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },

    // Accessibility
    'hin': { color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
    'alm': { color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },

    // Consumer & Safety
    'konsument': { color: 'text-stone-700', bgColor: 'bg-stone-100', borderColor: 'border-stone-300' },
    'afs': { color: 'text-red-800', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
};

/**
 * Maps specific catalog item IDs to their applicable regulations
 */
export const ITEM_REGULATIONS: Record<string, RegulationRef[]> = {
    // EXTERIOR WALLS
    'wall-ext-260': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9:4', requirement: 'U-value ≤ 0.18 W/m²K' },
        { id: 'eks', name: 'EKS/Eurocode', section: 'EKS 11', requirement: 'Wind & snow load calculations' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'LCS', requirement: 'Insulation installation standards' },
        { id: 'ce-cpr', name: 'CE/CPR', requirement: 'CE-marked structural products required' },
        { id: 'energidek', name: 'Energidek.', requirement: 'Affects building energy rating' },
    ],

    // INTERIOR WALLS
    'wall-int-70': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5:1', requirement: 'Fire compartmentalization' },
        { id: 'ss-25267', name: 'SS 25267', section: 'Class C', requirement: 'Sound insulation R\'w ≥ 53 dB' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'HUS', requirement: 'Gypsum board installation' },
    ],

    // WET ROOM WALLS
    'wall-wet': [
        { id: 'saker-vatten', name: 'Säker Vatten', section: '2021:1', requirement: 'Certified waterproofing system' },
        { id: 'gvk', name: 'GVK', requirement: 'Wetroom flooring certification' },
        { id: 'bbv', name: 'BBV', requirement: 'Tile adhesion & grouting standards' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:5', requirement: 'Moisture protection' },
        { id: 'hin', name: 'HIN', requirement: 'Accessible bathroom dimensions' },
    ],

    // SLAB ON GRADE
    'slab-grade': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:1', requirement: 'Moisture protection from ground' },
        { id: 'radon', name: 'Radon', section: 'BBR 6:23', requirement: 'Radon barrier < 200 Bq/m³' },
        { id: 'eks', name: 'EKS/Eurocode', section: 'EKS 7', requirement: 'Foundation load calculations' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'JSB/NSC', requirement: 'Concrete work specifications' },
        { id: 'ce-cpr', name: 'CE/CPR', requirement: 'CE-marked concrete & rebar' },
        { id: 'energidek', name: 'Energidek.', requirement: 'Ground floor U-value for rating' },
    ],

    // INTER-FLOOR
    'floor-inter': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5:2', requirement: 'Fire resistance REI 60' },
        { id: 'ss-25267', name: 'SS 25267', section: 'Class C', requirement: 'Impact sound L\'n,w ≤ 56 dB' },
        { id: 'eks', name: 'EKS/Eurocode', section: 'EKS 5', requirement: 'Live load calculations' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'HUS', requirement: 'Joist installation standards' },
    ],

    // PARQUET FLOORING
    'finish-parquet': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 8:4', requirement: 'Fire class D-s2,d0 minimum' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'MBE', requirement: 'Wood flooring installation' },
        { id: 'ce-cpr', name: 'CE/CPR', requirement: 'CE-marked flooring product' },
        { id: 'ss-25267', name: 'SS 25267', requirement: 'Affects impact sound performance' },
    ],

    // TILES
    'finish-tiles': [
        { id: 'bbv', name: 'BBV', requirement: 'Tile installation in wet areas' },
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'If in bathroom/wet room' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'MBE', requirement: 'Tile work quality standards' },
        { id: 'hin', name: 'HIN', requirement: 'Slip resistance for accessibility' },
    ],

    // PAINTING
    'finish-paint': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:7', requirement: 'VOC emission limits' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'MBE', requirement: 'Surface finish quality' },
    ],

    // ELECTRICAL - SOCKET
    'el-socket': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Socket placement & capacity' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', section: '2022:3', requirement: 'Certified electrician required' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5:6', requirement: 'Electrical safety zones' },
    ],

    // ELECTRICAL - SPOTLIGHT
    'el-spotlight': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Lighting circuit requirements' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', section: '2022:3', requirement: 'Installation certification' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:3', requirement: 'Fire safety for recessed lights' },
    ],

    // ELECTRICAL - MEDIA CABINET
    'el-media': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Low voltage installation' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', requirement: 'Electrical safety compliance' },
    ],

    // ELECTRICAL - METER CABINET
    'el-meter': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Main distribution requirements' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', section: '2022:3', requirement: 'Meter installation standards' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5:6', requirement: 'External cabinet placement' },
    ],

    // PLUMBING - WC
    'vvs-wc': [
        { id: 'saker-vatten', name: 'Säker Vatten', section: '2021:1', requirement: 'Certified plumber required' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:6', requirement: 'Water efficiency requirements' },
        { id: 'hin', name: 'HIN', requirement: 'Accessible WC height & placement' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'PJB', requirement: 'Sanitary installation standards' },
    ],

    // PLUMBING - BASIN
    'vvs-basin': [
        { id: 'saker-vatten', name: 'Säker Vatten', section: '2021:1', requirement: 'Water connection standards' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:6', requirement: 'Hot water temperature limits' },
        { id: 'hin', name: 'HIN', requirement: 'Basin height for wheelchair access' },
    ],

    // PLUMBING - SHOWER
    'vvs-shower': [
        { id: 'saker-vatten', name: 'Säker Vatten', section: '2021:1', requirement: 'Splash zone protection' },
        { id: 'bbv', name: 'BBV', requirement: 'Glass wall installation' },
        { id: 'hin', name: 'HIN', requirement: 'Level-entry shower for accessibility' },
    ],

    // PLUMBING - FLOOR DRAIN
    'vvs-drain': [
        { id: 'saker-vatten', name: 'Säker Vatten', section: '2021:1', requirement: '1:50 fall gradient to drain' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:5', requirement: 'Water trap depth requirements' },
        { id: 'ama-hus', name: 'AMA Hus', section: 'PJB', requirement: 'Floor drain installation' },
    ],

    // PLUMBING - HEAT PUMP
    'vvs-heatpump': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9', requirement: 'Energy performance requirements' },
        { id: 'ovk', name: 'OVK', requirement: 'Ventilation system integration' },
        { id: 'energidek', name: 'Energidek.', requirement: 'Primary energy calculation' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', requirement: 'Electrical connection certification' },
        { id: 'ce-cpr', name: 'CE/CPR', requirement: 'CE-marked heat pump unit' },
    ],

    // SOFT COSTS - PROJECT MANAGEMENT
    'soft-bas': [
        { id: 'pbl', name: 'PBL', section: 'Ch. 10', requirement: 'BAS-P/U coordination required' },
        { id: 'abt-06', name: 'ABT 06', section: 'Ch. 4', requirement: 'Contractor responsibilities' },
        { id: 'ab-04', name: 'AB 04', section: 'Ch. 3', requirement: 'General contract terms' },
        { id: 'afs', name: 'AFS', section: '2023:3', requirement: 'Work environment plan' },
    ],

    // SOFT COSTS - LCA
    'soft-lca': [
        { id: 'klimatdek', name: 'Klimatdek.', section: 'BFS 2021:7', requirement: 'Mandatory since Jan 2022' },
        { id: 'pbl', name: 'PBL', section: '2022:1', requirement: 'Climate declaration required' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9:9', requirement: 'CO2 reporting requirements' },
    ],

    // SOFT COSTS - PERMIT
    'soft-permit': [
        { id: 'pbl', name: 'PBL', section: 'Ch. 9', requirement: 'Building permit (bygglov)' },
        { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Compliance documentation' },
    ],

    // SOFT COSTS - KA
    'soft-ka': [
        { id: 'pbl', name: 'PBL', section: 'Ch. 10', requirement: 'Certified inspector required' },
        { id: 'abt-06', name: 'ABT 06', section: 'Ch. 6', requirement: 'Inspection protocol' },
        { id: 'konsument', name: 'Kons.tjänst', section: 'SFS 1985:716', requirement: '10 year liability period' },
    ],
};

/**
 * Maps element keywords to regulations for dynamically generated items
 * NOTE: Both Swedish AND English keywords are needed because element names
 * may be in either language depending on the source (OCR vs backend defaults)
 */
export const KEYWORD_REGULATIONS: Record<string, RegulationRef[]> = {
    // ============================================================
    // ROOF / TAK - Both English and Swedish keywords
    // ============================================================
    'roof': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Roof U-value ≤ 0.13 W/m²K',
            regulationDetail: 'Roof assemblies must achieve thermal transmittance ≤ 0.13 W/m²K to meet Swedish energy efficiency requirements for climate zone III (most of Sweden).',
            specificationDetail: 'Minimum 400mm mineral wool insulation between and over rafters. Vapor barrier (PE 0.2mm) on warm side. Breathable roofing membrane under tiles/metal.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 11',
            requirement: 'Snow load 2.0-3.5 kN/m²',
            regulationDetail: 'Roof structure must be designed for characteristic snow load based on location. Sweden ranges from 2.0 kN/m² (south) to 3.5+ kN/m² (north/mountains).',
            specificationDetail: 'Truss spacing typically 600-1200mm. C24 structural timber minimum. Metal gang-nail connector plates at joints. Engineer-certified design required.'
        },
    ],

    // ============================================================
    // FOUNDATION / GRUND - Both English and Swedish keywords
    // ============================================================
    'foundation': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Moisture protection from ground',
            regulationDetail: 'Foundation must prevent moisture from ground reaching the building. Capillary break and drainage required. Insulation must maintain R-value when wet.',
            specificationDetail: 'Min 300mm EPS/XPS under slab (λ ≤ 0.036). Capillary break layer (min 150mm gravel). PE vapor barrier (0.2mm) with sealed joints.'
        },
        {
            id: 'radon',
            name: 'Radon',
            section: 'BBR 6:23',
            requirement: 'Indoor radon < 200 Bq/m³',
            regulationDetail: 'Indoor radon concentration must not exceed 200 Bq/m³. In radon-risk areas, a radon barrier and possibly sub-slab ventilation is required.',
            specificationDetail: 'Radon membrane (min 0.2mm polyethylene) with all penetrations sealed. In high-risk areas: sub-slab ventilation pipes with fan-ready connection.'
        },
    ],
    'slab': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Slab U-value ≤ 0.15 W/m²K',
            regulationDetail: 'Ground floor slab must achieve U-value ≤ 0.15 W/m²K. Edge insulation required to prevent thermal bridges at foundation perimeter.',
            specificationDetail: 'Slab: 100mm C25/30 concrete with B500B reinforcement mesh. Under-slab: min 300mm EPS. Edge: 100mm vertical + horizontal insulation.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 7',
            requirement: 'Foundation load-bearing capacity',
            regulationDetail: 'Foundation must be designed for soil conditions and building loads. Geotechnical investigation required for load-bearing capacity verification.',
            specificationDetail: 'Bearing capacity verified by engineer. Typical: compacted gravel base (min 200mm), reinforced concrete slab (100mm), ground beam if needed.'
        },
    ],

    // ============================================================
    // WALLS - Both English and Swedish keywords
    // ============================================================
    'exterior wall': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Wall U-value ≤ 0.18 W/m²K',
            regulationDetail: 'Exterior walls must achieve thermal transmittance ≤ 0.18 W/m²K. Thermal bridge-free design required at corners, window reveals, and wall-floor junctions.',
            specificationDetail: 'Timber frame 45×220mm with 45×45mm service cavity. Mineral wool insulation in all cavities. Wind barrier (diffusion-open) on cold side. Vapor barrier on warm side.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 5',
            requirement: 'Wind load & structural stability',
            regulationDetail: 'Wall structure must resist wind loads and transfer loads to foundation. Bracing requirements depend on building height and wind zone.',
            specificationDetail: 'OSB/plywood sheathing for racking resistance. Metal strapping from wall plates to foundation. Wind posts at openings >1.8m.'
        },
    ],
    'interior wall': [
        {
            id: 'ss-25267',
            name: 'SS 25267',
            section: 'Class C',
            requirement: 'Sound insulation R\'w ≥ 52 dB',
            regulationDetail: 'Walls between dwellings or between rooms and common areas must achieve airborne sound insulation R\'w ≥ 52 dB (Class C minimum for new residential).',
            specificationDetail: 'Double stud wall with 95mm mineral wool. 2×13mm gypsum each side. Acoustic sealant at perimeter. No rigid connections between leaf frames.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:5',
            requirement: 'Fire compartmentalization',
            regulationDetail: 'Interior walls may need fire rating depending on use. Walls to technical spaces or between units require EI 30/60. Fire stops required at service penetrations.',
            specificationDetail: 'EI 30: 2×13mm fire-rated gypsum + 70mm mineral wool. All penetrations sealed with fire collars or intumescent sealant.'
        },
    ],
    'wall': [
        { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
        { id: 'ama-hus', name: 'AMA Hus', requirement: 'Construction standards' },
    ],

    // ============================================================
    // PAINTING / FACADE - English and Swedish keywords
    // ============================================================
    'painting': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:7',
            requirement: 'VOC emission limits for indoor air quality',
            regulationDetail: 'Interior and exterior paints must comply with VOC emission limits to ensure healthy indoor air quality. Products should be labeled with emissions class (M1, EC1, or similar).',
            specificationDetail: 'Use low-VOC or zero-VOC paints. Interior walls: 2 coats acrylic latex over primer. Exterior wood: 2-3 coats alkyd or acrylic with UV protection. Follow manufacturer drying times between coats.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.3',
            requirement: 'Surface preparation and paint quality standards',
            regulationDetail: 'AMA Hus specifies surface preparation requirements, primer selection, and minimum dry film thickness for different substrates. Quality class specified in contract documents.',
            specificationDetail: 'Exterior wood: prime all end grain, fill nail holes with exterior filler, sand between coats. Minimum DFT 100μm total. Interior: seal knots, fill imperfections, sand to P120 minimum.'
        },
    ],
    'paint': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:7',
            requirement: 'VOC emission limits for indoor air quality',
            regulationDetail: 'Interior and exterior paints must comply with VOC emission limits to ensure healthy indoor air quality. Products should be labeled with emissions class (M1, EC1, or similar).',
            specificationDetail: 'Use low-VOC or zero-VOC paints. Interior walls: 2 coats acrylic latex over primer. Exterior wood: 2-3 coats alkyd or acrylic with UV protection. Follow manufacturer drying times between coats.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.3',
            requirement: 'Surface preparation and paint quality standards',
            regulationDetail: 'AMA Hus specifies surface preparation requirements, primer selection, and minimum dry film thickness for different substrates. Quality class specified in contract documents.',
            specificationDetail: 'Exterior wood: prime all end grain, fill nail holes with exterior filler, sand between coats. Minimum DFT 100μm total. Interior: seal knots, fill imperfections, sand to P120 minimum.'
        },
    ],
    'facade': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:6',
            requirement: 'Facade fire spread protection',
            regulationDetail: 'Facade materials and systems must prevent fire spread along building exterior. Fire barriers required at floor levels for buildings over 2 stories. Surface material fire class D-s2,d0 minimum.',
            specificationDetail: 'Wood cladding permitted with fire stops at floor levels. Ventilation cavity fire barriers every 2 floors. Avoid combustible insulation in ventilated cavities. Document material fire classifications.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'HUS.5',
            requirement: 'Facade cladding installation standards',
            regulationDetail: 'Facade systems must be installed according to AMA Hus for weather protection, ventilation, and durability. Ventilated rainscreen with 20-25mm gap is standard practice.',
            specificationDetail: 'Horizontal wood cladding: overlap 25mm min, pre-treated all sides. Vertical board-on-batten: 22mm boards on 45×45mm battens. Ventilation openings top and bottom (min 25mm). Stainless steel or hot-dip galvanized fasteners.'
        },
    ],
    'målning': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:7',
            requirement: 'VOC emission limits for indoor air quality',
            regulationDetail: 'Interior and exterior paints must comply with VOC emission limits to ensure healthy indoor air quality. Products should be labeled with emissions class (M1, EC1, or similar).',
            specificationDetail: 'Use low-VOC or zero-VOC paints. Interior walls: 2 coats acrylic latex over primer. Exterior wood: 2-3 coats alkyd or acrylic with UV protection. Follow manufacturer drying times between coats.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.3',
            requirement: 'Surface preparation and paint quality standards',
            regulationDetail: 'AMA Hus specifies surface preparation requirements, primer selection, and minimum dry film thickness for different substrates. Quality class specified in contract documents.',
            specificationDetail: 'Exterior wood: prime all end grain, fill nail holes with exterior filler, sand between coats. Minimum DFT 100μm total. Interior: seal knots, fill imperfections, sand to P120 minimum.'
        },
    ],
    'fasad': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:6',
            requirement: 'Facade fire spread protection',
            regulationDetail: 'Facade materials and systems must prevent fire spread along building exterior. Fire barriers required at floor levels for buildings over 2 stories. Surface material fire class D-s2,d0 minimum.',
            specificationDetail: 'Wood cladding permitted with fire stops at floor levels. Ventilation cavity fire barriers every 2 floors. Avoid combustible insulation in ventilated cavities. Document material fire classifications.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'HUS.5',
            requirement: 'Facade cladding installation standards',
            regulationDetail: 'Facade systems must be installed according to AMA Hus for weather protection, ventilation, and durability. Ventilated rainscreen with 20-25mm gap is standard practice.',
            specificationDetail: 'Horizontal wood cladding: overlap 25mm min, pre-treated all sides. Vertical board-on-batten: 22mm boards on 45×45mm battens. Ventilation openings top and bottom (min 25mm). Stainless steel or hot-dip galvanized fasteners.'
        },
    ],

    // ============================================================
    // GUTTERS & ROOFLINE - English and Swedish keywords
    // ============================================================
    'gutter': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Rainwater drainage away from building',
            regulationDetail: 'Rainwater must be collected and directed away from building foundation to prevent moisture damage. Gutters sized for roof area and local rainfall intensity. Downspouts to ground drainage or splash blocks.',
            specificationDetail: 'Half-round or box gutters sized for roof area (125mm typical for houses). Slope 3-5mm per meter toward downspouts. Downspouts every 10m max. Connect to storm drain or direct 2m+ from foundation.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'JT',
            requirement: 'Roof drainage installation standards',
            regulationDetail: 'Gutter and downspout installation must follow AMA Hus for material selection, bracket spacing, joint sealing, and connection to drainage system.',
            specificationDetail: 'Gutter brackets: 600mm spacing max. Expansion joints in runs over 10m. Downspout brackets: 2m spacing. Leaf guards at valleys and near trees. Galvanized steel, painted steel, or copper materials.'
        },
    ],
    'gutters': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Rainwater drainage away from building',
            regulationDetail: 'Rainwater must be collected and directed away from building foundation to prevent moisture damage. Gutters sized for roof area and local rainfall intensity. Downspouts to ground drainage or splash blocks.',
            specificationDetail: 'Half-round or box gutters sized for roof area (125mm typical for houses). Slope 3-5mm per meter toward downspouts. Downspouts every 10m max. Connect to storm drain or direct 2m+ from foundation.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'JT',
            requirement: 'Roof drainage installation standards',
            regulationDetail: 'Gutter and downspout installation must follow AMA Hus for material selection, bracket spacing, joint sealing, and connection to drainage system.',
            specificationDetail: 'Gutter brackets: 600mm spacing max. Expansion joints in runs over 10m. Downspout brackets: 2m spacing. Leaf guards at valleys and near trees. Galvanized steel, painted steel, or copper materials.'
        },
    ],
    'downspout': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Rainwater management at ground level',
            regulationDetail: 'Downspouts must discharge rainwater away from foundation. Direct connection to storm drainage preferred. If surface discharge, use splash blocks directing water 2m+ from building.',
            specificationDetail: 'Downspout diameter 75-100mm typical. Connect to below-grade drainage or splash block. Avoid discharging near basement windows or entries. Flexible bottom section if prone to frost heave.'
        },
    ],
    'soffit': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:2',
            requirement: 'Roof space ventilation requirements',
            regulationDetail: 'Soffits must provide adequate ventilation to cold roof spaces to prevent condensation. Ventilation area typically 1/500 of roof area minimum, split between soffit and ridge.',
            specificationDetail: 'Perforated or vented soffit panels. Min 10mm continuous slot or equivalent. Mesh to prevent insect entry (4mm max opening). Maintain clear air path from soffit to ridge vent.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'HUS.52',
            requirement: 'Soffit and fascia installation standards',
            regulationDetail: 'Soffit and fascia boards protect rafter tails and provide neat finish at eaves. Must be securely fixed and allow for thermal movement. Joints sealed against weather.',
            specificationDetail: 'Soffit boards: 9-12mm exterior grade. Fascia: 22mm timber or composite. Paint all sides before installation. Stainless steel screws. Ventilation maintained per roof design.'
        },
    ],
    'fascia': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Weather protection at roof edge',
            regulationDetail: 'Fascia boards protect rafter ends from weather and provide fixing for gutters. Must be durable and weather-resistant. Proper flashing at roof/fascia junction.',
            specificationDetail: 'Fascia board min 22mm thickness. Prime all surfaces including back. Drip edge flashing over fascia top. Gutter behind fascia face for clean appearance.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'HUS.52',
            requirement: 'Fascia installation and finishing',
            regulationDetail: 'AMA Hus specifies fascia board dimensions, fixing methods, and paint/stain requirements for durability and appearance.',
            specificationDetail: 'Fix to each rafter tail. Scarf joints over rafters with sealant. Prime and paint all sides. Consider composite or aluminum-clad for reduced maintenance.'
        },
    ],
    'hängrännor': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Rainwater drainage away from building',
            regulationDetail: 'Rainwater must be collected and directed away from building foundation to prevent moisture damage. Gutters sized for roof area and local rainfall intensity.',
            specificationDetail: 'Half-round or box gutters sized for roof area (125mm typical for houses). Slope 3-5mm per meter toward downspouts. Downspouts every 10m max.'
        },
    ],
    'takfot': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:2',
            requirement: 'Roof space ventilation and weather protection',
            regulationDetail: 'Soffits at takfot (eaves) must provide ventilation while protecting from weather and pests. Critical for preventing condensation in cold roof spaces.',
            specificationDetail: 'Perforated or vented soffit. Insect mesh required. Continuous ventilation slot or discrete vents. Match material to fascia/cladding.'
        },
    ],

    // ============================================================
    // WET ROOMS - Both English and Swedish keywords
    // ============================================================
    'wet room': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Certified waterproofing system',
            regulationDetail: 'All wet rooms must have a certified waterproofing system installed by a Säker Vatten-certified company. System must be type-approved and traceable.',
            specificationDetail: 'Liquid membrane (min 2 coats, total 1.0mm DFT). Reinforcement tape at all corners and joints. Flange seals at all penetrations. 100mm minimum up walls.'
        },
        {
            id: 'bbv',
            name: 'BBV',
            section: '21:1',
            requirement: 'Wet room tile installation',
            regulationDetail: 'Tiles in wet rooms must be installed according to BBV (Byggkeramikrådets branschregler för våtrum). Adhesive and grout must be type-approved for wet areas.',
            specificationDetail: 'Thin-bed adhesive (C2TES1 minimum). Grout with ≤5% water absorption. Movement joints at wall/floor junctions and every 3m. Silicone at all internal corners.'
        },
    ],
    'bathroom': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Full wet room protection',
            regulationDetail: 'Bathrooms are classified as wet rooms requiring full waterproofing on floor and walls to min 2.0m height (full height in shower zone). Floor drain with 1:50 fall.',
            specificationDetail: 'Wet room gypsum board on walls. Membrane system on all surfaces. Floor drain with min 50mm water seal. Underfloor heating recommended (prevents moisture issues).'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Accessible bathroom design',
            regulationDetail: 'At least one bathroom must be wheelchair accessible: min 1.3×1.3m turning space, grab rails, and toilet at accessible height (460-480mm).',
            specificationDetail: 'Level-entry shower (max 20mm threshold). WC height 460-480mm. Basin at 800mm with knee clearance. Support rails: 800mm height, 150mm from wall.'
        },
    ],
    'shower': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Shower zone waterproofing',
            regulationDetail: 'Shower zones require waterproofing to full ceiling height. Floor fall 1:50 minimum toward drain. Splash zone extends 500mm beyond shower screen/curtain.',
            specificationDetail: 'Membrane to ceiling in shower zone. Floor fall 1:50 to 1:100. Linear drain or floor drain with integrated fall. Glass screen: min 8mm toughened safety glass.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Level-entry shower',
            regulationDetail: 'Accessible showers must have level entry (max 20mm threshold) and min 900×900mm floor space. Folding seat and grab rail provisions required.',
            specificationDetail: 'Flush floor drain with prefabricated shower former. Min 900×900mm. Shower seat at 480mm height. Horizontal and vertical grab rails.'
        },
    ],
    'waterproof': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Type-approved membrane system',
            regulationDetail: 'Waterproofing membrane must be from a Säker Vatten type-approved system. All components (primer, membrane, tape, flanges) must be from the same system.',
            specificationDetail: 'Liquid membrane: min 2 coats, 24h drying between coats. Sheet membrane: overlaps 50mm, hot-air welded. Flange seals at all pipe penetrations. Document installation with photos.'
        },
    ],

    // ============================================================
    // ELECTRICAL - Both English and Swedish keywords
    // ============================================================
    'electrical': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            section: 'SS 436 40 00:2021',
            requirement: 'Swedish electrical installation standard',
            regulationDetail: 'All low-voltage electrical installations must comply with SS 436 40 00. RCD (jordfelsbrytare) protection required on all circuits. Type A minimum, Type B for EV charging.',
            specificationDetail: 'Main distribution board with RCDs (30mA). Separate circuits for lighting, sockets, kitchen, wet rooms. Cable sizing per load calculations. NYM/EKKX cable types.'
        },
        {
            id: 'elsak-fs',
            name: 'ELSÄK-FS',
            section: '2022:3',
            requirement: 'Certified electrician required',
            regulationDetail: 'Electrical work must be performed by an authorized electrician registered with Elsäkerhetsverket. Work must be documented and reported.',
            specificationDetail: 'Installation certificate (elinstallationsarbete) required after completion. As-built drawings must be provided to homeowner. 5-year warranty on installation.'
        },
    ],
    'socket': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            requirement: 'Socket placement & quantity',
            regulationDetail: 'Recommended minimum 2 double sockets per room. Kitchen requires dedicated 16A circuits. Wet room sockets must be IP44 rated in zone 2.',
            specificationDetail: 'Standard height 200-300mm from floor. Kitchen countertop sockets at 1100mm. Outdoor sockets IP66 rated with RCD protection.'
        },
        {
            id: 'elsak-fs',
            name: 'ELSÄK-FS',
            section: '2022:3',
            requirement: 'Installation certification',
            regulationDetail: 'Socket installation requires authorized electrician. All circuits must be tested for polarity, earth continuity, and insulation resistance.',
            specificationDetail: 'Test documentation required: loop impedance, RCD trip time (<300ms), insulation resistance (>1MΩ). Label all circuits at distribution board.'
        },
    ],
    'lighting': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            requirement: 'Lighting circuit requirements',
            regulationDetail: 'Lighting circuits separate from socket circuits. Emergency egress lighting recommended for hallways. Bathroom lighting on RCD-protected circuit.',
            specificationDetail: 'Dedicated lighting circuits (10A typical). 3-way switching for hallways/stairs. LED drivers should be accessible. Dimmer compatibility verified.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:3',
            requirement: 'Fire safety for recessed lights',
            regulationDetail: 'Recessed ceiling lights must not compromise fire resistance. Minimum clearance from insulation required. Fire-rated enclosures for IC-rated fixtures.',
            specificationDetail: 'IC-rated downlights with fire hoods in insulated ceilings. Min 50mm clearance to combustibles. LED fixtures preferred (lower heat). Document fixture ratings.'
        },
    ],

    // ============================================================
    // PLUMBING / VVS - Both English and Swedish keywords
    // ============================================================
    'plumbing': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Certified plumber & materials',
            regulationDetail: 'All water-connected installations must be performed by Säker Vatten-certified plumbers. Materials must be type-approved. Installation documented with photos.',
            specificationDetail: 'PEX piping with press fittings (not push-fit). Isolation valves at each fixture. Water hammer arrestors on washing machine lines. Insulate all hot water pipes.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:6',
            requirement: 'Water supply & drainage',
            regulationDetail: 'Hot water temperature max 60°C at tap to prevent scalding. Min 38°C required. Legionella prevention requires 55°C+ at water heater.',
            specificationDetail: 'Thermostatic mixing valves at showers/tubs. Water heater set 60°C minimum. Backflow prevention on all fixtures. Drainage slope 1:50 minimum.'
        },
    ],
    'toilet': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'WC installation standards',
            regulationDetail: 'WC must be connected to approved drainage system. Water-saving dual-flush (3/6L) recommended. Certified plumber required for installation.',
            specificationDetail: 'Floor-mounted or wall-hung (with concealed cistern). Isolation valve accessible. Flexible connector for easy maintenance. Seal with silicone at floor.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Accessible WC height',
            regulationDetail: 'At least one WC must be at accessible height 460-480mm (seat height). Support rails required on both sides at 800mm height.',
            specificationDetail: 'Comfort-height WC (460-480mm). Side-mounted or swing-up support rails. 150mm clearance from wall for rail mounting. Clear floor space 800mm × 1300mm.'
        },
    ],
    'floor drain': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Floor drain requirements',
            regulationDetail: 'Floor drains in wet rooms require 1:50 minimum fall gradient. Water trap depth minimum 50mm. Drain must be accessible for cleaning.',
            specificationDetail: 'Stainless steel drain grate. Min 50mm water seal depth. Pre-formed fall kit or screed to falls. Clean-out access within 3m. Document waterproofing flange seal.'
        },
    ],
    'heat pump': [
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Primary energy calculation',
            regulationDetail: 'Heat pumps significantly improve energy rating. COP (coefficient of performance) used in energy calculations. Air-source or ground-source depending on conditions.',
            specificationDetail: 'Air-source: COP 3.5-4.5, outdoor unit with defrost. Ground-source: COP 4.5-5.5, requires borehole or ground loops. Size for 80% of peak load (backup for coldest days).'
        },
        {
            id: 'ovk',
            name: 'OVK',
            requirement: 'Ventilation system integration',
            regulationDetail: 'Heat pump ventilation (FTX) integrates with mandatory ventilation inspection (OVK). Heat recovery efficiency ≥80% expected for new builds.',
            specificationDetail: 'FTX unit with 80%+ heat recovery. Filter classes F7 supply, M5 extract. Sound attenuators in bedrooms. Commissioning with flow balancing documentation.'
        },
    ],

    // ============================================================
    // FLOORING - Both English and Swedish keywords
    // ============================================================
    'floor': [
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE',
            requirement: 'Flooring installation standards',
            regulationDetail: 'Flooring must be installed according to AMA Hus standards. Subfloor moisture content must be verified before installation. Acclimatization period required.',
            specificationDetail: 'Check concrete moisture <85% RH before flooring. Acclimatize materials 48h minimum. Expansion gaps at walls (8-12mm). Self-leveling compound if needed.'
        },
        {
            id: 'ss-25267',
            name: 'SS 25267',
            section: 'Class C',
            requirement: 'Impact sound insulation',
            regulationDetail: 'Floor assemblies in multi-story buildings must achieve impact sound insulation L\'n,w ≤ 56 dB (Class C). Single-family homes exempt but recommended.',
            specificationDetail: 'Floating floor with acoustic underlay (≥17 dB improvement). Soft subfloor system or acoustic mat. Avoid rigid connections to walls.'
        },
    ],
    'parquet': [
        {
            id: 'ce-cpr',
            name: 'CE/CPR',
            requirement: 'CE-marked flooring product',
            regulationDetail: 'Wood flooring products must be CE-marked showing fire classification, formaldehyde emissions (E1 minimum), and slip resistance.',
            specificationDetail: 'Solid or engineered parquet (15mm+ wear layer). E1 emission class minimum. Pre-finished preferred. Manufacturer installation guidelines followed.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 8:4',
            requirement: 'Fire classification D-s2,d0',
            regulationDetail: 'Floor coverings must achieve fire class Dfl-s1 minimum. Wood flooring typically meets this. No additional treatment needed for standard residential use.',
            specificationDetail: 'Standard oak/ash parquet meets Dfl-s1. No fire treatment needed. Avoid high-gloss finishes that may affect rating. Keep manufacturer DoP on file.'
        },
    ],
    'tile': [
        {
            id: 'bbv',
            name: 'BBV',
            section: '21:1',
            requirement: 'Tile installation standards',
            regulationDetail: 'Tiles must be installed according to BBV standards. In wet areas, waterproofing membrane required under tiles. Falls to drain achieved in tile bed.',
            specificationDetail: 'C2TES1 adhesive minimum for wet areas. CG2WA grout. Movement joints every 3m and at all internal corners. Silicone at floor/wall junction.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '2:1',
            requirement: 'Slip resistance for accessibility',
            regulationDetail: 'Floor surfaces must provide adequate slip resistance. Wet areas require R10 minimum slip rating. Entrance areas with mat wells recommended.',
            specificationDetail: 'R10 slip rating (μ > 0.4) for wet areas. R11 for ramps/slopes. Avoid polished finishes in bathrooms. Test certificates from manufacturer.'
        },
    ],

    // ============================================================
    // KITCHEN - English and Swedish keywords
    // ============================================================
    'kitchen': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 3:2',
            requirement: 'Kitchen functional requirements',
            regulationDetail: 'Kitchens must have adequate working space, storage, and ventilation. Minimum 10 L/s extract ventilation with boost to 20 L/s. Cooker hood or equivalent required.',
            specificationDetail: 'Min 600mm between opposing counters. Extract over cooktop (hood or downdraft). Dedicated electrical circuits for appliances. GFCI protection for countertop outlets.'
        },
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Kitchen plumbing standards',
            regulationDetail: 'All water connections in kitchen must be installed by Säker Vatten certified plumber. Dishwasher connections require water stop valve and backflow prevention.',
            specificationDetail: 'Isolation valves under sink. Flexible hoses max 2m. Water stop valve for dishwasher. Trap with clean-out access. Hot water max 60°C to prevent scalding.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'YSB',
            requirement: 'Kitchen cabinet installation',
            regulationDetail: 'Kitchen cabinets must be securely mounted to wall using appropriate fixings for wall type. Countertops level and properly sealed at walls.',
            specificationDetail: 'Wall cabinets: 2 fixings per cabinet to studs or heavy-duty anchors. Base cabinets leveled on adjustable legs. Countertop joints sealed with silicone. Splashback min 50mm.'
        },
    ],
    'kök': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 3:2',
            requirement: 'Kitchen functional requirements',
            regulationDetail: 'Kitchens must have adequate working space, storage, and ventilation. Minimum 10 L/s extract ventilation with boost to 20 L/s. Cooker hood or equivalent required.',
            specificationDetail: 'Min 600mm between opposing counters. Extract over cooktop (hood or downdraft). Dedicated electrical circuits for appliances. GFCI protection for countertop outlets.'
        },
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Kitchen plumbing standards',
            regulationDetail: 'All water connections in kitchen must be installed by Säker Vatten certified plumber. Dishwasher connections require water stop valve and backflow prevention.',
            specificationDetail: 'Isolation valves under sink. Flexible hoses max 2m. Water stop valve for dishwasher. Trap with clean-out access. Hot water max 60°C to prevent scalding.'
        },
    ],
    'ikea': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 3:2',
            requirement: 'Kitchen installation requirements',
            regulationDetail: 'Factory-made kitchen systems must meet same functional requirements as custom kitchens. Ventilation, electrical, and plumbing must comply with Swedish standards.',
            specificationDetail: 'Follow manufacturer assembly instructions. Professional installation recommended for plumbing and electrical. Verify appliance energy ratings. Document warranty terms.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'YSB',
            requirement: 'Cabinet and worktop installation',
            regulationDetail: 'Even factory kitchen systems must be installed level, plumb, and securely fixed. Countertop joints sealed. Appliances properly connected and tested.',
            specificationDetail: 'Level base cabinets to ±2mm. Wall cabinets on rail system or individual brackets to studs. Countertop sealed at walls. Appliances connected per manufacturer specs.'
        },
    ],

    // ============================================================
    // CEILING - English and Swedish keywords
    // ============================================================
    'ceiling': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:5',
            requirement: 'Ceiling fire resistance requirements',
            regulationDetail: 'Ceiling surfaces contribute to fire compartmentalization. In residential buildings, ceiling finish typically EI 15-30 depending on construction. Fire stops at penetrations required.',
            specificationDetail: 'Standard gypsum board (12.5mm) on timber joists meets basic requirements. Fire-rated assemblies for floors above: 2×15mm fire-rated gypsum. Seal all penetrations with fire-rated materials.'
        },
        {
            id: 'ss-25267',
            name: 'SS 25267',
            section: 'Class C',
            requirement: 'Ceiling acoustic performance',
            regulationDetail: 'Ceiling assemblies in multi-story buildings contribute to sound insulation. Impact sound insulation L\'n,w ≤ 56 dB required. Ceiling absorbers improve room acoustics.',
            specificationDetail: 'Suspended acoustic ceiling panels (NRC 0.7+) improve room acoustics. Resilient channels reduce structure-borne sound. Acoustic insulation above ceiling cavity.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.2',
            requirement: 'Ceiling finish quality standards',
            regulationDetail: 'Ceiling surfaces must meet AMA quality tolerances for evenness and joint finish. Painted ceilings require specific preparation and coating specification.',
            specificationDetail: 'Gypsum board joints taped and filled to level 3-4. Prime before painting. 2 coats matt ceiling paint. Light fixtures require reinforced backing.'
        },
    ],
    'innertak': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:5',
            requirement: 'Ceiling fire resistance requirements',
            regulationDetail: 'Ceiling surfaces contribute to fire compartmentalization. In residential buildings, ceiling finish typically EI 15-30 depending on construction.',
            specificationDetail: 'Standard gypsum board (12.5mm) on timber joists meets basic requirements. Fire-rated assemblies for floors above: 2×15mm fire-rated gypsum.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.2',
            requirement: 'Ceiling finish quality standards',
            regulationDetail: 'Ceiling surfaces must meet AMA quality tolerances for evenness and joint finish. Painted ceilings require specific preparation.',
            specificationDetail: 'Gypsum board joints taped and filled to level 3-4. Prime before painting. 2 coats matt ceiling paint.'
        },
    ],

    // ============================================================
    // HEATING SYSTEMS - English and Swedish keywords
    // ============================================================
    'underfloor': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:4',
            requirement: 'Underfloor heating surface temperature limits',
            regulationDetail: 'Underfloor heating surface temperature limited to 27°C in living areas for comfort, 33°C in bathrooms. Higher temps in perimeter zones (<1m from external walls) permitted.',
            specificationDetail: 'Pipe spacing 100-300mm depending on heat demand. Manifold with individual circuit control. Insulation under pipes (min 30mm EPS). Screed thickness 45-65mm over pipes.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'PJB.6',
            requirement: 'Underfloor heating installation standards',
            regulationDetail: 'Underfloor heating systems must be installed according to AMA Hus with pressure testing before screed. System documentation including pipe layout required.',
            specificationDetail: 'PE-X or PE-RT pipes, oxygen barrier required. Pressure test at 6 bar for 24h before screed. Flow balancing after commissioning. Provide as-built drawings showing pipe runs.'
        },
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Hydronic system certification',
            regulationDetail: 'Water-based underfloor heating connected to domestic water system requires Säker Vatten certified installer. Separate circuits with isolation valves recommended.',
            specificationDetail: 'Certified installer for connections to boiler/heat pump. Expansion vessel sized for system. Mixing valve for temperature control. Antifreeze if freeze risk.'
        },
    ],
    'golvvärme': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:4',
            requirement: 'Underfloor heating surface temperature limits',
            regulationDetail: 'Underfloor heating surface temperature limited to 27°C in living areas for comfort, 33°C in bathrooms. Higher temps in perimeter zones (<1m from external walls) permitted.',
            specificationDetail: 'Pipe spacing 100-300mm depending on heat demand. Manifold with individual circuit control. Insulation under pipes (min 30mm EPS). Screed thickness 45-65mm over pipes.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'PJB.6',
            requirement: 'Underfloor heating installation standards',
            regulationDetail: 'Underfloor heating systems must be installed according to AMA Hus with pressure testing before screed. System documentation including pipe layout required.',
            specificationDetail: 'PE-X or PE-RT pipes, oxygen barrier required. Pressure test at 6 bar for 24h before screed. Flow balancing after commissioning. Provide as-built drawings showing pipe runs.'
        },
    ],
    'radiator': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:4',
            requirement: 'Radiator surface temperature and placement',
            regulationDetail: 'Radiator surface temperatures must not cause burn risk - max 60°C on accessible surfaces recommended. Placement typically under windows to counter cold downdrafts.',
            specificationDetail: 'Size radiators for design heat loss. Thermostatic radiator valves (TRV) on each unit. 100mm clearance below and behind for airflow. Bleed valves accessible.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'PJB.5',
            requirement: 'Radiator installation standards',
            regulationDetail: 'Radiators must be securely mounted with appropriate brackets for wall type. Pipe connections neat and accessible. System balanced for even heat distribution.',
            specificationDetail: 'Wall brackets rated for radiator weight. Level installation. Isolation valves each side. Pipe runs concealed or neatly clipped. System flushed and balanced.'
        },
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Heating system efficiency',
            regulationDetail: 'Radiator systems contribute to building energy calculation. Low-temperature systems (55/45°C) compatible with heat pumps improve efficiency ratings.',
            specificationDetail: 'Size for 55/45°C flow/return for heat pump compatibility. Individual room control via TRVs. Weather compensation on boiler/heat pump. Insulate distribution pipes.'
        },
    ],
    'element': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:4',
            requirement: 'Radiator surface temperature and placement',
            regulationDetail: 'Radiator surface temperatures must not cause burn risk - max 60°C on accessible surfaces recommended. Placement typically under windows to counter cold downdrafts.',
            specificationDetail: 'Size radiators for design heat loss. Thermostatic radiator valves (TRV) on each unit. 100mm clearance below and behind for airflow.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'PJB.5',
            requirement: 'Radiator installation standards',
            regulationDetail: 'Radiators must be securely mounted with appropriate brackets for wall type. Pipe connections neat and accessible.',
            specificationDetail: 'Wall brackets rated for radiator weight. Level installation. Isolation valves each side. System flushed and balanced.'
        },
    ],

    // ============================================================
    // INSULATION - English and Swedish keywords
    // ============================================================
    'insulation': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Thermal insulation U-value requirements',
            regulationDetail: 'Building envelope must meet maximum U-values: walls 0.18, roof 0.13, floor 0.15, windows 1.2 W/m²K. Thermal bridges must be minimized at junctions.',
            specificationDetail: 'Mineral wool or cellulose in timber frames. EPS/XPS for ground contact. Continuous insulation layer to avoid thermal bridges. Vapor barrier on warm side, wind barrier on cold side.'
        },
        {
            id: 'ce-cpr',
            name: 'CE/CPR',
            requirement: 'CE-marked insulation products',
            regulationDetail: 'Insulation materials must be CE-marked with declared thermal conductivity (λ), fire class, and compressive strength where relevant. Declaration of Performance (DoP) required.',
            specificationDetail: 'Mineral wool: λ ≤ 0.035 W/mK, fire class A1. EPS: λ ≤ 0.036 W/mK, fire class E. Document DoP for each product. Store materials dry before installation.'
        },
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Insulation affects energy declaration',
            regulationDetail: 'Insulation levels directly affect building energy performance rating. Higher insulation reduces heating demand and improves energy class.',
            specificationDetail: 'Calculate U-values including thermal bridges (Ψ-values). Blower door test to verify airtightness <0.6 L/s.m² at 50Pa. Document insulation installation with photos.'
        },
    ],
    'isolering': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Thermal insulation U-value requirements',
            regulationDetail: 'Building envelope must meet maximum U-values: walls 0.18, roof 0.13, floor 0.15, windows 1.2 W/m²K. Thermal bridges must be minimized at junctions.',
            specificationDetail: 'Mineral wool or cellulose in timber frames. EPS/XPS for ground contact. Continuous insulation layer to avoid thermal bridges. Vapor barrier on warm side, wind barrier on cold side.'
        },
        {
            id: 'ce-cpr',
            name: 'CE/CPR',
            requirement: 'CE-marked insulation products',
            regulationDetail: 'Insulation materials must be CE-marked with declared thermal conductivity (λ), fire class, and compressive strength where relevant.',
            specificationDetail: 'Mineral wool: λ ≤ 0.035 W/mK, fire class A1. EPS: λ ≤ 0.036 W/mK, fire class E. Store materials dry before installation.'
        },
    ],

    // ============================================================
    // DOORS & WINDOWS - Both English and Swedish keywords
    // ============================================================
    'door': [
        {
            id: 'hin',
            name: 'HIN',
            section: '3:1',
            requirement: 'Door clear width ≥ 80cm',
            regulationDetail: 'Interior doors must have minimum 80cm clear opening width for wheelchair access. Main entrance should be 90cm. Door handles at 800-900mm height.',
            specificationDetail: 'Standard 9M door = 80cm clear width. Lever handles (not round knobs). Contrast marking on glass doors. Max 25N opening force.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:3',
            requirement: 'Fire door requirements',
            regulationDetail: 'Doors to garage, technical rooms, or between fire compartments require fire rating. EI 30 for residential compartment doors.',
            specificationDetail: 'Fire door with intumescent seals. Self-closing device (overhead or floor spring). Fire-rated hardware. No modifications that compromise rating.'
        },
    ],
    'window': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Window U-value ≤ 1.2 W/m²K',
            regulationDetail: 'Windows must achieve U-value ≤ 1.2 W/m²K including frame. Triple glazing typically required in Swedish climate. Solar factor (g-value) considered for overheating.',
            specificationDetail: 'Triple glazed (4-16-4-16-4 typical). Argon or krypton fill. Low-E coating. Warm-edge spacers. Uw ≤ 1.0 recommended for energy class A.'
        },
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Window area in energy calculation',
            regulationDetail: 'Total window area affects energy declaration. Larger windows increase heating demand but may reduce lighting energy. Orientation matters (south = solar gain).',
            specificationDetail: 'Window area typically 15-20% of floor area. South windows maximize solar gain. North windows minimize. Consider external shading for south/west windows.'
        },
    ],

    // ============================================================
    // EXCAVATION & DRAINAGE - English keywords
    // ============================================================
    'excavation': [
        {
            id: 'afs',
            name: 'AFS',
            section: '2023:3',
            requirement: 'Excavation safety requirements',
            regulationDetail: 'Excavations deeper than 1.5m require shoring or sloped sides. Workers must have safe entry/exit. Underground utilities must be located before digging.',
            specificationDetail: 'Slope sides at 1:1 minimum for clay/silt. Shoring for deep trenches. Edge protection 1m from excavation. Dewatering plan if groundwater encountered.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Site preparation standards',
            regulationDetail: 'Building site must be prepared to prevent moisture problems. Organic material removed. Proper compaction of fill material required.',
            specificationDetail: 'Remove topsoil and organic material. Compact fill in 200mm layers. Verify bearing capacity. Install drainage before foundation work.'
        },
    ],
    'drainage': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Foundation drainage required',
            regulationDetail: 'Drainage system required around foundation to prevent water accumulation. Must connect to municipal system or approved discharge point.',
            specificationDetail: 'Perforated drain pipe (min 100mm) at footing level. Filter fabric around gravel bed. Slope 1:200 minimum to outlet. Inspection chambers at corners.'
        },
    ],

    // ============================================================
    // SWEDISH KEYWORDS (Original - kept for backward compatibility)
    // ============================================================
    'vägg': [
        { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
        { id: 'ama-hus', name: 'AMA Hus', requirement: 'Construction standards' },
    ],
    'yttervägg': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Wall U-value ≤ 0.18 W/m²K',
            regulationDetail: 'Exterior walls must achieve thermal transmittance ≤ 0.18 W/m²K. Thermal bridge-free design required at corners, window reveals, and wall-floor junctions.',
            specificationDetail: 'Timber frame 45×220mm with 45×45mm service cavity. Mineral wool insulation in all cavities. Wind barrier (diffusion-open) on cold side. Vapor barrier on warm side.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 5',
            requirement: 'Wind load & structural stability',
            regulationDetail: 'Wall structure must resist wind loads and transfer loads to foundation. Bracing requirements depend on building height and wind zone.',
            specificationDetail: 'OSB/plywood sheathing for racking resistance. Metal strapping from wall plates to foundation. Wind posts at openings >1.8m.'
        },
    ],
    'innervägg': [
        {
            id: 'ss-25267',
            name: 'SS 25267',
            section: 'Class C',
            requirement: 'Sound insulation R\'w ≥ 52 dB',
            regulationDetail: 'Walls between dwellings or between rooms and common areas must achieve airborne sound insulation R\'w ≥ 52 dB (Class C minimum for new residential).',
            specificationDetail: 'Double stud wall with 95mm mineral wool. 2×13mm gypsum each side. Acoustic sealant at perimeter. No rigid connections between leaf frames.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:5',
            requirement: 'Fire compartmentalization',
            regulationDetail: 'Interior walls may need fire rating depending on use. Walls to technical spaces or between units require EI 30/60. Fire stops required at service penetrations.',
            specificationDetail: 'EI 30: 2×13mm fire-rated gypsum + 70mm mineral wool. All penetrations sealed with fire collars or intumescent sealant.'
        },
    ],
    'tak': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Roof U-value ≤ 0.13 W/m²K',
            regulationDetail: 'Roof assemblies must achieve thermal transmittance ≤ 0.13 W/m²K to meet Swedish energy efficiency requirements for climate zone III (most of Sweden).',
            specificationDetail: 'Minimum 400mm mineral wool insulation between and over rafters. Vapor barrier (PE 0.2mm) on warm side. Breathable roofing membrane under tiles/metal.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 11',
            requirement: 'Snow load 2.0-3.5 kN/m²',
            regulationDetail: 'Roof structure must be designed for characteristic snow load based on location. Sweden ranges from 2.0 kN/m² (south) to 3.5+ kN/m² (north/mountains).',
            specificationDetail: 'Truss spacing typically 600-1200mm. C24 structural timber minimum. Metal gang-nail connector plates at joints. Engineer-certified design required.'
        },
    ],
    'grund': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Moisture protection from ground',
            regulationDetail: 'Foundation must prevent moisture from ground reaching the building. Capillary break and drainage required. Insulation must maintain R-value when wet.',
            specificationDetail: 'Min 300mm EPS/XPS under slab (λ ≤ 0.036). Capillary break layer (min 150mm gravel). PE vapor barrier (0.2mm) with sealed joints.'
        },
        {
            id: 'radon',
            name: 'Radon',
            section: 'BBR 6:23',
            requirement: 'Indoor radon < 200 Bq/m³',
            regulationDetail: 'Indoor radon concentration must not exceed 200 Bq/m³. In radon-risk areas, a radon barrier and possibly sub-slab ventilation is required.',
            specificationDetail: 'Radon membrane (min 0.2mm polyethylene) with all penetrations sealed. In high-risk areas: sub-slab ventilation pipes with fan-ready connection.'
        },
    ],
    'platta': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:1',
            requirement: 'Slab U-value ≤ 0.15 W/m²K',
            regulationDetail: 'Ground floor slab must achieve U-value ≤ 0.15 W/m²K. Edge insulation required to prevent thermal bridges at foundation perimeter.',
            specificationDetail: 'Slab: 100mm C25/30 concrete with B500B reinforcement mesh. Under-slab: min 300mm EPS. Edge: 100mm vertical + horizontal insulation.'
        },
        {
            id: 'eks',
            name: 'EKS/Eurocode',
            section: 'EKS 7',
            requirement: 'Foundation load-bearing capacity',
            regulationDetail: 'Foundation must be designed for soil conditions and building loads. Geotechnical investigation required for load-bearing capacity verification.',
            specificationDetail: 'Bearing capacity verified by engineer. Typical: compacted gravel base (min 200mm), reinforced concrete slab (100mm), ground beam if needed.'
        },
    ],
    'bjälklag': [
        { id: 'ss-25267', name: 'SS 25267', requirement: 'Impact sound' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5', requirement: 'Fire resistance' },
    ],

    // Wet room keywords
    'våtrum': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Certified waterproofing system',
            regulationDetail: 'All wet rooms must have a certified waterproofing system installed by a Säker Vatten-certified company. System must be type-approved and traceable.',
            specificationDetail: 'Liquid membrane (min 2 coats, total 1.0mm DFT). Reinforcement tape at all corners and joints. Flange seals at all penetrations. 100mm minimum up walls.'
        },
        {
            id: 'bbv',
            name: 'BBV',
            section: '21:1',
            requirement: 'Wet room tile installation',
            regulationDetail: 'Tiles in wet rooms must be installed according to BBV (Byggkeramikrådets branschregler för våtrum). Adhesive and grout must be type-approved for wet areas.',
            specificationDetail: 'Thin-bed adhesive (C2TES1 minimum). Grout with ≤5% water absorption. Movement joints at wall/floor junctions and every 3m. Silicone at all internal corners.'
        },
    ],
    'badrum': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Full wet room protection',
            regulationDetail: 'Bathrooms are classified as wet rooms requiring full waterproofing on floor and walls to min 2.0m height (full height in shower zone). Floor drain with 1:50 fall.',
            specificationDetail: 'Wet room gypsum board on walls. Membrane system on all surfaces. Floor drain with min 50mm water seal. Underfloor heating recommended (prevents moisture issues).'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Accessible bathroom design',
            regulationDetail: 'At least one bathroom must be wheelchair accessible: min 1.3×1.3m turning space, grab rails, and toilet at accessible height (460-480mm).',
            specificationDetail: 'Level-entry shower (max 20mm threshold). WC height 460-480mm. Basin at 800mm with knee clearance. Support rails: 800mm height, 150mm from wall.'
        },
    ],
    'dusch': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Shower zone waterproofing',
            regulationDetail: 'Shower zones require waterproofing to full ceiling height. Floor fall 1:50 minimum toward drain. Splash zone extends 500mm beyond shower screen/curtain.',
            specificationDetail: 'Membrane to ceiling in shower zone. Floor fall 1:50 to 1:100. Linear drain or floor drain with integrated fall. Glass screen: min 8mm toughened safety glass.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Level-entry shower',
            regulationDetail: 'Accessible showers must have level entry (max 20mm threshold) and min 900×900mm floor space. Folding seat and grab rail provisions required.',
            specificationDetail: 'Flush floor drain with prefabricated shower former. Min 900×900mm. Shower seat at 480mm height. Horizontal and vertical grab rails.'
        },
    ],
    'tätskikt': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Type-approved membrane system',
            regulationDetail: 'Waterproofing membrane must be from a Säker Vatten type-approved system. All components (primer, membrane, tape, flanges) must be from the same system.',
            specificationDetail: 'Liquid membrane: min 2 coats, 24h drying between coats. Sheet membrane: overlaps 50mm, hot-air welded. Flange seals at all pipe penetrations. Document installation with photos.'
        },
    ],

    // Electrical keywords
    'el': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            section: 'SS 436 40 00:2021',
            requirement: 'Swedish electrical installation standard',
            regulationDetail: 'All low-voltage electrical installations must comply with SS 436 40 00. RCD (jordfelsbrytare) protection required on all circuits. Type A minimum, Type B for EV charging.',
            specificationDetail: 'Main distribution board with RCDs (30mA). Separate circuits for lighting, sockets, kitchen, wet rooms. Cable sizing per load calculations. NYM/EKKX cable types.'
        },
        {
            id: 'elsak-fs',
            name: 'ELSÄK-FS',
            section: '2022:3',
            requirement: 'Certified electrician required',
            regulationDetail: 'Electrical work must be performed by an authorized electrician registered with Elsäkerhetsverket. Work must be documented and reported.',
            specificationDetail: 'Installation certificate (elinstallationsarbete) required after completion. As-built drawings must be provided to homeowner. 5-year warranty on installation.'
        },
    ],
    'uttag': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            requirement: 'Socket placement & quantity',
            regulationDetail: 'Recommended minimum 2 double sockets per room. Kitchen requires dedicated 16A circuits. Wet room sockets must be IP44 rated in zone 2.',
            specificationDetail: 'Standard height 200-300mm from floor. Kitchen countertop sockets at 1100mm. Outdoor sockets IP66 rated with RCD protection.'
        },
        {
            id: 'elsak-fs',
            name: 'ELSÄK-FS',
            section: '2022:3',
            requirement: 'Installation certification',
            regulationDetail: 'Socket installation requires authorized electrician. All circuits must be tested for polarity, earth continuity, and insulation resistance.',
            specificationDetail: 'Test documentation required: loop impedance, RCD trip time (<300ms), insulation resistance (>1MΩ). Label all circuits at distribution board.'
        },
    ],
    'belysning': [
        {
            id: 'ss-436',
            name: 'SS 436 40 00',
            requirement: 'Lighting circuit requirements',
            regulationDetail: 'Lighting circuits separate from socket circuits. Emergency egress lighting recommended for hallways. Bathroom lighting on RCD-protected circuit.',
            specificationDetail: 'Dedicated lighting circuits (10A typical). 3-way switching for hallways/stairs. LED drivers should be accessible. Dimmer compatibility verified.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:3',
            requirement: 'Fire safety for recessed lights',
            regulationDetail: 'Recessed ceiling lights must not compromise fire resistance. Minimum clearance from insulation required. Fire-rated enclosures for IC-rated fixtures.',
            specificationDetail: 'IC-rated downlights with fire hoods in insulated ceilings. Min 50mm clearance to combustibles. LED fixtures preferred (lower heat). Document fixture ratings.'
        },
    ],

    // Plumbing keywords
    'vvs': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Certified plumber & materials',
            regulationDetail: 'All water-connected installations must be performed by Säker Vatten-certified plumbers. Materials must be type-approved. Installation documented with photos.',
            specificationDetail: 'PEX piping with press fittings (not push-fit). Isolation valves at each fixture. Water hammer arrestors on washing machine lines. Insulate all hot water pipes.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:6',
            requirement: 'Water supply & drainage',
            regulationDetail: 'Hot water temperature max 60°C at tap to prevent scalding. Min 38°C required. Legionella prevention requires 55°C+ at water heater.',
            specificationDetail: 'Thermostatic mixing valves at showers/tubs. Water heater set 60°C minimum. Backflow prevention on all fixtures. Drainage slope 1:50 minimum.'
        },
    ],
    'wc': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'WC installation standards',
            regulationDetail: 'WC must be connected to approved drainage system. Water-saving dual-flush (3/6L) recommended. Certified plumber required for installation.',
            specificationDetail: 'Floor-mounted or wall-hung (with concealed cistern). Isolation valve accessible. Flexible connector for easy maintenance. Seal with silicone at floor.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '3:4',
            requirement: 'Accessible WC height',
            regulationDetail: 'At least one WC must be at accessible height 460-480mm (seat height). Support rails required on both sides at 800mm height.',
            specificationDetail: 'Comfort-height WC (460-480mm). Side-mounted or swing-up support rails. 150mm clearance from wall for rail mounting. Clear floor space 800mm × 1300mm.'
        },
    ],
    'golvbrunn': [
        {
            id: 'saker-vatten',
            name: 'Säker Vatten',
            section: '2021:1',
            requirement: 'Floor drain requirements',
            regulationDetail: 'Floor drains in wet rooms require 1:50 minimum fall gradient. Water trap depth minimum 50mm. Drain must be accessible for cleaning.',
            specificationDetail: 'Stainless steel drain grate. Min 50mm water seal depth. Pre-formed fall kit or screed to falls. Clean-out access within 3m. Document waterproofing flange seal.'
        },
    ],
    'värmepump': [
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Primary energy calculation',
            regulationDetail: 'Heat pumps significantly improve energy rating. COP (coefficient of performance) used in energy calculations. Air-source or ground-source depending on conditions.',
            specificationDetail: 'Air-source: COP 3.5-4.5, outdoor unit with defrost. Ground-source: COP 4.5-5.5, requires borehole or ground loops. Size for 80% of peak load (backup for coldest days).'
        },
        {
            id: 'ovk',
            name: 'OVK',
            requirement: 'Ventilation system integration',
            regulationDetail: 'Heat pump ventilation (FTX) integrates with mandatory ventilation inspection (OVK). Heat recovery efficiency ≥80% expected for new builds.',
            specificationDetail: 'FTX unit with 80%+ heat recovery. Filter classes F7 supply, M5 extract. Sound attenuators in bedrooms. Commissioning with flow balancing documentation.'
        },
    ],
    'ventilation': [
        {
            id: 'ovk',
            name: 'OVK',
            section: 'BFS 2011:16',
            requirement: 'Mandatory ventilation inspection',
            regulationDetail: 'OVK inspection required before occupancy and every 6 years thereafter. System must achieve designed airflow rates. Inspector certified by Boverket.',
            specificationDetail: 'OVK protocol documents: airflow per room, filter condition, sound levels, heat recovery efficiency. Deficiencies must be corrected within timeline.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 6:2',
            requirement: 'Minimum air flow rates',
            regulationDetail: 'Living rooms: 0.35 L/s per m². Kitchen: 10 L/s base + 20 L/s boost. Bathroom: 10-15 L/s. WC: 10 L/s. Bedroom: 4 L/s per person minimum.',
            specificationDetail: 'Supply air to bedrooms/living. Extract from kitchen/bathroom/WC. Balance to slight negative pressure. Sound level <25 dB(A) in bedrooms, <30 dB(A) elsewhere.'
        },
    ],

    // Finish keywords
    'golv': [
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE',
            requirement: 'Flooring installation standards',
            regulationDetail: 'Flooring must be installed according to AMA Hus standards. Subfloor moisture content must be verified before installation. Acclimatization period required.',
            specificationDetail: 'Check concrete moisture <85% RH before flooring. Acclimatize materials 48h minimum. Expansion gaps at walls (8-12mm). Self-leveling compound if needed.'
        },
        {
            id: 'ss-25267',
            name: 'SS 25267',
            section: 'Class C',
            requirement: 'Impact sound insulation',
            regulationDetail: 'Floor assemblies in multi-story buildings must achieve impact sound insulation L\'n,w ≤ 56 dB (Class C). Single-family homes exempt but recommended.',
            specificationDetail: 'Floating floor with acoustic underlay (≥17 dB improvement). Soft subfloor system or acoustic mat. Avoid rigid connections to walls.'
        },
    ],
    'parkett': [
        {
            id: 'ce-cpr',
            name: 'CE/CPR',
            requirement: 'CE-marked flooring product',
            regulationDetail: 'Wood flooring products must be CE-marked showing fire classification, formaldehyde emissions (E1 minimum), and slip resistance.',
            specificationDetail: 'Solid or engineered parquet (15mm+ wear layer). E1 emission class minimum. Pre-finished preferred. Manufacturer installation guidelines followed.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 8:4',
            requirement: 'Fire classification D-s2,d0',
            regulationDetail: 'Floor coverings must achieve fire class Dfl-s1 minimum. Wood flooring typically meets this. No additional treatment needed for standard residential use.',
            specificationDetail: 'Standard oak/ash parquet meets Dfl-s1. No fire treatment needed. Avoid high-gloss finishes that may affect rating. Keep manufacturer DoP on file.'
        },
    ],
    'kakel': [
        {
            id: 'bbv',
            name: 'BBV',
            section: '21:1',
            requirement: 'Wall tile installation',
            regulationDetail: 'Wall tiles in wet areas must follow BBV standards. Adhesive and grout must be type-approved for wet areas. Movement joints required.',
            specificationDetail: 'C2TES1 adhesive minimum for wet areas. CG2WA grout. Movement joints every 3m and at all internal corners. Silicone joints at floor/wall junction.'
        },
        {
            id: 'ama-hus',
            name: 'AMA Hus',
            section: 'MBE.1',
            requirement: 'Tile work quality',
            regulationDetail: 'Tile installation must achieve AMA quality levels: evenness ±2mm/2m, grout joints consistent width, no lippage >1mm between tiles.',
            specificationDetail: 'Use leveling clips for large format tiles. Grout joints 2-3mm. Back-butter tiles >300×300mm. Full adhesive coverage in wet areas (no voids).'
        },
    ],
    'klinker': [
        {
            id: 'bbv',
            name: 'BBV',
            section: '21:1',
            requirement: 'Floor tile installation',
            regulationDetail: 'Floor tiles must be suitable for foot traffic (PEI III+). In wet areas, waterproofing membrane required under tiles. Falls to drain achieved in tile bed.',
            specificationDetail: 'PEI IV for high-traffic areas. R10 slip rating minimum for wet areas. Falls created in screed, not tile adhesive. Expansion joints at doorways.'
        },
        {
            id: 'hin',
            name: 'HIN',
            section: '2:1',
            requirement: 'Slip resistance for accessibility',
            regulationDetail: 'Floor surfaces must provide adequate slip resistance. Wet areas require R10 minimum slip rating. Entrance areas with mat wells recommended.',
            specificationDetail: 'R10 slip rating (μ > 0.4) for wet areas. R11 for ramps/slopes. Avoid polished finishes in bathrooms. Test certificates from manufacturer.'
        },
    ],

    // Door/window keywords
    'dörr': [
        {
            id: 'hin',
            name: 'HIN',
            section: '3:1',
            requirement: 'Door clear width ≥ 80cm',
            regulationDetail: 'Interior doors must have minimum 80cm clear opening width for wheelchair access. Main entrance should be 90cm. Door handles at 800-900mm height.',
            specificationDetail: 'Standard 9M door = 80cm clear width. Lever handles (not round knobs). Contrast marking on glass doors. Max 25N opening force.'
        },
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 5:3',
            requirement: 'Fire door requirements',
            regulationDetail: 'Doors to garage, technical rooms, or between fire compartments require fire rating. EI 30 for residential compartment doors.',
            specificationDetail: 'Fire door with intumescent seals. Self-closing device (overhead or floor spring). Fire-rated hardware. No modifications that compromise rating.'
        },
    ],
    'fönster': [
        {
            id: 'bbr-2025',
            name: 'BBR 2025',
            section: 'BBR 9:4',
            requirement: 'Window U-value ≤ 1.2 W/m²K',
            regulationDetail: 'Windows must achieve U-value ≤ 1.2 W/m²K including frame. Triple glazing typically required in Swedish climate. Solar factor (g-value) considered for overheating.',
            specificationDetail: 'Triple glazed (4-16-4-16-4 typical). Argon or krypton fill. Low-E coating. Warm-edge spacers. Uw ≤ 1.0 recommended for energy class A.'
        },
        {
            id: 'energidek',
            name: 'Energidek.',
            section: 'BFS 2020:4',
            requirement: 'Window area in energy calculation',
            regulationDetail: 'Total window area affects energy declaration. Larger windows increase heating demand but may reduce lighting energy. Orientation matters (south = solar gain).',
            specificationDetail: 'Window area typically 15-20% of floor area. South windows maximize solar gain. North windows minimize. Consider external shading for south/west windows.'
        },
    ],
    'tröskel': [
        {
            id: 'hin',
            name: 'HIN',
            section: '3:1',
            requirement: 'Maximum threshold height 15mm',
            regulationDetail: 'Thresholds must not exceed 15mm height for wheelchair accessibility. Level thresholds preferred. If threshold needed, must be beveled or ramped.',
            specificationDetail: 'Flush thresholds where possible. If required, max 15mm with 1:2 ramp. Wet room thresholds with drain channel. Rubber or aluminum with ramps.'
        },
    ],

    // Admin keywords
    'bygglov': [
        {
            id: 'pbl',
            name: 'PBL',
            section: 'Ch. 9',
            requirement: 'Building permit required',
            regulationDetail: 'New single-family homes require building permit (bygglov) from the municipality. Process includes neighbor notification, plan review, and design approval. Typically 10 weeks processing time.',
            specificationDetail: 'Submit: site plan (1:500), floor plans, elevations, sections, technical description. Fee based on building size. Start permit required before construction begins.'
        },
    ],
    'ka': [
        {
            id: 'pbl',
            name: 'PBL',
            section: 'Ch. 10',
            requirement: 'Certified inspector (KA) required',
            regulationDetail: 'All building projects requiring permit must have a Kontrollansvarig (KA) - certified inspector who ensures compliance. KA attends technical meetings and signs off on completion.',
            specificationDetail: 'KA must be certified by Boverket (N or K level). Attends: start meeting, inspections, final meeting. Provides inspection report for slutbesked. Independent from contractor.'
        },
    ],
    'kontrollansvarig': [
        {
            id: 'pbl',
            name: 'PBL',
            section: 'Ch. 10',
            requirement: 'Independent quality control',
            regulationDetail: 'Kontrollansvarig is the building owner\'s representative for quality control. Must be independent from the contractor. Ensures control plan is followed and documents any deviations.',
            specificationDetail: 'KA visits site at critical stages: foundation, waterproofing, structure, completion. Signs control plan items. Issues statement for final inspection (slutbesked).'
        },
    ],
    'klimatdeklaration': [
        {
            id: 'klimatdek',
            name: 'Klimatdek.',
            section: 'BFS 2021:7',
            requirement: 'Climate declaration mandatory',
            regulationDetail: 'Since January 2022, all new buildings require a climate declaration reporting lifecycle CO2 emissions from materials (A1-A5 stages). Filed with Boverket before slutbesked.',
            specificationDetail: 'Calculate: materials production (A1-A3), transport (A4), construction (A5). Use Boverket\'s klimatdatabas for emission factors. Submit via digital platform before final approval.'
        },
        {
            id: 'pbl',
            name: 'PBL',
            section: '2022:1',
            requirement: 'LCA reporting to Boverket',
            regulationDetail: 'Climate declaration is part of the building permit process. Without approved declaration, slutbesked cannot be issued. Threshold limits expected to tighten over time.',
            specificationDetail: 'Current: reporting only, no limits. Future: CO2 limits per m². Document all material choices with EPDs. Low-carbon alternatives reduce declared emissions.'
        },
    ],
    'lca': [
        {
            id: 'klimatdek',
            name: 'Klimatdek.',
            section: 'BFS 2021:7',
            requirement: 'Lifecycle assessment required',
            regulationDetail: 'Lifecycle assessment (LCA) covers cradle-to-handover emissions. Building elements included: foundation, structure, envelope, interior finishes. Excludes: installations, landscaping.',
            specificationDetail: 'Use Boverket tools or third-party LCA software (One Click LCA, etc.). EPD data preferred. Generic data acceptable if EPD unavailable. Results in kg CO2e/m² BTA.'
        },
    ],
    'entreprenör': [
        {
            id: 'abt-06',
            name: 'ABT 06',
            requirement: 'Contractor design-build terms',
            regulationDetail: 'ABT 06 governs design-build (totalentreprenad) contracts. Contractor responsible for design and construction. 5-year warranty on workmanship. 10-year on hidden defects.',
            specificationDetail: 'Contract should specify: fixed price or cost-plus, payment schedule, change order process, completion date, liquidated damages. Include performance specifications.'
        },
        {
            id: 'ab-04',
            name: 'AB 04',
            requirement: 'General contract conditions',
            regulationDetail: 'AB 04 is the standard for traditional construction contracts (utförandeentreprenad) where client provides design. Defines responsibilities, payment terms, warranty periods.',
            specificationDetail: 'Standard warranty: 5 years for workmanship, 2 years for materials/equipment. Retention typically 5%. Final inspection within 30 days of completion notice.'
        },
        {
            id: 'konsument',
            name: 'Kons.tjänst',
            section: 'SFS 1985:716',
            requirement: '10-year consumer protection',
            regulationDetail: 'Consumer Services Act provides 10-year liability for serious hidden defects when building for consumers. Contractor must remedy defects discovered within this period.',
            specificationDetail: 'Applies to work for private individuals. Hidden defects (not visible at handover) covered 10 years. Document condition at handover thoroughly. Insurance recommended.'
        },
    ],
    'avtal': [
        {
            id: 'abt-06',
            name: 'ABT 06',
            requirement: 'Design-build contract terms',
            regulationDetail: 'ABT 06 is standard for contracts where contractor handles both design and construction. Clear specification of functional requirements and performance targets essential.',
            specificationDetail: 'Include: program documents, performance specs, reference standards. Define handover criteria, testing requirements, warranty terms. Change order process for variations.'
        },
        {
            id: 'ab-04',
            name: 'AB 04',
            requirement: 'Traditional contract terms',
            regulationDetail: 'AB 04 used when client provides complete design. Contractor executes according to drawings and specifications. Clear division of responsibility for design vs execution.',
            specificationDetail: 'Complement with AF (administrative regulations). Specify: document hierarchy, site conditions, coordination responsibilities, insurance requirements.'
        },
    ],
    'arbetsmiljö': [
        {
            id: 'afs',
            name: 'AFS',
            section: '2023:3',
            requirement: 'Construction site safety plan',
            regulationDetail: 'Work environment plan required for all construction sites. BAS-P (planning coordinator) during design, BAS-U (execution coordinator) during construction. Fall protection, PPE requirements.',
            specificationDetail: 'Plan covers: fall hazards, excavations, lifting operations, hazardous materials. Safety barriers, hard hats, hi-vis mandatory. Weekly safety walks documented.'
        },
    ],
    'säkerhet': [
        {
            id: 'afs',
            name: 'AFS',
            section: '2023:3',
            requirement: 'Workplace safety requirements',
            regulationDetail: 'Arbetsmiljöverket (Swedish Work Environment Authority) regulations apply to all construction work. Contractor responsible for site safety. Serious incidents must be reported.',
            specificationDetail: 'PPE requirements: helmet, safety footwear, hi-vis vest. Fall protection above 2m. First aid kit on site. Emergency procedures posted. Safety training documented.'
        },
    ],
    'handikapp': [
        {
            id: 'hin',
            name: 'HIN',
            section: 'BFS 2011:13',
            requirement: 'Accessibility requirements',
            regulationDetail: 'HIN (Boverket\'s regulations on removal of easily removed barriers) applies to new builds. Covers entrance access, interior circulation, bathroom accessibility, and emergency egress.',
            specificationDetail: 'Level entry (max 20mm threshold). 1.5m turning circles. Accessible bathroom on entry level. Contrast marking for visually impaired. Emergency egress without stairs.'
        },
        {
            id: 'alm',
            name: 'ALM',
            section: 'BFS 2011:5',
            requirement: 'Universal design principles',
            regulationDetail: 'ALM regulations ensure buildings are usable by people with reduced mobility. Applies to common areas, parking, paths, and at least one entrance route.',
            specificationDetail: 'Ramp slope max 1:12. Handrails on both sides of stairs. 800mm clear door width. Accessible parking within 25m. Tactile guidance at hazards.'
        },
    ],
    'rullstol': [
        {
            id: 'hin',
            name: 'HIN',
            section: '3:1',
            requirement: 'Wheelchair-accessible design',
            regulationDetail: 'Design must accommodate wheelchair users: 1.5m turning radius, 80cm minimum door width, accessible bathroom, level thresholds (max 15mm).',
            specificationDetail: 'Entry level bathroom required. Kitchen work surfaces at accessible height (850mm). Reach ranges 400-1100mm. Pull-side clearance at doors 600mm.'
        },
        {
            id: 'alm',
            name: 'ALM',
            section: 'BFS 2011:5',
            requirement: 'Mobility-impaired access',
            regulationDetail: 'At least one route through the building must be wheelchair accessible without steps or steep ramps. Elevator or lift required if more than one usable floor.',
            specificationDetail: 'Entry ramp if >20mm step. Elevator minimum 1.1×1.4m cabin. Landing at doors 1.5×1.5m. Emergency refuge area if no elevator. Intercom at inaccessible entrances.'
        },
    ],
};

/**
 * Get applicable regulations for a cost item
 */
export function getItemRegulations(item: { id?: string; elementName: string; phase?: string }): RegulationRef[] {
    const regulations: RegulationRef[] = [];
    const seenIds = new Set<string>();

    // First, check if we have a direct mapping by item ID
    if (item.id && ITEM_REGULATIONS[item.id]) {
        for (const reg of ITEM_REGULATIONS[item.id]) {
            if (!seenIds.has(reg.id)) {
                regulations.push(reg);
                seenIds.add(reg.id);
            }
        }
    }

    // Then, check keywords in the element name
    const nameLower = item.elementName.toLowerCase();
    for (const [keyword, regs] of Object.entries(KEYWORD_REGULATIONS)) {
        if (nameLower.includes(keyword)) {
            for (const reg of regs) {
                if (!seenIds.has(reg.id)) {
                    regulations.push(reg);
                    seenIds.add(reg.id);
                }
            }
        }
    }

    // Phase-based defaults (if no regulations found)
    if (regulations.length === 0 && item.phase) {
        const phaseDefaults: Record<string, RegulationRef[]> = {
            'ground': [
                { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
                { id: 'eks', name: 'EKS/Eurocode', requirement: 'Structural design' },
            ],
            'structure': [
                { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
                { id: 'ama-hus', name: 'AMA Hus', requirement: 'Construction standards' },
            ],
            'electrical': [
                { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Electrical standard' },
                { id: 'elsak-fs', name: 'ELSÄK-FS', requirement: 'Safety certification' },
            ],
            'plumbing': [
                { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Plumbing standards' },
                { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
            ],
            'interior': [
                { id: 'ama-hus', name: 'AMA Hus', requirement: 'Finishing standards' },
                { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
            ],
            'completion': [
                { id: 'pbl', name: 'PBL', requirement: 'Building Act' },
                { id: 'abt-06', name: 'ABT 06', requirement: 'Contract terms' },
            ],
        };

        if (phaseDefaults[item.phase]) {
            regulations.push(...phaseDefaults[item.phase]);
        }
    }

    // Limit to max 5 most relevant regulations
    return regulations.slice(0, 5);
}
