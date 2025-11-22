'use client';

import React from 'react';
import { X, Calculator, BookOpen, Layers, Hammer, Package } from 'lucide-react';
import { CostItem } from '@/types';
import { cn } from '@/lib/utils';

interface CostInspectorProps {
    item: CostItem | null;
    onClose: () => void;
}

export function CostInspector({ item, onClose }: CostInspectorProps) {
    if (!item) return null;

    const breakdown = item.breakdown || {
        material: item.totalCost * 0.6,
        labor: item.totalCost * 0.4,
        formula: `${item.quantity} ${item.unit} * ${item.unitPrice} kr`,
        components: ["Generic Material", "Standard Labor"],
        source: "Estimated Standard"
    };

    const total = (breakdown.material || 0) + (breakdown.labor || 0);
    const matPercent = total > 0 ? ((breakdown.material || 0) / total) * 100 : 0;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            
            {/* Sheet */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Cost Analysis</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Header Card */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.elementName}</h3>
                    <p className="text-slate-500 text-sm mb-4">{item.description}</p>
                    <div className="text-3xl font-mono font-bold text-slate-900">
                        {item.totalCost.toLocaleString('sv-SE')} kr
                    </div>
                </div>

                {/* Formula */}
                <div className="mb-8">
                    <div className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                        <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                        Calculation Logic
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 font-mono text-sm text-blue-800">
                        {breakdown.formula}
                    </div>
                </div>

                {/* Breakdown Bar */}
                <div className="mb-8">
                    <div className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                        <Layers className="h-4 w-4 mr-2 text-purple-600" />
                        Cost Composition
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex mb-2">
                        <div style={{ width: `${matPercent}%` }} className="bg-purple-500" />
                        <div style={{ width: `${100 - matPercent}%` }} className="bg-amber-500" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1.5" />
                            Material ({Math.round(matPercent)}%)
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-1.5" />
                            Labor ({Math.round(100 - matPercent)}%)
                        </div>
                    </div>
                </div>

                {/* Recipe / Components */}
                <div className="mb-8">
                    <div className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                        <Package className="h-4 w-4 mr-2 text-slate-600" />
                        Assembly Recipe
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                        {breakdown.components?.map((comp, i) => (
                            <div key={i} className="p-3 text-sm text-slate-600 flex items-center">
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-3" />
                                {comp}
                            </div>
                        ))}
                        {(!breakdown.components || breakdown.components.length === 0) && (
                            <div className="p-3 text-sm text-slate-400 italic">Standard components inferred.</div>
                        )}
                    </div>
                </div>

                {/* Source */}
                <div>
                    <div className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                        <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                        Pricing Source
                    </div>
                    <div className="text-sm text-slate-600 bg-green-50 p-4 rounded-xl border border-green-100">
                        {breakdown.source}
                        <div className="mt-2 text-xs text-green-700 font-medium">
                            Vendor: Generic (Market Average)
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
