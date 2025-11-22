'use client';

import { useState } from 'react';
import { clientCosts } from '@/data/projectData';
import { Info, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function ClientCostSection() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const totalClientCost = clientCosts.reduce((sum, item) => sum + item.cost, 0);

    // Map IDs to translation keys
    const getTranslationKey = (id: string) => {
        switch(id) {
            case 'cc-01': return 'lagfart';
            case 'cc-02': return 'pantbrev';
            case 'cc-03': return 'bygglov';
            case 'cc-04': return 'karta';
            case 'cc-05': return 'utstakning';
            case 'cc-06': return 'ka';
            case 'cc-07': return 'el';
            case 'cc-08': return 'fiber';
            case 'cc-09': return 'byggstrom'; 
            case 'cc-10': return 'forsakring';
            default: return 'lagfart';
        }
    };

    return (
        <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-100/50 transition-colors text-left group"
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('client.title')}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t('client.desc')}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 font-mono">{totalClientCost.toLocaleString('sv-SE')} kr</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{t('client.est_total')}</div>
                    </div>
                    <div className={cn(
                        "p-2 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 transition-all",
                        isOpen && "rotate-180 bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {clientCosts.map((item) => {
                        const key = getTranslationKey(item.id);
                        const title = t(`cost.${key}`) !== `cost.${key}` ? t(`cost.${key}`) : item.name;
                        const desc = t(`cost.${key}_desc`) !== `cost.${key}_desc` ? t(`cost.${key}_desc`) : item.description;

                        return (
                            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1 p-1 bg-blue-50 rounded text-blue-600">
                                        <Info className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{title}</div>
                                        <div className="text-xs text-slate-500">{desc}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-medium text-slate-700">
                                    {item.cost.toLocaleString('sv-SE')} kr
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
