import { useState, useEffect, useMemo } from 'react';
import { CostItem, ConstructionPhase, Room } from '@/types';
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
    
    // Sync State
    const [syncState, setSyncState] = useState<SyncState>({
        status: 'synced',
        lastSyncedAt: null,
        errorMessage: null
    });

    // Helper to get storage key
    const storageKey = projectId ? `kgvilla_items_${projectId}` : null;

    // 1. Load Data (LocalStorage First, then API)
    useEffect(() => {
        if (!projectId) return;

        const loadData = async () => {
            setIsLoading(true);
            
            // A. Try LocalStorage
            try {
                const localData = localStorage.getItem(storageKey || '');
                if (localData) {
                    setItems(JSON.parse(localData));
                    logger.info('useProjectData', 'Loaded items from LocalStorage', { projectId });
                } else {
                    // Default items if new project or empty
                    setItems(mockItems); // Fallback
                }
            } catch (e) {
                logger.error('useProjectData', 'LocalStorage error', e);
            }

            // B. Try API (Background Sync)
            try {
                const apiData = await apiClient.get<CostItem[]>(`/projects/${projectId}/items`);
                
                if (Array.isArray(apiData) && apiData.length > 0) {
                    setItems(apiData);
                    localStorage.setItem(storageKey || '', JSON.stringify(apiData));
                    setSyncState({ status: 'synced', lastSyncedAt: new Date(), errorMessage: null });
                    logger.info('useProjectData', 'Synced items with API', { count: apiData.length });
                }
            } catch (err) {
                logger.warn('useProjectData', 'API unavailable, using local data', err);
                setError('Offline Mode: Changes saved locally.');
                setSyncState(prev => ({ ...prev, status: 'error', errorMessage: 'Offline' }));
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
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
        floorPlanUrl: null // TODO: Add this to Project model
    };
}
