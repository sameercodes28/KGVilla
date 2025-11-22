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

    // Phases
    'phase.ground': { en: 'Ground Works', sv: 'Markarbeten' },
    'phase.structure': { en: 'Structure & Roof', sv: 'Stomme & Tak' },
    'phase.electrical': { en: 'Electrical', sv: 'El & Belysning' },
    'phase.plumbing': { en: 'Plumbing & HVAC', sv: 'VVS & Värme' },
    'phase.interior': { en: 'Interior & Kitchen', sv: 'Invändigt & Kök' },

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

    // Total Summary
    'summary.title': { en: 'Total Estimated Cost', sv: 'Total Beräknad Kostnad' },
    'summary.subtitle': { en: 'Includes material, labor, and VAT (25%)', sv: 'Inkluderar material, arbete och moms (25%)' },
    
    // AI Chat
    'chat.title': { en: 'AI Project Consultant', sv: 'AI Projektkonsult' },
    'chat.subtitle': { en: 'Expert in Swedish building regulations & costs', sv: 'Expert på svenska byggregler & kostnader' },
    'chat.placeholder': { en: 'Ask about budget, BBR regulations, or savings...', sv: 'Fråga om budget, BBR-regler eller besparingar...' },
    'chat.welcome': { en: 'Hi! I can help you optimize your budget. Try asking: "How can I reduce the total cost by 500,000 SEK?"', sv: 'Hej! Jag kan hjälpa dig att optimera din budget. Prova att fråga: "Hur kan jag minska totalkostnaden med 500 000 kr?"' },
    'chat.typing': { en: 'AI is thinking...', sv: 'AI tänker...' },

    // BoQ Table (Legacy/Table View)
    'boq.title': { en: 'Bill of Quantities', sv: 'Mängdförteckning (BoQ)' },
    'boq.export_excel': { en: 'Export Excel', sv: 'Exportera Excel' },
    'boq.save': { en: 'Save Changes', sv: 'Spara ändringar' },
    'boq.col.element': { en: 'Element / Material', sv: 'Byggdel / Material' },
    'boq.col.quantity': { en: 'Qty (Net)', sv: 'Mängd (Netto)' },
    'boq.col.unit': { en: 'Unit', sv: 'Enhet' },
    'boq.col.waste': { en: 'Waste (%)', sv: 'Spill (%)' },
    'boq.col.total': { en: 'Total (Gross)', sv: 'Totalt (Brutto)' },
    'boq.col.status': { en: 'Status', sv: 'Status' },
    'boq.col.source': { en: 'Price Source', sv: 'Priskälla' },
    'boq.col.cost': { en: 'Total Cost', sv: 'Total Kostnad' },

    // Assumption Dashboard
    'assump.title': { en: 'AI Assumptions & Alerts', sv: 'AI Antaganden & Avvikelser' },
    'assump.review': { en: 'to review', sv: 'att granska' },
    'assump.confidence': { en: 'confidence', sv: 'säkerhet' },
    'assump.suggested': { en: 'SUGGESTED VALUE:', sv: 'FÖRESLAGET VÄRDE:' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('sv');

    useEffect(() => {
        const saved = localStorage.getItem('kgvilla-lang');
        if (saved === 'en' || saved === 'sv') {
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

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
