import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CostItem, Project } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';
import { generateUUID } from '@/lib/uuid';

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
    const [totalArea, setTotalArea] = useState<number>(0);
    const [boa, setBoa] = useState<number>(0);           // Living area (BOA)
    const [biarea, setBiarea] = useState<number>(0);     // Secondary area (Biarea)
    
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
                    // Start with empty items for new project
                    // Items will be populated by floor plan analysis
                    if (isCancelled) return;
                    setItems([]);
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

            // C. Fetch Project Details (for Floor Plan & totalArea)
            // First try localStorage (where useProjects stores it)
            let projectData: Project | null = null;
            try {
                const storedProjects = localStorage.getItem('kgvilla_projects');
                if (storedProjects) {
                    const projects: Project[] = JSON.parse(storedProjects);
                    const localProject = projects.find(p => p.id === projectId);
                    if (localProject) {
                        if (isCancelled) return;
                        projectData = localProject;
                        setProject(localProject);
                        if (localProject.totalArea) {
                            setTotalArea(localProject.totalArea);
                        }
                        if (localProject.boa) {
                            setBoa(localProject.boa);
                        }
                        if (localProject.biarea) {
                            setBiarea(localProject.biarea);
                        }
                        logger.info('useProjectData', 'Loaded area data from localStorage', {
                            totalArea: localProject.totalArea,
                            boa: localProject.boa,
                            biarea: localProject.biarea
                        });
                    }
                }
            } catch (e) {
                logger.warn('useProjectData', 'Failed to read project from localStorage', e);
            }

            // Then try API (may have more up-to-date data)
            try {
                const apiProjectData = await apiClient.get<Project>(`/projects/${projectId}`);
                if (isCancelled) return;
                setProject(apiProjectData);
                // Only update totalArea from API if it has a value (don't overwrite localStorage value with 0)
                if (apiProjectData.totalArea && apiProjectData.totalArea > 0) {
                    setTotalArea(apiProjectData.totalArea);
                }
            } catch (e) {
                // Silent fail for API metadata - we may have localStorage data
                if (!projectData) {
                    logger.warn('useProjectData', 'Failed to fetch project metadata', e);
                }
            }
        };

        loadData();

        // Cleanup function to cancel pending updates
        return () => {
            isCancelled = true;
        };
    }, [projectId, storageKey]);

    // Helper to save to both Local and API
    const persistItems = useCallback(async (newItems: CostItem[]) => {
        if (!storageKey || !projectId) return;

        // 1. Local Save (Optimistic)
        try {
            localStorage.setItem(storageKey, JSON.stringify(newItems));
        } catch (e) {
            logger.error('useProjectData', 'LocalStorage save failed', e);
        }
        setSyncState(prev => ({ ...prev, status: 'pending' }));

        // 2. API Save
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
    }, [storageKey, projectId]);

    // Track if items have been modified by user actions (not initial load)
    const isUserModified = useRef(false);

    // Persist items when they change due to user actions
    useEffect(() => {
        if (isUserModified.current && items.length > 0) {
            persistItems(items);
            isUserModified.current = false;
        }
    }, [items, persistItems]);

    const addItem = (partialItem: Partial<CostItem>) => {
        if (!projectId) return;

        const newItem: CostItem = {
            id: generateUUID(),
            projectId,
            phase: 'structure',
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

        isUserModified.current = true;
        setItems(prev => [...prev, newItem]);
    };

    const updateItem = (id: string, updates: Partial<CostItem>) => {
        isUserModified.current = true;
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, ...updates };
                if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
                    updatedItem.totalCost = updatedItem.quantity * updatedItem.unitPrice;
                }
                return updatedItem;
            }
            return item;
        }));
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

            const response = await apiClient.upload<{
                items: CostItem[],
                totalArea?: number,
                boa?: number,           // Living area (BOA)
                biarea?: number,        // Secondary area (Biarea)
                rooms?: unknown[],
                areaBreakdown?: {
                    boa_net: number,
                    biarea_net: number,
                    total_net: number,
                    boa_gross: number,
                    biarea_gross: number,
                    total_gross: number,
                }
            }>('/analyze', formData);
            const newItems = response.items || [];

            if (newItems.length === 0) {
                logger.warn('useProjectData', 'Analysis returned no items', { response });
                setError('Analysis completed but no items were extracted. Please try a different image.');
                return;
            }

            // Replace existing items with analyzed items (not append)
            // This ensures accurate pricing without duplicates
            const itemsWithProjectId = newItems.map(item => ({
                ...item,
                projectId
            }));

            setItems(itemsWithProjectId);
            persistItems(itemsWithProjectId);

            // Store totalArea, boa, biarea from analysis and persist to project
            if (response.totalArea) {
                setTotalArea(response.totalArea);
            }
            if (response.boa !== undefined) {
                setBoa(response.boa);
            }
            if (response.biarea !== undefined) {
                setBiarea(response.biarea);
            }

            // Persist to localStorage projects
            try {
                const storedProjects = localStorage.getItem('kgvilla_projects');
                if (storedProjects) {
                    const projects: Project[] = JSON.parse(storedProjects);
                    const updatedProjects = projects.map(p =>
                        p.id === projectId ? {
                            ...p,
                            totalArea: response.totalArea,
                            boa: response.boa,
                            biarea: response.biarea,
                        } : p
                    );
                    localStorage.setItem('kgvilla_projects', JSON.stringify(updatedProjects));
                    logger.info('useProjectData', 'Persisted area data to project', {
                        totalArea: response.totalArea,
                        boa: response.boa,
                        biarea: response.biarea
                    });
                }
            } catch (e) {
                logger.warn('useProjectData', 'Failed to persist area data to project', e);
            }

            logger.info('useProjectData', 'Analysis complete', {
                count: newItems.length,
                totalArea: response.totalArea,
                boa: response.boa,
                biarea: response.biarea
            });

        } catch (e) {
            logger.error('useProjectData', 'Analysis failed', e);
            setError('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Derived State
    const totalCost = useMemo(() => items.reduce((sum, item) => sum + item.totalCost, 0), [items]);

    // Selectors - memoized to prevent recreation on each render
    const getItemsByPhase = useCallback((phaseId: string) => items.filter(i => i.phase === phaseId), [items]);
    const getItemsByRoom = useCallback((roomId: string) => items.filter(i => i.roomId === roomId), [items]);
    const getUnassignedItems = useCallback(() => items.filter(i => !i.roomId), [items]);

    return {
        items,
        totalCost,
        totalArea,
        boa,         // Living area (BOA)
        biarea,      // Secondary area (Biarea)
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
