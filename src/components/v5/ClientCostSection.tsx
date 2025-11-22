'use client';

import { clientCosts } from '@/data/projectData';
import { Info } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export function ClientCostSection() {
    const { t } = useTranslation();
    const totalClientCost = clientCosts.reduce((sum, item) => sum + item.cost, 0);

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
                {clientCosts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-start space-x-3">
                            <div className="mt-1 p-1 bg-blue-50 rounded text-blue-600">
                                <Info className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.description}</div>
                            </div>
                        </div>
                        <div className="font-mono font-medium text-slate-700">
                            {item.cost.toLocaleString('sv-SE')} kr
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
