'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CostItem } from '@/types';
import { CostCard } from '../v3/CostCard';
import { cn } from '@/lib/utils';

interface PhaseSectionProps {
    title: string;
    totalCost: number;
    items: CostItem[];
    onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
    onHoverItem: (item: CostItem | null) => void;
}

export function PhaseSection({ title, totalCost, items, onUpdateItem, onHoverItem }: PhaseSectionProps) {
    const [isOpen, setIsOpen] = useState(false); // Default to collapsed

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
            {/* Header - Always Visible */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-100/50 transition-colors text-left group"
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    {!isOpen && (
                        <p className="text-xs text-slate-500 mt-1">
                            {items.length} items
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 font-mono">
                            {totalCost.toLocaleString('sv-SE')} kr
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            Est. Total
                        </div>
                    </div>
                    <div className={cn(
                        "p-2 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 transition-all",
                        isOpen && "rotate-180 bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </button>

            {/* Body - Collapsible */}
            {isOpen && (
                <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {items.map(item => (
                        <div 
                            key={item.id} 
                            onMouseEnter={() => onHoverItem(item)} 
                            onMouseLeave={() => onHoverItem(null)}
                        >
                            <CostCard
                                item={item}
                                onUpdate={(updates) => onUpdateItem(item.id, updates)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
