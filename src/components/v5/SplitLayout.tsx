import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initialBoQ, rooms, projectDetails, clientCosts } from '../../data/projectData';
import { CostCard } from '../v3/CostCard';
import { TotalSummary } from '../v3/TotalSummary';
import { VisualViewer } from './VisualViewer';
import { ClientCostSection } from '../v5/ClientCostSection';
import { BoQItem } from '../../types';
import { cn } from '../../lib/utils';
import { Plus, GripVertical } from 'lucide-react';

export function SplitLayout() {
    // State for BoQ Items (allows editing)
    const [items, setItems] = useState<BoQItem[]>(initialBoQ);
    const [highlightedItem, setHighlightedItem] = useState<BoQItem | null>(null);
    const [viewMode, setViewMode] = useState<'phases' | 'rooms'>('phases');

    // State for resizable split pane
    const [leftPaneWidth, setLeftPaneWidth] = useState(50); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // State for new custom item form
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemData, setNewItemData] = useState<Partial<BoQItem>>({
        elementName: '',
        unitPrice: 0,
        quantity: 1,
        unit: 'st',
        phase: 'structure'
    });

    // Load from LocalStorage on Mount
    useEffect(() => {
        const saved = localStorage.getItem('kgvilla-boq-items');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load items", e);
            }
        }
    }, []);

    // Save to LocalStorage on Change
    useEffect(() => {
        localStorage.setItem('kgvilla-boq-items', JSON.stringify(items));
    }, [items]);

    // Handle mouse drag for resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain between 30% and 70%
            const constrainedWidth = Math.min(Math.max(newWidth, 30), 70);
            setLeftPaneWidth(constrainedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    // Derived calculations
    const totalClientCosts = useMemo(() => clientCosts.reduce((sum, item) => sum + item.cost, 0), []);

    const totalConstructionCost = useMemo(() => {
        return items.reduce((sum, item) => {
            const price = item.customUnitPrice ?? item.unitPrice;
            const qty = item.customQuantity ?? item.quantity;
            return sum + (price * qty);
        }, 0);
    }, [items]);

    const totalCost = totalConstructionCost + totalClientCosts;

    // Handlers
    const handleUpdateItem = (id: string, updates: Partial<BoQItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            // Safely merge updates
            const updatedItem = { ...item, ...updates };

            // Recalculate total cost if price or quantity changed
            const price = updatedItem.customUnitPrice ?? updatedItem.unitPrice;
            const qty = updatedItem.customQuantity ?? updatedItem.quantity;
            updatedItem.totalCost = price * qty;
            updatedItem.totalQuantity = qty;

            return updatedItem;
        }));
    };

    const handleAddItem = () => {
        if (!newItemData.elementName || newItemData.unitPrice === undefined) return;

        const newItem: BoQItem = {
            id: `custom-${Date.now()}`,
            projectId: projectDetails.id,
            phase: newItemData.phase as any || 'structure',
            elementName: newItemData.elementName,
            description: 'Custom builder item',
            quantity: newItemData.quantity || 1,
            unit: newItemData.unit || 'st',
            unitPrice: newItemData.unitPrice,
            totalQuantity: newItemData.quantity || 1,
            totalCost: (newItemData.unitPrice || 0) * (newItemData.quantity || 1),
            confidenceScore: 1.0,
            isUserAdded: true,
            system: 'structure' // Default
        };

        setItems(prev => [...prev, newItem]);
        setIsAddingItem(false);
        setNewItemData({ elementName: '', unitPrice: 0, quantity: 1, unit: 'st', phase: 'structure' });
    };

    // Grouping Logic
    const itemsByPhase = (phase: string) => items.filter(i => i.phase === phase);
    const itemsByRoom = (roomId: string) => items.filter(i => i.roomId === roomId);
    const unassignedItems = items.filter(i => !i.roomId);

    const phases = [
        { id: 'ground', label: 'Markarbeten' },
        { id: 'structure', label: 'Stomme & Tak' },
        { id: 'electrical', label: 'El & Belysning' },
        { id: 'plumbing', label: 'VVS & Värme' },
        { id: 'interior', label: 'Invändigt & Kök' },
    ];

    const otherItems = items.filter(i => !phases.some(p => p.id === i.phase));

    return (
        <div ref={containerRef} className="flex h-screen bg-slate-50 relative select-none">
            {/* Left Pane - Visual Viewer */}
            <div
                className="h-full overflow-hidden"
                style={{ width: `${leftPaneWidth}%` }}
            >
                <VisualViewer highlightedItem={highlightedItem ? { ...highlightedItem, name: highlightedItem.elementName } : null} />

                {/* Overlay for Total Cost (Floating) */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Estimate</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCost.toLocaleString('sv-SE')} kr</p>
                    <p className="text-xs text-slate-400 mt-1">{(totalCost / (projectDetails.totalArea || 1)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²</p>
                </div>
            </div>

            {/* Right Pane: Data Feed */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white">
                <div className="max-w-2xl mx-auto p-8 pb-32">
                    <header className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">BETA</span>
                            <span>•</span>
                            <span>{projectDetails.id}</span>
                            <span>•</span>
                            <span>{projectDetails.lastModified}</span>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{projectDetails.name}</h1>

                            {/* View Switcher */}
                            <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
                                <button
                                    onClick={() => setViewMode('phases')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'phases' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                                >
                                    Phases
                                </button>
                                <button
                                    onClick={() => setViewMode('rooms')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'rooms' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                                >
                                    Rooms
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-500 text-lg">{projectDetails.address} • {projectDetails.totalArea} m²</p>
                    </header>

                    <ClientCostSection />

                    {/* Content based on View Mode */}
                    {viewMode === 'phases' ? (
                        <div className="space-y-8">
                            {phases.map(phase => {
                                const phaseItems = itemsByPhase(phase.id);
                                if (phaseItems.length === 0) return null;

                                return (
                                    <div key={phase.id} className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <h2 className="text-xl font-bold text-slate-900">{phase.label}</h2>
                                            <span className="text-sm font-mono text-slate-500">
                                                {phaseItems.reduce((sum, i) => sum + i.totalCost, 0).toLocaleString('sv-SE')} kr
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {phaseItems.map(item => (
                                                <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                    <CostCard
                                                        item={item}
                                                        onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Other Items Section (Items with custom/unknown phases) */}
                            {otherItems.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h2 className="text-xl font-bold text-slate-900">Other / Custom</h2>
                                        <span className="text-sm font-mono text-slate-500">
                                            {otherItems.reduce((sum, i) => sum + i.totalCost, 0).toLocaleString('sv-SE')} kr
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {otherItems.map(item => (
                                            <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                <CostCard
                                                    item={item}
                                                    onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {rooms.map(room => {
                                const roomItems = itemsByRoom(room.id);
                                if (roomItems.length === 0) return null;

                                return (
                                    <div key={room.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-slate-900">{room.name}</h3>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">{room.area} m² • {room.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-medium text-slate-900">
                                                    {roomItems.reduce((sum, i) => sum + i.totalCost, 0).toLocaleString('sv-SE')} kr
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {roomItems.map(item => (
                                                <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                    <CostCard
                                                        item={item}
                                                        onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Unassigned Items Section */}
                            {unassignedItems.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-8">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900">General / Unassigned</h3>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {unassignedItems.map(item => (
                                            <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                <CostCard
                                                    item={item}
                                                    onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add Custom Item Button */}
                    <div className="mt-12 border-t border-slate-200 pt-8">
                        {!isAddingItem ? (
                            <button
                                onClick={() => setIsAddingItem(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Custom Cost Item</span>
                            </button>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                <h3 className="font-bold text-slate-900">Add New Item</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Extra Insulation"
                                            value={newItemData.elementName}
                                            onChange={e => setNewItemData({ ...newItemData, elementName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Price (SEK)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.unitPrice}
                                            onChange={e => setNewItemData({ ...newItemData, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.quantity}
                                            onChange={e => setNewItemData({ ...newItemData, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Phase</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.phase}
                                            onChange={e => setNewItemData({ ...newItemData, phase: e.target.value as any })}
                                        >
                                            {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Add Item
                                    </button>
                                    <button
                                        onClick={() => setIsAddingItem(false)}
                                        className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12">
                        <TotalSummary totalCost={totalCost} area={projectDetails.totalArea || 0} />
                    </div>
                </div>
            </div>
        </div>
    );
}
