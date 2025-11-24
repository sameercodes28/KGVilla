import { useState, useEffect, useMemo } from 'react';
import { CostItem, Project } from '@/types';
import { initialCostItems as mockItems } from '@/data/projectData';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncState {
    status: SyncStatus;
    lastSyncedAt: Date | null;
    errorMessage: string | null;
}

export function useProjectData(projectId?: string) {
    const [items, setItems] = useState<CostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    
    // Sync State
    const [syncState, setSyncState] = useState<SyncState>({
        status: 'synced',
        lastSyncedAt: null,
        errorMessage: null
    });

    // Helper to get storage key
    const storageKey = projectId ? `kgvilla_items_${projectId}` : null;

    // Migration Helper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migrateItems = (rawItems: any[]): CostItem[] => {
        const migrated = rawItems.map(item => {
            // Migrate legacy 'installations' phase
            if (item.phase === 'installations') {
                if (item.system === 'vvs') {
                    return { ...item, phase: 'plumbing' };
                }
                // Default to electrical for other installations or 'el' system
                return { ...item, phase: 'electrical' };
            }
            return item;
        });
        return migrated;
    };

    // 1. Load Data (LocalStorage First, then API)
    useEffect(() => {
        if (!projectId) return;

        // Cleanup flag to prevent state updates after unmount or project change
        let isCancelled = false;

        const loadData = async () => {
            setIsLoading(true);

            // A. Try LocalStorage
            try {
                const localData = localStorage.getItem(storageKey || '');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    const migrated = migrateItems(parsed);

                    if (isCancelled) return;
                    setItems(migrated);

                    // If migration happened, save back
                    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
                        localStorage.setItem(storageKey || '', JSON.stringify(migrated));
                        logger.info('useProjectData', 'Migrated legacy items', { count: migrated.length });
                    } else {
                        logger.info('useProjectData', 'Loaded items from LocalStorage', { projectId });
                    }
                } else {
                    // Default items if new project or empty
                    if (isCancelled) return;
                    setItems(mockItems);
                }
            } catch (e) {
                logger.error('useProjectData', 'LocalStorage error', e);
            }

            // B. Try API (Background Sync)
            try {
                const apiData = await apiClient.get<CostItem[]>(`/projects/${projectId}/items`);

                if (isCancelled) return;

                if (Array.isArray(apiData) && apiData.length > 0) {
                    const migratedApi = migrateItems(apiData);
                    setItems(migratedApi);
                    localStorage.setItem(storageKey || '', JSON.stringify(migratedApi));
                    setSyncState({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null });
                    logger.info('useProjectData', 'Synced items with API', { count: migratedApi.length });
                }
            } catch (err) {
                if (isCancelled) return;
                logger.warn('useProjectData', 'API unavailable, using local data', err);
                setError('Offline Mode: Changes saved locally.');
                setSyncState(prev => ({ ...prev, status: 'error', errorMessage: 'Offline' }));
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }

            // C. Fetch Project Details (for Floor Plan)
            try {
                const projectData = await apiClient.get<Project>(`/projects/${projectId}`);
                if (isCancelled) return;
                setProject(projectData);
            } catch (e) {
                // Silent fail for metadata
                logger.warn('useProjectData', 'Failed to fetch project metadata', e);
            }
        };

        loadData();

        // Cleanup function to cancel pending updates
        return () => {
            isCancelled = true;
        };
    }, [projectId, storageKey]);

    // Helper to save to both Local and API
    const persistItems = async (newItems: CostItem[]) => {
        if (!storageKey || !projectId) return;

        // 1. Local Save (Optimistic)
        localStorage.setItem(storageKey, JSON.stringify(newItems));
        setSyncState(prev => ({ ...prev, status: 'pending' }));
        
        // 2. API Save (Fire & Forget)
        try {
            await apiClient.post(`/projects/${projectId}/items`, newItems);
            setSyncState({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null });
        } catch (e) {
            logger.error('useProjectData', 'API Save Failed', e);
            setSyncState(prev => ({ 
                ...prev, 
                status: 'error', 
                errorMessage: 'Sync failed' 
            }));
        }
    };

    const addItem = (partialItem: Partial<CostItem>) => {
        if (!projectId) return;
        
        const newItem: CostItem = {
            id: crypto.randomUUID(),
            projectId,
            phase: 'structure', // Default
            elementName: 'New Item',
            description: '',
            quantity: 1,
            unit: 'st',
            unitPrice: 0,
            confidenceScore: 1.0,
            ...partialItem,
            totalCost: (partialItem.quantity || 1) * (partialItem.unitPrice || 0),
            totalQuantity: partialItem.quantity || 1
        };

        setItems(prev => {
            const updated = [...prev, newItem];
            persistItems(updated);
            return updated;
        });
    };

    const updateItem = (id: string, updates: Partial<CostItem>) => {
        setItems(prev => {
            const updated = prev.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, ...updates };
                    // Recalculate total if quantity or price changes
                    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
                        updatedItem.totalCost = updatedItem.quantity * updatedItem.unitPrice;
                    }
                    return updatedItem;
                }
                return item;
            });
            persistItems(updated);
            return updated;
        });
    };

    // Analyze Plan (Upload & AI Scan)
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzePlan = async (file: File) => {
        if (!projectId) return;
        setIsAnalyzing(true);
        logger.info('useProjectData', 'Analyzing plan', { fileName: file.name });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const newItems = await apiClient.upload<CostItem[]>('/analyze', formData);
            
            // Merge with existing items (or replace?)
            // For now, we append and rely on ID uniqueness logic if needed
            setItems(prev => {
                const updated = [...prev, ...newItems];
                persistItems(updated);
                return updated;
            });
            
            logger.info('useProjectData', 'Analysis complete', { count: newItems.length });

        } catch (e) {
            logger.error('useProjectData', 'Analysis failed', e);
            setError('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Derived State
    const totalCost = useMemo(() => items.reduce((sum, item) => sum + item.totalCost, 0), [items]);

    // Selectors
    const getItemsByPhase = (phaseId: string) => items.filter(i => i.phase === phaseId);
    const getItemsByRoom = (roomId: string) => items.filter(i => i.roomId === roomId);
    const getUnassignedItems = () => items.filter(i => !i.roomId);

    return {
        items,
        totalCost,
        isLoading,
        error,
        syncState,
        isAnalyzing,
        addItem,
        updateItem,
        analyzePlan,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems,
        project,
        floorPlanUrl: project?.floorPlanUrl || null
    };
}
