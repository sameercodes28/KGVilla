'use client';
import React from 'react';

interface TotalSummaryProps {
    totalCost: number;
    area: number;
}

export function TotalSummary({ totalCost, area }: TotalSummaryProps) {
    const costPerSqm = area > 0 ? totalCost / area : 0;

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Total Estimated Cost</h2>
                    <p className="text-slate-400 text-sm">Includes material, labor, and VAT (25%)</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold font-mono mb-1">
                        {totalCost.toLocaleString('sv-SE')} kr
                    </div>
                    <div className="text-slate-400 font-mono">
                        {costPerSqm.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²
                    </div>
                </div>
            </div>
        </div>
    );
}
