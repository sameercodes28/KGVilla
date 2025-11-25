'use client';
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface TotalSummaryProps {
    totalCost: number;
    area: number;
    boa?: number;      // Living area (BOA)
    biarea?: number;   // Secondary area (Biarea)
}

export function TotalSummary({ totalCost, area, boa, biarea }: TotalSummaryProps) {
    const { t } = useTranslation();
    // Calculate cost per m² based on BOA if available, otherwise total area
    const costPerSqm = (boa || area) > 0 ? totalCost / (boa || area) : 0;

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{t('summary.title')}</h2>
                    <p className="text-slate-400 text-sm">{t('summary.subtitle')}</p>
                    {/* Area breakdown */}
                    {(boa !== undefined && boa > 0) && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <span className="text-slate-400">BOA: </span>
                                    <span className="font-medium">{boa} m²</span>
                                </div>
                                {(biarea !== undefined && biarea > 0) && (
                                    <div>
                                        <span className="text-slate-400">Biarea: </span>
                                        <span className="font-medium">{biarea} m²</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-slate-400">Total: </span>
                                    <span className="font-medium">{area} m²</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold font-mono mb-1">
                        {Math.round(totalCost).toLocaleString('sv-SE')} kr
                    </div>
                    <div className="text-slate-400 font-mono">
                        {costPerSqm.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²
                        {boa !== undefined && boa > 0 && <span className="text-xs ml-1">(BOA)</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
