import React, { useState, useEffect } from 'react';
import { projectDetails } from '../../data/projectData';
import { VisualViewer } from './VisualViewer';
import { ProjectDataFeed } from './ProjectDataFeed';
import { CostInspector } from './CostInspector';
import { CostItem } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { useProjectData } from '@/hooks/useProjectData';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
        analyzePlan,
        floorPlanUrl,
        isAnalyzing,
        getItemsByPhase, 
        getItemsByRoom, 
        getUnassignedItems 
    } = useProjectData(projectId);
    
    // --- UI State (Only for shared interactions like highlighting) ---
    const [highlightedItem, setHighlightedItem] = useState<CostItem | null>(null);
    const [inspectingItem, setInspectingItem] = useState<CostItem | null>(null);

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
                {isAnalyzing && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-bold">AI Architect is analyzing your plan...</p>
                        <p className="text-sm text-slate-400">Identifying rooms, walls, and requirements.</p>
                    </div>
                )}
                
                <VisualViewer 
                    floorPlanUrl={floorPlanUrl}
                    onUpload={analyzePlan}
                    highlightedItem={highlightedItem ? { ...highlightedItem, name: highlightedItem.elementName } : null} 
                />

                {/* Floating Cost Overlay */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('qto.total_estimate')}</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCost.toLocaleString('sv-SE')} kr</p>
                    <p className="text-xs text-slate-400 mt-1">{(totalCost / (projectDetails.totalArea || 1)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²</p>
                </div>
            </div>

            {/* Right Pane: Data Feed (Static 50%) */}
            <div className="w-1/2 h-full overflow-hidden flex flex-col bg-white">
                {/* Header Bar */}
                <div className="p-8 pb-0 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/qto" className="flex items-center text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium group">
                            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back to Projects
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{t('qto.beta')}</span>
                            <span>•</span>
                            <span>{projectId || projectDetails.id}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Feed */}
                <div className="flex-1 overflow-y-auto">
                    <ProjectDataFeed 
                        items={items}
                        totalCost={totalCost}
                        onUpdateItem={updateItem}
                        onAddItem={onAddItem}
                        onHoverItem={setHighlightedItem}
                        onInspectItem={setInspectingItem}
                        getItemsByPhase={getItemsByPhase}
                        getItemsByRoom={getItemsByRoom}
                        getUnassignedItems={getUnassignedItems}
                    />
                </div>
            </div>

            <CostInspector 
                item={inspectingItem} 
                onClose={() => setInspectingItem(null)} 
            />
        </div>
    );
}
