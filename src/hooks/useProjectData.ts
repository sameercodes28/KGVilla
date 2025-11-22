import { useState, useEffect, useMemo } from 'react';
import { BoQItem } from '@/types';
import { initialBoQ, clientCosts } from '@/data/projectData';

export function useProjectData() {
    // --- State ---
    const [items, setItems] = useState<BoQItem[]>(initialBoQ);

    // --- Persistence ---
    // Load from LocalStorage on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kgvilla-boq-items');
            if (saved) {
                try {
                    setItems(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to load items from persistence", e);
                }
            }
        }
    }, []);

    // Save to LocalStorage on Change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kgvilla-boq-items', JSON.stringify(items));
        }
    }, [items]);

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
    const updateItem = (id: string, updates: Partial<BoQItem>) => {
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

    const addItem = (newItemData: Partial<BoQItem>, projectId: string) => {
        if (!newItemData.elementName || newItemData.unitPrice === undefined) return;

        const newItem: BoQItem = {
            id: `custom-${Date.now()}`,
            projectId: projectId,
            phase: (newItemData.phase as any) || 'structure',
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
