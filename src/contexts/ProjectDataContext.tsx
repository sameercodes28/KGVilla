'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CostItem } from '@/types';
import { useProjectData } from '@/hooks/useProjectData';

interface ProjectDataContextType {
    // Data State
    items: CostItem[];
    totalCost: number;
    floorPlanUrl: string | null;
    isLoading: boolean;
    error: string | null;
    isAnalyzing: boolean;

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

    return (
        <ProjectDataContext.Provider value={{
            ...projectData,
            highlightedItem,
            setHighlightedItem,
            inspectingItem,
            setInspectingItem
        }}>
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
