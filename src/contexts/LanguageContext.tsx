'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'sv';

type DictionaryEntry = { en: string; sv: string };
const dictionary: Record<string, DictionaryEntry> = {
    // Navigation
    'nav.home': { en: 'Home', sv: 'Hem' },
    'nav.project_view': { en: 'Project View', sv: 'Projektvy' },
    'nav.ai_analysis': { en: 'AI Analysis', sv: 'AI Analys' },

    // Dashboard / Home
    'dash.welcome': { en: 'Welcome back', sv: 'Välkommen tillbaka' },
    'dash.overview': { en: 'Here is an overview of your project', sv: 'Här är en översikt över ditt pågående projekt' },
    'dash.export': { en: 'Export Report', sv: 'Exportera Rapport' },
    'dash.new_qto': { en: 'Start New QTO', sv: 'Starta ny mängdning' },
    'dash.create_project': { en: 'Create New Project', sv: 'Skapa Nytt Projekt' },
    'dash.manage_desc': { en: 'Manage your house estimates and calculations.', sv: 'Hantera dina huskalkyler och beräkningar.' },
    'dash.my_projects': { en: 'My Projects', sv: 'Mina Projekt' },
    'dash.updated': { en: 'Updated', sv: 'Uppdaterad' },

    // QTO Page / Split Layout
    'qto.title': { en: 'Quantity Take-Off & Analysis', sv: 'Mängdning & Analys' },
    'qto.subtitle': { en: 'Review AI analysis of', sv: 'Granska AI-analysen av' },
    'qto.download': { en: 'Download PDF', sv: 'Ladda ner PDF' },
    'qto.total_estimate': { en: 'Total Estimate', sv: 'Total Kostnadskalkyl' },
    'qto.view_phases': { en: 'Phases', sv: 'Faser' },
    'qto.view_rooms': { en: 'Rooms', sv: 'Rum' },
    'qto.add_custom_item': { en: 'Add Custom Cost Item', sv: 'Lägg till egen kostnadspost' },
    'qto.add_new_item': { en: 'Add New Item', sv: 'Lägg till ny post' },
    'qto.item_name': { en: 'Item Name', sv: 'Benämning' },
    'qto.price': { en: 'Price (SEK)', sv: 'Pris (SEK)' },
    'qto.quantity': { en: 'Quantity', sv: 'Antal/Mängd' },
    'qto.phase': { en: 'Phase', sv: 'Fas' },
    'qto.btn_add': { en: 'Add Item', sv: 'Lägg till' },
    'qto.btn_cancel': { en: 'Cancel', sv: 'Avbryt' },
    'qto.beta': { en: 'BETA', sv: 'BETA' },
    'qto.other_custom': { en: 'Other / Custom', sv: 'Övrigt / Eget' },
    'qto.general_unassigned': { en: 'General / Unassigned', sv: 'Allmänt / Ej tilldelat' },

    // Client Costs
    'client.title': { en: 'Client Costs (Byggherrekostnader)', sv: 'Byggherrekostnader' },
    'client.desc': { en: 'Fees, permits, and connections paid directly by you.', sv: 'Avgifter, lov och anslutningar som betalas direkt av dig.' },
    'client.est_total': { en: 'Est. Total', sv: 'Est. Totalt' },

    // Client Costs Items
    'cost.lagfart': { en: 'Title Deed (Lagfart)', sv: 'Lagfart' },
    'cost.lagfart_desc': { en: 'Stamp duty (1.5% of purchase price) + admin fee', sv: 'Stämpelskatt (1.5% av köpeskilling) + exp.avgift' },
    'cost.pantbrev': { en: 'Mortgage Deed (Pantbrev)', sv: 'Pantbrev' },
    'cost.pantbrev_desc': { en: 'Stamp duty (2% of mortgage) + admin fee', sv: 'Stämpelskatt (2% av pantbrev) + exp.avgift' },
    'cost.bygglov': { en: 'Building Permit (Bygglov)', sv: 'Bygglov & Planavgift' },
    'cost.bygglov_desc': { en: 'Municipal fee for permit handling', sv: 'Kommunal avgift för bygglovshantering' },
    'cost.karta': { en: 'Site Map (Nybyggnadskarta)', sv: 'Nybyggnadskarta' },
    'cost.karta_desc': { en: 'Basis for the site plan', sv: 'Underlag för situationsplan' },
    'cost.utstakning': { en: 'Staking out (Utstakning)', sv: 'Utstakning' },
    'cost.utstakning_desc': { en: 'Rough and fine staking of the house position', sv: 'Grov- och finutstakning' },
    'cost.ka': { en: 'Inspection Manager (KA)', sv: 'Kontrollansvarig (KA)' },
    'cost.ka_desc': { en: 'Certified inspector required by PBL', sv: 'Certifierad kontrollansvarig enl. PBL' },
    'cost.el': { en: 'Electricity Connection', sv: 'Elanslutning' },
    'cost.el_desc': { en: 'Connection fee (16-25A)', sv: 'Anslutningsavgift till nätägare (16-25A)' },
    'cost.fiber': { en: 'Fiber Connection', sv: 'Fiberanslutning' },
    'cost.fiber_desc': { en: 'Installation and connection', sv: 'Installation av fiber' },
    'cost.vatten': { en: 'Water & Sewage Connection', sv: 'VA-anslutning' },
    'cost.vatten_desc': { en: 'Municipal connection fee', sv: 'Kommunal anslutningsavgift' },
    'cost.byggstrom': { en: 'Construction Electricity', sv: 'Byggström' },
    'cost.byggstrom_desc': { en: 'Rental of cabinet + consumption', sv: 'Hyra av byggskåp + förbrukning' },
    'cost.forsakring': { en: 'Construction Insurance', sv: 'Byggförsäkring' },
    'cost.forsakring_desc': { en: 'During construction period', sv: 'Under byggtiden' },

    // Cost Items
    'item.item-mark-01': { en: 'Site Setup & Excavation', sv: 'Etablering & Schaktning' },
    'item.item-mark-01_desc': { en: 'Setup, rough excavation for slab on grade, removal of masses.', sv: 'Etablering, grovschaktning för platta på mark, bortforsling av massor.' },
    
    'item.item-mark-02': { en: 'Foundation (Slab on Grade)', sv: 'Grundläggning (Platta på mark)' },
    'item.item-mark-02_desc': { en: 'Insulated concrete slab incl. reinforcement, edge elements and casting.', sv: 'Isolerad betongplatta inkl. armering, kantelement och gjutning.' },
    
    'item.item-mark-03': { en: 'Water/Sewage & Drainage (External)', sv: 'VA & Dränering (Utvändigt)' },
    'item.item-mark-03_desc': { en: 'Connection to municipal grid, stormwater cassettes, foundation drainage.', sv: 'Anslutning till kommunalt VA, dagvattenkassetter och dränering runt grund.' },

    'item.item-stom-01': { en: 'Exterior Walls (Prefab)', sv: 'Ytterväggar (Prefab)' },
    'item.item-stom-01_desc': { en: 'Prefabricated wall blocks, 195mm wood frame, insulation, wind barrier.', sv: 'Färdiga väggblock, trästomme 195mm, isolering, vindduk.' },

    'item.item-stom-02': { en: 'Trusses & Roof', sv: 'Takstolar & Yttertak' },
    'item.item-stom-02_desc': { en: 'Trusses, tongue & groove, felt, battens and concrete tiles.', sv: 'Takstolar, råspont, papp, läkt och betongpannor (Benders).' },

    'item.item-stom-03': { en: 'Windows & External Doors', sv: 'Fönster & Ytterdörrar' },
    'item.item-stom-03_desc': { en: 'Triple-glazed windows, Diplomat entrance door.', sv: 'Elitfönster 3-glas isoler, Entrédörr Diplomat.' },

    'item.item-el-k-01': { en: 'Power Outlets (Kitchen)', sv: 'Eluttag (Kök)' },
    'item.item-el-k-01_desc': { en: '2-way grounded wall sockets.', sv: 'Vägguttag 2-vägs jordat (Schneider Exxact).' },

    'item.item-el-k-02': { en: 'Spotlights (Kitchen)', sv: 'Belysning Spotlights (Kök)' },
    'item.item-el-k-02_desc': { en: 'Recessed LED spotlights incl. driver.', sv: 'Infällda LED-spotlights inkl. drivdon.' },

    'item.item-el-v-01': { en: 'Power Outlets (Living Room)', sv: 'Eluttag (Vardagsrum)' },
    'item.item-el-v-01_desc': { en: '2-way grounded wall sockets.', sv: 'Vägguttag 2-vägs jordat.' },

    'item.item-el-s-01': { en: 'Power Outlets (Bedrooms)', sv: 'Eluttag (Sovrum)' },
    'item.item-el-s-01_desc': { en: '2-way grounded wall sockets (4 per room).', sv: 'Vägguttag 2-vägs jordat (4 per rum).' },

    'item.item-el-01': { en: 'Distribution Board & Meter', sv: 'Elcentral & Mätarskåp' },
    'item.item-el-01_desc': { en: 'Meter cabinet + Media enclosure + Fuse box with RCD.', sv: 'Fasadmätarskåp + Mediacentral + Normcentral med JFB.' },

    'item.item-vvs-01': { en: 'Underfloor Heating (Water)', sv: 'Vattenburen Golvvärme' },
    'item.item-vvs-01_desc': { en: 'Complete system incl. manifold, pipes and thermostats.', sv: 'Komplett system inkl. fördelare, rör och termostater (Thermotech).' },

    'item.item-vvs-02': { en: 'Heat Pump (Exhaust Air)', sv: 'Värmepump (Frånluft)' },
    'item.item-vvs-02_desc': { en: 'NIBE F730 Exhaust Air Heat Pump incl. installation.', sv: 'NIBE F730 Frånluftsvärmepump inkl. installation.' },

    'item.item-vvs-b1-01': { en: 'WC (Bathroom 1)', sv: 'WC-stol (Badrum 1)' },
    'item.item-vvs-b1-01_desc': { en: 'Wall-hung toilet incl. fixture.', sv: 'Gustavsberg Nautic vägghängd inkl. fixtur.' },

    'item.item-vvs-b1-02': { en: 'Washbasin Mixer (Bathroom 1)', sv: 'Tvättställsblandare (Badrum 1)' },
    'item.item-vvs-b1-02_desc': { en: 'Mora MMIX mixer.', sv: 'Mora MMIX.' },

    'item.item-vvs-b1-03': { en: 'Shower Walls & Mixer', sv: 'Duschväggar & Blandare' },
    'item.item-vvs-b1-03_desc': { en: 'INR Linc walls + Mora MMIX overhead shower.', sv: 'INR Linc + Mora MMIX takdusch.' },

    'item.item-int-01': { en: 'Parquet Flooring', sv: 'Parkettgolv (Kährs)' },
    'item.item-int-01_desc': { en: 'Oak 3-strip, 15mm.', sv: 'Kährs Ek 3-stav, 15mm.' },

    'item.item-int-02': { en: 'Tiles (Bath/Hall)', sv: 'Klinker & Kakel (Badrum/Hall)' },
    'item.item-int-02_desc': { en: 'Labor cost + material average.', sv: 'Arbetskostnad + material (snittpris).' },

    'item.item-int-03': { en: 'Interior Doors', sv: 'Innerdörrar' },
    'item.item-int-03_desc': { en: 'Smooth white door incl. frame and handle.', sv: 'Swedoor slät vit inkl. karm och trycke.' },

    'item.item-int-04': { en: 'Kitchen Fittings', sv: 'Köksinredning' },
    'item.item-int-04_desc': { en: 'Standard kitchen cabinets incl. assembly.', sv: 'Ballingslöv eller Marbodal standardkök inkl. montering.' },

    'item.item-int-05': { en: 'Appliances', sv: 'Vitvaror' },
    'item.item-int-05_desc': { en: 'Siemens package (Fridge, Freezer, Oven, Hob, DW).', sv: 'Siemens paket (Kyl, Frys, Ugn, Häll, DM).' },

    // Phases
    'phase.ground': { en: 'Ground Works', sv: 'Markarbeten' },
    'phase.structure': { en: 'Structure & Roof', sv: 'Stomme & Tak' },
    'phase.electrical': { en: 'Electrical', sv: 'El & Belysning' },
    'phase.plumbing': { en: 'Plumbing & HVAC', sv: 'VVS & Värme' },
    'phase.interior': { en: 'Interior & Kitchen', sv: 'Invändigt & Kök' },
    'phase.completion': { en: 'Completion & Admin', sv: 'Slutförande & Administration' },
    'phase.admin': { en: 'Administrative Costs', sv: 'Administrativa kostnader' },
    // Cost Card
    'card.qty': { en: 'Qty:', sv: 'Antal:' },
    'card.price': { en: 'Price:', sv: 'Pris:' },
    'card.select_option': { en: 'Select Option', sv: 'Välj Alternativ' },
    'card.breakdown': { en: 'Estimated Breakdown', sv: 'Kostnadsfördelning' },
    'card.materials': { en: 'Materials', sv: 'Material' },
    'card.labor': { en: 'Labor', sv: 'Arbete' },
    'card.ai_calculation': { en: 'AI Calculation', sv: 'AI-Beräkning' },
    'card.guideline': { en: 'Guideline', sv: 'Riktlinje' },
    'card.custom': { en: 'Custom', sv: 'Egen' },
    'card.edited': { en: 'Edited', sv: 'Ändrad' },
    'card.regulations': { en: 'Applicable Regulations', sv: 'Tillämpliga Regelverk' },

    // Total Summary
    'summary.title': { en: 'Total Estimated Cost', sv: 'Total Beräknad Kostnad' },
    'summary.subtitle': { en: 'Includes material, labor, and VAT (25%)', sv: 'Inkluderar material, arbete och moms (25%)' },
    
    // AI Chat
    'chat.title': { en: 'AI Project Consultant', sv: 'AI Projektkonsult' },
    'chat.subtitle': { en: 'Expert in Swedish building regulations & costs', sv: 'Expert på svenska byggregler & kostnader' },
    'chat.placeholder': { en: 'Ask about budget, BBR regulations, or savings...', sv: 'Fråga om budget, BBR-regler eller besparingar...' },
    'chat.welcome': { en: 'Hi! I can help you optimize your budget. Try asking: "How can I reduce the total cost by 500,000 SEK?"', sv: 'Hej! Jag kan hjälpa dig att optimera din budget. Prova att fråga: "Hur kan jag minska totalkostnaden med 500 000 kr?"' },
    'chat.typing': { en: 'AI is thinking...', sv: 'AI tänker...' },

    // Cost Table (Legacy View)
    'cost.title': { en: 'Cost Breakdown', sv: 'Mängdförteckning' },
    'cost.export_excel': { en: 'Export Excel', sv: 'Exportera Excel' },
    'cost.save': { en: 'Save Changes', sv: 'Spara ändringar' },
    'cost.col.element': { en: 'Element / Material', sv: 'Byggdel / Material' },
    'cost.col.quantity': { en: 'Qty (Net)', sv: 'Mängd (Netto)' },
    'cost.col.unit': { en: 'Unit', sv: 'Enhet' },
    'cost.col.waste': { en: 'Waste (%)', sv: 'Spill (%)' },
    'cost.col.total': { en: 'Total (Gross)', sv: 'Totalt (Brutto)' },
    'cost.col.status': { en: 'Status', sv: 'Status' },
    'cost.col.source': { en: 'Price Source', sv: 'Priskälla' },
    'cost.col.cost': { en: 'Total Cost', sv: 'Total Kostnad' },

    // Assumption Dashboard
    'assump.title': { en: 'AI Assumptions & Alerts', sv: 'AI Antaganden & Avvikelser' },
    'assump.review': { en: 'to review', sv: 'att granska' },
    'assump.confidence': { en: 'confidence', sv: 'säkerhet' },
    'assump.suggested': { en: 'SUGGESTED VALUE:', sv: 'FÖRESLAGET VÄRDE:' },

    // Room Names (Swedish -> English)
    'room.VARDAGSRUM': { en: 'Living Room', sv: 'VARDAGSRUM' },
    'room.V.RUM': { en: 'Living Room', sv: 'V.RUM' },
    'room.ALLRUM': { en: 'Family Room', sv: 'ALLRUM' },
    'room.KÖK': { en: 'Kitchen', sv: 'KÖK' },
    'room.MATPLATS': { en: 'Dining Area', sv: 'MATPLATS' },
    'room.KÖK/VARDAGSRUM': { en: 'Kitchen/Living Room', sv: 'KÖK/VARDAGSRUM' },
    'room.KÖK/MATPLATS': { en: 'Kitchen/Dining', sv: 'KÖK/MATPLATS' },
    'room.MATPLATS / VARDAGSRUM': { en: 'Dining/Living Room', sv: 'MATPLATS / VARDAGSRUM' },
    'room.SOVRUM': { en: 'Bedroom', sv: 'SOVRUM' },
    'room.SOV': { en: 'Bedroom', sv: 'SOV' },
    'room.EV. SOV': { en: 'Possible Bedroom', sv: 'EV. SOV' },
    'room.ENTRÉ': { en: 'Entry', sv: 'ENTRÉ' },
    'room.ENTRE': { en: 'Entry', sv: 'ENTRE' },
    'room.HALL': { en: 'Hall', sv: 'HALL' },
    'room.WC/D': { en: 'Bathroom', sv: 'WC/D' },
    'room.WC/BAD': { en: 'Bathroom', sv: 'WC/BAD' },
    'room.BAD': { en: 'Bathroom', sv: 'BAD' },
    'room.BADRUM': { en: 'Bathroom', sv: 'BADRUM' },
    'room.TVÄTT': { en: 'Laundry', sv: 'TVÄTT' },
    'room.TVÄTTSTUGA': { en: 'Laundry Room', sv: 'TVÄTTSTUGA' },
    'room.GROVENTRÉ': { en: 'Utility Entry', sv: 'GROVENTRÉ' },
    'room.GROVENTRÉ / TVÄTT': { en: 'Utility/Laundry', sv: 'GROVENTRÉ / TVÄTT' },
    'room.TVÄTT / GROVENTRÉ': { en: 'Laundry/Utility', sv: 'TVÄTT / GROVENTRÉ' },
    'room.FÖRRÅD': { en: 'Storage', sv: 'FÖRRÅD' },
    'room.KLK': { en: 'Closet', sv: 'KLK' },
    'room.KLÄDKAMMARE': { en: 'Walk-in Closet', sv: 'KLÄDKAMMARE' },
    'room.GARAGE': { en: 'Garage', sv: 'GARAGE' },
    'room.GARAGE/FÖRRÅD': { en: 'Garage/Storage', sv: 'GARAGE/FÖRRÅD' },
    'room.TEKNIK': { en: 'Technical Room', sv: 'TEKNIK' },
    'room.ALTAN': { en: 'Terrace', sv: 'ALTAN' },
    'room.UTEPLATS': { en: 'Patio', sv: 'UTEPLATS' },
    'room.TERRASS': { en: 'Terrace', sv: 'TERRASS' },
    'room.BALKONG': { en: 'Balcony', sv: 'BALKONG' },
    'room.GENERAL': { en: 'General / Unassigned', sv: 'Allmänt / Ej tilldelat' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    translateRoom: (roomName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('sv');

    useEffect(() => {
        const saved = localStorage.getItem('kgvilla-lang');
        if (saved === 'en' || saved === 'sv') {
            // eslint-disable-next-line
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('kgvilla-lang', lang);
    };

    const t = (key: string) => {
        const entry = dictionary[key];
        if (!entry) return key;
        return entry[language];
    };

    // Translate room names (handles numbered rooms like "SOV 1", "SOVRUM 2", etc.)
    const translateRoom = (roomName: string): string => {
        if (!roomName) return roomName;

        // If Swedish, return as-is
        if (language === 'sv') return roomName;

        // Try exact match first
        const exactKey = `room.${roomName}`;
        const exactEntry = dictionary[exactKey];
        if (exactEntry) return exactEntry[language];

        // Handle numbered rooms (e.g., "SOV 1" -> "Bedroom 1", "SOVRUM 2" -> "Bedroom 2")
        const numberedMatch = roomName.match(/^(.+?)\s*(\d+)$/);
        if (numberedMatch) {
            const baseName = numberedMatch[1].trim();
            const number = numberedMatch[2];
            const baseKey = `room.${baseName}`;
            const baseEntry = dictionary[baseKey];
            if (baseEntry) return `${baseEntry[language]} ${number}`;
        }

        // Handle rooms with WC/D prefix (e.g., "WC/D1" -> "Bathroom 1")
        const wcMatch = roomName.match(/^(WC\/D)(\d*)$/);
        if (wcMatch) {
            const number = wcMatch[2] || '';
            return number ? `Bathroom ${number}` : 'Bathroom';
        }

        // Return original if no translation found
        return roomName;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateRoom }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
