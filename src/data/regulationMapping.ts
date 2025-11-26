/**
 * REGULATION MAPPING SYSTEM
 * -------------------------
 * Maps construction elements to applicable Swedish building regulations.
 * Used to display relevant compliance requirements on cost items.
 */

export interface RegulationRef {
    id: string;
    name: string;
    section?: string;       // Specific section reference
    requirement?: string;   // Brief requirement description
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
 */
export const KEYWORD_REGULATIONS: Record<string, RegulationRef[]> = {
    // Structural keywords
    'vägg': [
        { id: 'bbr-2025', name: 'BBR 2025', requirement: 'Building regulations' },
        { id: 'ama-hus', name: 'AMA Hus', requirement: 'Construction standards' },
    ],
    'yttervägg': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9', requirement: 'Energy requirements' },
        { id: 'eks', name: 'EKS/Eurocode', requirement: 'Load calculations' },
        { id: 'energidek', name: 'Energidek.', requirement: 'U-value for rating' },
    ],
    'innervägg': [
        { id: 'ss-25267', name: 'SS 25267', requirement: 'Sound insulation' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5', requirement: 'Fire safety' },
    ],
    'tak': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9', requirement: 'Roof U-value' },
        { id: 'eks', name: 'EKS/Eurocode', requirement: 'Snow load design' },
    ],
    'grund': [
        { id: 'radon', name: 'Radon', requirement: '< 200 Bq/m³' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:1', requirement: 'Moisture protection' },
    ],
    'platta': [
        { id: 'radon', name: 'Radon', requirement: 'Radon membrane' },
        { id: 'eks', name: 'EKS/Eurocode', requirement: 'Foundation design' },
    ],
    'bjälklag': [
        { id: 'ss-25267', name: 'SS 25267', requirement: 'Impact sound' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5', requirement: 'Fire resistance' },
    ],

    // Wet room keywords
    'våtrum': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Waterproofing' },
        { id: 'bbv', name: 'BBV', requirement: 'Tile installation' },
    ],
    'badrum': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Wet room standards' },
        { id: 'hin', name: 'HIN', requirement: 'Accessibility' },
    ],
    'dusch': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Splash protection' },
        { id: 'hin', name: 'HIN', requirement: 'Level entry' },
    ],
    'tätskikt': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Membrane specs' },
    ],

    // Electrical keywords
    'el': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Electrical standard' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', requirement: 'Safety certification' },
    ],
    'uttag': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Socket placement' },
        { id: 'elsak-fs', name: 'ELSÄK-FS', requirement: 'Installation cert.' },
    ],
    'belysning': [
        { id: 'ss-436', name: 'SS 436 40 00', requirement: 'Lighting circuits' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:3', requirement: 'Fire around lights' },
    ],

    // Plumbing keywords
    'vvs': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Plumbing standards' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:6', requirement: 'Water installations' },
    ],
    'wc': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: 'Installation cert.' },
        { id: 'hin', name: 'HIN', requirement: 'Accessible height' },
    ],
    'golvbrunn': [
        { id: 'saker-vatten', name: 'Säker Vatten', requirement: '1:50 fall' },
    ],
    'värmepump': [
        { id: 'energidek', name: 'Energidek.', requirement: 'Energy rating' },
        { id: 'ovk', name: 'OVK', requirement: 'Ventilation integration' },
    ],
    'ventilation': [
        { id: 'ovk', name: 'OVK', requirement: 'Mandatory inspection' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 6:2', requirement: 'Air flow rates' },
    ],

    // Finish keywords
    'golv': [
        { id: 'ama-hus', name: 'AMA Hus', requirement: 'Flooring standards' },
        { id: 'ss-25267', name: 'SS 25267', requirement: 'Impact sound' },
    ],
    'parkett': [
        { id: 'ce-cpr', name: 'CE/CPR', requirement: 'CE-marked product' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 8:4', requirement: 'Fire class' },
    ],
    'kakel': [
        { id: 'bbv', name: 'BBV', requirement: 'Tile installation' },
        { id: 'ama-hus', name: 'AMA Hus', requirement: 'Quality standards' },
    ],
    'klinker': [
        { id: 'bbv', name: 'BBV', requirement: 'Ceramic tile rules' },
        { id: 'hin', name: 'HIN', requirement: 'Slip resistance' },
    ],

    // Door/window keywords
    'dörr': [
        { id: 'hin', name: 'HIN', requirement: '80cm clear width' },
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 5:3', requirement: 'Fire doors' },
    ],
    'fönster': [
        { id: 'bbr-2025', name: 'BBR 2025', section: 'BBR 9', requirement: 'U-value limits' },
        { id: 'energidek', name: 'Energidek.', requirement: 'Energy calculation' },
    ],
    'tröskel': [
        { id: 'hin', name: 'HIN', requirement: 'Max 15mm height' },
    ],

    // Admin keywords
    'bygglov': [
        { id: 'pbl', name: 'PBL', requirement: 'Permit process' },
    ],
    'ka': [
        { id: 'pbl', name: 'PBL', section: 'Ch. 10', requirement: 'Inspector cert.' },
    ],
    'kontrollansvarig': [
        { id: 'pbl', name: 'PBL', requirement: 'Certified inspector' },
    ],
    'klimatdeklaration': [
        { id: 'klimatdek', name: 'Klimatdek.', requirement: 'CO2 declaration' },
        { id: 'pbl', name: 'PBL', section: '2022:1', requirement: 'Mandatory LCA' },
    ],
    'lca': [
        { id: 'klimatdek', name: 'Klimatdek.', requirement: 'Lifecycle assessment' },
    ],
    'entreprenör': [
        { id: 'abt-06', name: 'ABT 06', requirement: 'Contract terms' },
        { id: 'ab-04', name: 'AB 04', requirement: 'General conditions' },
        { id: 'konsument', name: 'Kons.tjänst', requirement: '10 year liability' },
    ],
    'avtal': [
        { id: 'abt-06', name: 'ABT 06', requirement: 'Contract terms' },
        { id: 'ab-04', name: 'AB 04', requirement: 'General conditions' },
    ],
    'arbetsmiljö': [
        { id: 'afs', name: 'AFS', section: '2023:3', requirement: 'Work environment' },
    ],
    'säkerhet': [
        { id: 'afs', name: 'AFS', requirement: 'Safety requirements' },
    ],
    'handikapp': [
        { id: 'hin', name: 'HIN', requirement: 'Barrier removal' },
        { id: 'alm', name: 'ALM', section: 'BFS 2011:5', requirement: 'Mobility access' },
    ],
    'rullstol': [
        { id: 'hin', name: 'HIN', requirement: 'Wheelchair access' },
        { id: 'alm', name: 'ALM', requirement: 'Accessibility' },
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
