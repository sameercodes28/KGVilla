'use client';

import { clientCosts } from '@/data/projectData';
import { Info } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export function ClientCostSection() {
    const { t } = useTranslation();
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
            case 'cc-09': return 'byggstrom'; // Note: Updated key name if needed, defaulting to lagfart if missing
            case 'cc-10': return 'forsakring';
            default: return 'lagfart';
        }
    };

    return (
        <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{t('client.title')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('client.desc')}</p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">{totalClientCost.toLocaleString('sv-SE')} kr</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t('client.est_total')}</div>
                </div>
            </div>

            <div className="space-y-3">
                {clientCosts.map((item) => {
                    const key = getTranslationKey(item.id);
                    // Fallback to English description if translation is missing or default
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
        </div>
    );
}
