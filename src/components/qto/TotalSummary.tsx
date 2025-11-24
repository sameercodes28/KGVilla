'use client';
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface TotalSummaryProps {
    totalCost: number;
    area: number;
}

export function TotalSummary({ totalCost, area }: TotalSummaryProps) {
    const { t } = useTranslation();
    const costPerSqm = area > 0 ? totalCost / area : 0;

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{t('summary.title')}</h2>
                    <p className="text-slate-400 text-sm">{t('summary.subtitle')}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold font-mono mb-1">
                        {Math.round(totalCost).toLocaleString('sv-SE')} kr
                    </div>
                    <div className="text-slate-400 font-mono">
                        {costPerSqm.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²
                    </div>
                </div>
            </div>
        </div>
    );
}
