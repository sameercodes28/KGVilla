import React, { useState, useEffect } from 'react';
import { projectDetails } from '../../data/projectData';
import { VisualViewer } from './VisualViewer';
import { ProjectDataFeed } from './ProjectDataFeed';
import { CostItem } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { useProjectData } from '@/hooks/useProjectData';
import { logger } from '@/lib/logger';

interface SplitLayoutProps {
    projectId?: string;
}

export function SplitLayout({ projectId }: SplitLayoutProps) {
    const { t } = useTranslation();
    
    // --- Business Logic (Hook) ---
    const {
        items,
        totalCost,
        updateItem,
        addItem,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems 
    } = useProjectData(projectId);
    
    // --- UI State (Only for shared interactions like highlighting) ---
    const [highlightedItem, setHighlightedItem] = useState<CostItem | null>(null);

    useEffect(() => {
        logger.info('SplitLayout', 'Project View Loaded', { itemCount: items.length, totalCost });
    }, []);

    // Action Wrapper
    const onAddItem = (item: Partial<CostItem>) => {
        addItem(item);
        logger.info('SplitLayout', 'Added new item', item);
    };

    return (
        <div className="flex h-screen bg-slate-50 relative select-none">
            {/* Left Pane - Visual Viewer (Static 50%) */}
            <div className="w-1/2 h-full overflow-hidden border-r border-slate-200 bg-slate-900 relative">
                <VisualViewer highlightedItem={highlightedItem ? { ...highlightedItem, name: highlightedItem.elementName } : null} />

                {/* Floating Cost Overlay */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('qto.total_estimate')}</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCost.toLocaleString('sv-SE')} kr</p>
                    <p className="text-xs text-slate-400 mt-1">{(totalCost / (projectDetails.totalArea || 1)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²</p>
                </div>
            </div>

            {/* Right Pane: Data Feed (Static 50%) */}
            <ProjectDataFeed 
                items={items}
                totalCost={totalCost}
                onUpdateItem={updateItem}
                onAddItem={onAddItem}
                onHoverItem={setHighlightedItem}
                getItemsByPhase={getItemsByPhase}
                getItemsByRoom={getItemsByRoom}
                getUnassignedItems={getUnassignedItems}
            />
        </div>
    );
}