import React, { useEffect } from 'react';
import { VisualViewer } from './VisualViewer';
import { ProjectDataFeed } from './ProjectDataFeed';
import { CostInspector } from './CostInspector';
import { useTranslation } from '../../contexts/LanguageContext';
import { logger } from '@/lib/logger';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { ProjectDataProvider, useProjectContext } from '@/contexts/ProjectDataContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

interface SplitLayoutProps {
    projectId?: string;
}

function SplitLayoutContent({ projectId }: { projectId?: string }) {
    const { t } = useTranslation();

    const {
        project,
        items,
        totalCost,
        totalArea,
        analyzePlan,
        floorPlanUrl,
        isAnalyzing,
        isLoading,
        error,
        highlightedItem,
        inspectingItem,
        setInspectingItem,
        syncState
    } = useProjectContext();

    useEffect(() => {
        logger.info('SplitLayout', 'Project View Loaded', { totalCost, itemCount: items.length, isLoading, error });
    }, [totalCost, items.length, isLoading, error]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading project...</p>
                </div>
            </div>
        );
    }

    // Show error state if critical error and no items
    if (error && items.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center max-w-md p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Project</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 relative select-none flex-col">
             <ProjectHeader
                currentProjectId={projectId}
                showBackButton
                title={project?.name || 'New Project'}
                subtitle={`${items.length} Items • ${Math.round(totalCost / (totalArea || 1)).toLocaleString('sv-SE')} kr/m²`}
                syncState={syncState}
            />

            {/* Language Toggle - Bottom Right */}
            <LanguageToggle />

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
                        <p className="text-3xl font-bold text-slate-900">{Math.round(totalCost).toLocaleString('sv-SE')} kr</p>
                        {totalArea > 0 && (
                            <p className="text-xs text-slate-500 mt-1">• {totalArea} m²</p>
                        )}
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
