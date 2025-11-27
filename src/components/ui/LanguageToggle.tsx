'use client';

import { Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
    const { language, setLanguage } = useTranslation();

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <div className="bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 p-1 flex items-center space-x-1">
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5",
                        language === 'en'
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    )}
                >
                    <Globe className="h-3.5 w-3.5" />
                    <span>EN</span>
                </button>
                <button
                    onClick={() => setLanguage('sv')}
                    className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5",
                        language === 'sv'
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    )}
                >
                    <Globe className="h-3.5 w-3.5" />
                    <span>SV</span>
                </button>
            </div>
        </div>
    );
}
