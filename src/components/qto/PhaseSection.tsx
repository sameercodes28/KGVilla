'use client';

import React from 'react';
import { CostItem } from '@/types';
import { CostCard } from './CostCard';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

interface PhaseSectionProps {
    title: string;
    totalCost: number;
    items: CostItem[];
    onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
    onHoverItem: (item: CostItem | null) => void;
    onInspectItem: (item: CostItem) => void;
}

export function PhaseSection({ title, totalCost, items, onUpdateItem, onHoverItem, onInspectItem }: PhaseSectionProps) {
    const TotalDisplay = (
        <div className="text-right">
            <div className="text-lg font-bold text-slate-900 font-mono">
                {totalCost.toLocaleString('sv-SE')} kr
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Est. Total
            </div>
        </div>
    );

    return (
        <CollapsibleSection
            title={title}
            subtitle={`${items.length} items`}
            rightContent={TotalDisplay}
        >
            {items.map(item => (
                <div 
                    key={item.id} 
                    onMouseEnter={() => onHoverItem(item)} 
                    onMouseLeave={() => onHoverItem(null)}
                >
                    <CostCard
                        item={item}
                        onUpdate={(updates) => onUpdateItem(item.id, updates)}
                        onInspect={onInspectItem}
                    />
                </div>
            ))}
        </CollapsibleSection>
    );
}
