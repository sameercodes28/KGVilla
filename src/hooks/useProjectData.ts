import { useState, useEffect, useMemo } from 'react';
import { CostItem, ConstructionPhase } from '@/types';
import { initialCostItems, clientCosts, projectDetails } from '@/data/projectData';
import { API_URL } from '@/lib/api';

export function useProjectData(projectId: string = projectDetails.id) {
    // --- State ---
    const [items, setItems] = useState<CostItem[]>([]);
    const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const storageKeyItems = `kgvilla-cost-items-${projectId}`;
    const storageKeyPlan = `kgvilla-plan-${projectId}`;

    // --- Persistence ---
    // Load from LocalStorage on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedItems = localStorage.getItem(storageKeyItems);
            const savedPlan = localStorage.getItem(storageKeyPlan);
            
            if (savedItems) {
                try {
                     
                    setItems(JSON.parse(savedItems));
                } catch (e) {
                    console.error("Failed to load items", e);
                }
            } else if (projectId === projectDetails.id) {
                // Only load mock data for the specific mock project ID
                 
                setItems(initialCostItems);
            }

            if (savedPlan) {
                setFloorPlanUrl(savedPlan);
            } else if (projectId === projectDetails.id) {
                // Mock plan for demo project
                setFloorPlanUrl('/hus-1405-plan.jpg');
            }

            setIsLoaded(true);
        }
    }, [projectId, storageKeyItems, storageKeyPlan]);

    // Save to LocalStorage on Change
    useEffect(() => {
        if (typeof window !== 'undefined' && isLoaded) {
            localStorage.setItem(storageKeyItems, JSON.stringify(items));
            if (floorPlanUrl) {
                localStorage.setItem(storageKeyPlan, floorPlanUrl);
            }
        }
    }, [items, floorPlanUrl, storageKeyItems, storageKeyPlan, isLoaded]);

    // --- Calculations ---
    const totalClientCosts = useMemo(() => clientCosts.reduce((sum, item) => sum + item.cost, 0), []);

    const totalConstructionCost = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = item.customUnitPrice ?? item.unitPrice;
            const qty = item.customQuantity ?? item.quantity;
            return sum + (price * qty);
        }, 0);
    }, [items]);

    const totalCost = totalConstructionCost + totalClientCosts;

    // --- Actions ---
    const updateItem = (id: string, updates: Partial<CostItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            const updatedItem = { ...item, ...updates };
            
            // Recalculate totals if price/qty changed
            const price = updatedItem.customUnitPrice ?? updatedItem.unitPrice;
            const qty = updatedItem.customQuantity ?? updatedItem.quantity;
            updatedItem.totalCost = price * qty;
            updatedItem.totalQuantity = qty;

            return updatedItem;
        }));
    };

    const addItem = (newItemData: Partial<CostItem>) => {
        if (!newItemData.elementName || newItemData.unitPrice === undefined) return;

        const newItem: CostItem = {
            id: `custom-${Date.now()}`,
            projectId: projectId,
            phase: (newItemData.phase as ConstructionPhase) || 'structure',
            elementName: newItemData.elementName,
            description: 'Custom builder item',
            quantity: newItemData.quantity || 1,
            unit: newItemData.unit || 'st',
            unitPrice: newItemData.unitPrice,
            totalQuantity: newItemData.quantity || 1,
            totalCost: (newItemData.unitPrice || 0) * (newItemData.quantity || 1),
            confidenceScore: 1.0,
            isUserAdded: true,
            system: 'structure'
        };

        setItems(prev => [...prev, newItem]);
    };

    const analyzePlan = async (file: File) => {
        setIsAnalyzing(true);
        
        // 1. Show preview immediately
        // Note: In a real app, upload to GCS and get URL. 
        // For prototype, we use FileReader for local preview.
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setFloorPlanUrl(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);

        // 2. Send to API
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data: CostItem[] = await response.json();
            
            // 3. Merge results
            setItems(prev => [...prev, ...data]);
        } catch (error) {
            console.error("AI Analysis failed", error);
            // Fallback or error state could be handled here
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helpers for grouping
    const getItemsByPhase = (phase: string) => items.filter(i => i.phase === phase);
    const getItemsByRoom = (roomId: string) => items.filter(i => i.roomId === roomId);
    const getUnassignedItems = () => items.filter(i => !i.roomId);

    return {
        items,
        totalCost,
        floorPlanUrl,
        isAnalyzing,
        updateItem,
        addItem,
        analyzePlan,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems
    };
}
