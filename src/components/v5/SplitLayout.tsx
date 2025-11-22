/**
 * SplitLayout Component
 * =====================
 * 
 * This is the core "Project View" of the application.
 * It implements a classic "Master-Detail" or "Visual-Data" split view common in CAD software.
 * 
 * Architecture:
 * - Uses `useProjectData` hook for business logic and state.
 * - Handles UI-specific state (resizing, view modes) locally.
 */

import React, { useState } from 'react';
import { projectDetails, rooms } from '../../data/projectData';
import { CostCard } from '../v3/CostCard';
import { TotalSummary } from '../v3/TotalSummary';
import { VisualViewer } from './VisualViewer';
import { ClientCostSection } from '../v5/ClientCostSection';
import { CostItem, Room, ConstructionPhase } from '../../types';
import { cn } from '../../lib/utils';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useProjectData } from '@/hooks/useProjectData';
import { logger } from '@/lib/logger';

interface SplitLayoutProps {
    projectId?: string;
}

export function SplitLayout({ projectId }: SplitLayoutProps) {
    const { t } = useTranslation();
    
    // --- Business Logic (Hook) ---
    const {
        items,
        totalCost,
        updateItem,
        addItem,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems 
    } = useProjectData(projectId);    
    // --- UI State ---
    const [highlightedItem, setHighlightedItem] = useState<CostItem | null>(null);
    const [viewMode, setViewMode] = useState<'phases' | 'rooms'>('phases');
    
    // State for the "Add New Item" modal
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemData, setNewItemData] = useState<Partial<CostItem>>({
        elementName: '',
        unitPrice: 0,
        quantity: 1,
        unit: 'st',
        phase: 'structure'
    });

    // --- Action Wrappers ---
    const onAddItem = () => {
        addItem(newItemData);
        setIsAddingItem(false);
        setNewItemData({ elementName: '', unitPrice: 0, quantity: 1, unit: 'st', phase: 'structure' });
    };

    // --- Constants ---
    const phases = [
        { id: 'ground', label: t('phase.ground') },
        { id: 'structure', label: t('phase.structure') },
        { id: 'electrical', label: t('phase.electrical') },
        { id: 'plumbing', label: t('phase.plumbing') },
        { id: 'interior', label: t('phase.interior') },
    ];

    const otherItems = items.filter(i => !phases.some(p => p.id === i.phase));

    return (
        <div className="flex h-screen bg-slate-50 relative select-none">
            {/* Left Pane - Visual Viewer (Static 50%) */}
            <div className="w-1/2 h-full overflow-hidden border-r border-slate-200 bg-slate-900 relative">
                <VisualViewer highlightedItem={highlightedItem ? { ...highlightedItem, name: highlightedItem.elementName } : null} />

                {/* Floating Cost Overlay */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('qto.total_estimate')}</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCost.toLocaleString('sv-SE')} kr</p>
                    <p className="text-xs text-slate-400 mt-1">{(totalCost / (projectDetails.totalArea || 1)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr/m²</p>
                </div>
            </div>

            {/* Right Pane: Data Feed (Static 50%) */}
            <div className="w-1/2 h-full overflow-y-auto bg-white">
                <div className="max-w-2xl mx-auto p-8 pb-32">
                    <header className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{t('qto.beta')}</span>
                            <span>•</span>
                            <span>{projectDetails.id}</span>
                            <span>•</span>
                            <span>{projectDetails.lastModified}</span>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{projectDetails.name}</h1>

                            {/* View Mode Toggle */}
                            <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
                                <button
                                    onClick={() => setViewMode('phases')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'phases' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                                >
                                    {t('qto.view_phases')}
                                </button>
                                <button
                                    onClick={() => setViewMode('rooms')}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'rooms' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                                >
                                    {t('qto.view_rooms')}
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-500 text-lg">{projectDetails.address} • {projectDetails.totalArea} m²</p>
                    </header>

                    <ClientCostSection />

                    {/* Render List based on View Mode */}
                    {viewMode === 'phases' ? (
                        <div className="space-y-8">
                            {phases.map(phase => {
                                const phaseItems = getItemsByPhase(phase.id);
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
                                                        onUpdate={(updates) => updateItem(item.id, updates)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Catch-all for custom items */}
                            {otherItems.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h2 className="text-xl font-bold text-slate-900">{t('qto.other_custom')}</h2>
                                        <span className="text-sm font-mono text-slate-500">
                                            {otherItems.reduce((sum, i) => sum + i.totalCost, 0).toLocaleString('sv-SE')} kr
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {otherItems.map(item => (
                                            <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                <CostCard
                                                    item={item}
                                                    onUpdate={(updates) => updateItem(item.id, updates)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {rooms.map((room: Room) => {
                                const roomItems = getItemsByRoom(room.id);
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
                                                        onUpdate={(updates) => updateItem(item.id, updates)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {getUnassignedItems().length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-8">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900">{t('qto.general_unassigned')}</h3>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {getUnassignedItems().map(item => (
                                            <div key={item.id} onMouseEnter={() => setHighlightedItem(item)} onMouseLeave={() => setHighlightedItem(null)}>
                                                <CostCard
                                                    item={item}
                                                    onUpdate={(updates) => updateItem(item.id, updates)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Item Form */}
                    <div className="mt-12 border-t border-slate-200 pt-8">
                        {!isAddingItem ? (
                            <button
                                onClick={() => setIsAddingItem(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>{t('qto.add_custom_item')}</span>
                            </button>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                <h3 className="font-bold text-slate-900">{t('qto.add_new_item')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.item_name')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Extra Insulation"
                                            value={newItemData.elementName}
                                            onChange={e => setNewItemData({ ...newItemData, elementName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.price')}</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.unitPrice}
                                            onChange={e => setNewItemData({ ...newItemData, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.quantity')}</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.quantity}
                                            onChange={e => setNewItemData({ ...newItemData, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.phase')}</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newItemData.phase}
                                            onChange={e => setNewItemData({ ...newItemData, phase: e.target.value as ConstructionPhase })}
                                        >
                                            {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={onAddItem}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        {t('qto.btn_add')}
                                    </button>
                                    <button
                                        onClick={() => setIsAddingItem(false)}
                                        className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                                    >
                                        {t('qto.btn_cancel')}
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