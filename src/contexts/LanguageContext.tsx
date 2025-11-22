'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sv';

type DictionaryEntry = { en: string; sv: string };
const dictionary: Record<string, DictionaryEntry> = {
    // Navigation
    'nav.dashboard': { en: 'Dashboard', sv: 'Översikt' },
    'nav.projects': { en: 'Projects', sv: 'Projekt' },
    'nav.qto': { en: 'Quantity Take-Off', sv: 'Mängdning (QTO)' },
    'nav.settings': { en: 'Settings', sv: 'Inställningar' },

    // Dashboard
    'dash.welcome': { en: 'Welcome back', sv: 'Välkommen tillbaka' },
    'dash.overview': { en: 'Here is an overview of your project', sv: 'Här är en översikt över ditt pågående projekt' },
    'dash.export': { en: 'Export Report', sv: 'Exportera Rapport' },
    'dash.new_qto': { en: 'Start New QTO', sv: 'Starta ny mängdning' },
    'dash.drawings': { en: 'Uploaded Drawings', sv: 'Uppladdade Ritningar' },
    'dash.elements': { en: 'Quantified Elements', sv: 'Mängdade Element' },
    'dash.assemblies': { en: 'Assemblies', sv: 'Byggdelar' },
    'dash.upload_title': { en: 'Upload New Documents', sv: 'Ladda upp nya underlag' },
    'dash.upload_desc': { en: 'Upload architectural (A) or structural (K) drawings to start analysis.', sv: 'Ladda upp A-ritningar eller K-ritningar för att starta analysen.' },

    // QTO Page
    'qto.title': { en: 'Quantity Take-Off & Analysis', sv: 'Mängdning & Analys' },
    'qto.subtitle': { en: 'Review AI analysis of', sv: 'Granska AI-analysen av' },
    'qto.download': { en: 'Download PDF', sv: 'Ladda ner PDF' },

    // BoQ Table
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
    const [language, setLanguage] = useState<Language>('en');

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
