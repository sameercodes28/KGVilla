import { useState, useEffect, useMemo } from 'react';
import { CostItem, ConstructionPhase } from '@/types';
import { initialCostItems, clientCosts, projectDetails } from '@/data/projectData';

export function useProjectData(projectId: string = projectDetails.id) {
    // --- State ---
    const [items, setItems] = useState<CostItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const storageKey = `kgvilla-cost-items-${projectId}`;

    // --- Persistence ---
    // Load from LocalStorage on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    // eslint-disable-next-line
                    setItems(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to load items from persistence", e);
                }
            } else if (projectId === projectDetails.id) {
                // Only load mock data for the specific mock project ID
                 
                setItems(initialCostItems);
            }
            setIsLoaded(true);
        }
    }, [projectId, storageKey]);

    // Save to LocalStorage on Change
    useEffect(() => {
        if (typeof window !== 'undefined' && isLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(items));
        }
    }, [items, storageKey, isLoaded]);

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

    // Helpers for grouping
    const getItemsByPhase = (phase: string) => items.filter(i => i.phase === phase);
    const getItemsByRoom = (roomId: string) => items.filter(i => i.roomId === roomId);
    const getUnassignedItems = () => items.filter(i => !i.roomId);

    return {
        items,
        totalCost,
        updateItem,
        addItem,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems
    };
}
