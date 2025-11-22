'use client';

import { Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
    const { language, setLanguage } = useTranslation();

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-pulse-slow">
            <div className="bg-white rounded-full shadow-xl border-2 border-slate-300 p-1 flex items-center space-x-1">
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center space-x-2",
                        language === 'en'
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "text-slate-600 hover:bg-slate-100"
                    )}
                >
                    <Globe className="h-4 w-4" />
                    <span>EN</span>
                </button>
                <button
                    onClick={() => setLanguage('sv')}
                    className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center space-x-2",
                        language === 'sv'
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "text-slate-600 hover:bg-slate-100"
                    )}
                >
                    <Globe className="h-4 w-4" />
                    <span>SV</span>
                </button>
            </div>
        </div>
    );
}
