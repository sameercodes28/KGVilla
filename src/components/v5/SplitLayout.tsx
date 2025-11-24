import React, { useEffect } from 'react';
import { projectDetails } from '../../data/projectData';
import { VisualViewer } from './VisualViewer';
import { ProjectDataFeed } from './ProjectDataFeed';
import { CostInspector } from './CostInspector';
import { useTranslation } from '../../contexts/LanguageContext';
import { logger } from '@/lib/logger';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { ProjectDataProvider, useProjectContext } from '@/contexts/ProjectDataContext';
import { CostItem } from '@/types';

interface SplitLayoutProps {
    projectId?: string;
}

function SplitLayoutContent({ projectId }: { projectId?: string }) {
    const { t } = useTranslation();
    
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
        getUnassignedItems,
        highlightedItem,
        setHighlightedItem,
        inspectingItem,
        setInspectingItem,
        syncState
    } = useProjectContext();

    useEffect(() => {
        logger.info('SplitLayout', 'Project View Loaded', { itemCount: items.length, totalCost });
    }, [items.length, totalCost]);

    const onAddItem = (item: Partial<CostItem>) => {
        addItem(item);
        logger.info('SplitLayout', 'Added new item', item);
    };

    return (
        <div className="flex h-screen bg-slate-50 relative select-none flex-col">
             <ProjectHeader 
                currentProjectId={projectId}
                showBackButton
                title={projectDetails.name} 
                subtitle={`${items.length} Items • ${(totalCost / (projectDetails.totalArea || 1)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²`}
                syncState={syncState}
            />

            <div className="flex flex-1 overflow-hidden">
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
                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('qto.total_estimate')}</p>
                        <p className="text-3xl font-bold text-slate-900">{totalCost.toLocaleString('sv-SE')} kr</p>
                    </div>
                </div>

                {/* Right Pane: Data Feed (Static 50%) */}
                <div className="w-1/2 h-full overflow-hidden flex flex-col bg-white">
                    {/* Scrollable Feed */}
                    <div className="flex-1 overflow-y-auto">
                        <ProjectDataFeed />
                    </div>
                </div>

                <CostInspector 
                    item={inspectingItem} 
                    onClose={() => setInspectingItem(null)} 
                />
            </div>
        </div>
    );
}

export function SplitLayout({ projectId }: SplitLayoutProps) {
    return (
        <ProjectDataProvider projectId={projectId}>
            <SplitLayoutContent projectId={projectId} />
        </ProjectDataProvider>
    );
}
