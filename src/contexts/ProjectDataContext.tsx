'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { CostItem, Project } from '@/types';
import { useProjectData, SyncState } from '@/hooks/useProjectData';

interface ProjectDataContextType {
    // Data State
    items: CostItem[];
    totalCost: number;
    totalArea: number;
    boa: number;         // Living area (BOA)
    biarea: number;      // Secondary area (Biarea)
    floorPlanUrl: string | null;
    project: Project | null;
    isLoading: boolean;
    error: string | null;
    isAnalyzing: boolean;
    syncState: SyncState;

    // Actions
    addItem: (item: Partial<CostItem>) => void;
    updateItem: (id: string, updates: Partial<CostItem>) => void;
    analyzePlan: (file: File) => Promise<void>;
    
    // UI State (moved from SplitLayout)
    highlightedItem: CostItem | null;
    setHighlightedItem: (item: CostItem | null) => void;
    inspectingItem: CostItem | null;
    setInspectingItem: (item: CostItem | null) => void;

    // Selectors
    getItemsByPhase: (phase: string) => CostItem[];
    getItemsByRoom: (roomId: string) => CostItem[];
    getUnassignedItems: () => CostItem[];
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export function ProjectDataProvider({ 
    children, 
    projectId 
}: { 
    children: ReactNode, 
    projectId?: string 
}) {
    const projectData = useProjectData(projectId);
    
    // UI State
    const [highlightedItem, setHighlightedItem] = useState<CostItem | null>(null);
    const [inspectingItem, setInspectingItem] = useState<CostItem | null>(null);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        ...projectData,
        highlightedItem,
        setHighlightedItem,
        inspectingItem,
        setInspectingItem
    }), [projectData, highlightedItem, inspectingItem]);

    return (
        <ProjectDataContext.Provider value={value}>
            {children}
        </ProjectDataContext.Provider>
    );
}

export function useProjectContext() {
    const context = useContext(ProjectDataContext);
    if (context === undefined) {
        throw new Error('useProjectContext must be used within a ProjectDataProvider');
    }
    return context;
}
