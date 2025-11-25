import React, { useState, useMemo } from 'react';
import { CostItem } from '@/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ClientCostSection } from './ClientCostSection';
import { ContractScope } from './ContractScope';
import { PhaseSection } from './PhaseSection';
import { TotalSummary } from './TotalSummary';
import { AddItemForm } from './AddItemForm';
import { useProjectContext } from '@/contexts/ProjectDataContext';

// Extract room name from item elementName (e.g., "Flooring - SOVRUM 1" → "SOVRUM 1")
function extractRoomFromItem(item: CostItem): string | null {
    const name = item.elementName || '';

    // Pattern: "Something - ROOM NAME" or "Something (ROOM NAME)"
    const dashMatch = name.match(/\s*-\s*([A-ZÅÄÖ][A-ZÅÄÖ0-9\s/]+)$/i);
    if (dashMatch) return dashMatch[1].trim().toUpperCase();

    const parenMatch = name.match(/\(([A-ZÅÄÖ][A-ZÅÄÖ0-9\s/]+)\)$/i);
    if (parenMatch) return parenMatch[1].trim().toUpperCase();

    return null;
}

// Group items by detected room names
function groupItemsByRoom(items: CostItem[]): Map<string, CostItem[]> {
    const groups = new Map<string, CostItem[]>();

    for (const item of items) {
        const roomName = extractRoomFromItem(item);
        const key = roomName || 'GENERAL';

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    }

    return groups;
}

export function ProjectDataFeed() {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'phases' | 'rooms'>('phases');
    
    const {
        project,
        items,
        totalCost,
        totalArea,
        updateItem,
        addItem,
        setHighlightedItem,
        setInspectingItem,
        getItemsByPhase,
        getItemsByRoom,
        getUnassignedItems
    } = useProjectContext();

    const phases = [
        { id: 'ground', label: t('phase.ground') },
        { id: 'structure', label: t('phase.structure') },
        { id: 'electrical', label: t('phase.electrical') },
        { id: 'plumbing', label: t('phase.plumbing') },
        { id: 'interior', label: t('phase.interior') },
        { id: 'completion', label: t('phase.completion') },
    ];

    const otherItems = items.filter(i => !phases.some(p => p.id === i.phase));

    // Group items by room (extracted from item names)
    const roomGroups = useMemo(() => groupItemsByRoom(items), [items]);

    if (!project) {
        return <div className="p-8 text-center text-slate-500">Loading project...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-white">
            <div className="w-full p-8 pb-32">
                {/* Header - Clean & Simple */}
                <header className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{project.name}</h1>
                            <p className="text-slate-500">{project.location} • {totalArea || 0} m²</p>
                        </div>

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
                </header>
                
                                    <ClientCostSection onInspectItem={setInspectingItem} />
                                
                                    <ContractScope totalCost={totalCost} />
                                {/* Content List */}
                {viewMode === 'phases' ? (
                    <div className="space-y-6">
                        {phases.map(phase => {
                            const phaseItems = getItemsByPhase(phase.id);
                            if (phaseItems.length === 0) return null;
                            const phaseTotal = phaseItems.reduce((sum, i) => sum + i.totalCost, 0);

                            return (
                                <PhaseSection
                                    key={phase.id}
                                    title={phase.label}
                                    totalCost={phaseTotal}
                                    items={phaseItems}
                                    onUpdateItem={updateItem}
                                    onHoverItem={setHighlightedItem}
                                    onInspectItem={setInspectingItem}
                                />
                            );
                        })}

                        {otherItems.length > 0 && (
                            <PhaseSection
                                title={t('qto.other_custom')}
                                totalCost={otherItems.reduce((sum, i) => sum + i.totalCost, 0)}
                                items={otherItems}
                                onUpdateItem={updateItem}
                                onHoverItem={setHighlightedItem}
                                onInspectItem={setInspectingItem}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Render room groups extracted from item names */}
                        {Array.from(roomGroups.entries())
                            .filter(([key]) => key !== 'GENERAL')  // Show specific rooms first
                            .sort(([a], [b]) => a.localeCompare(b, 'sv'))  // Sort alphabetically
                            .map(([roomName, roomItems]) => {
                                const roomTotal = roomItems.reduce((sum, i) => sum + i.totalCost, 0);
                                return (
                                    <PhaseSection
                                        key={roomName}
                                        title={roomName}
                                        totalCost={roomTotal}
                                        items={roomItems}
                                        onUpdateItem={updateItem}
                                        onHoverItem={setHighlightedItem}
                                        onInspectItem={setInspectingItem}
                                    />
                                );
                            })}

                        {/* Show general/unassigned items last */}
                        {roomGroups.has('GENERAL') && roomGroups.get('GENERAL')!.length > 0 && (
                            <PhaseSection
                                title={t('qto.general_unassigned')}
                                totalCost={roomGroups.get('GENERAL')!.reduce((sum, i) => sum + i.totalCost, 0)}
                                items={roomGroups.get('GENERAL')!}
                                onUpdateItem={updateItem}
                                onHoverItem={setHighlightedItem}
                                onInspectItem={setInspectingItem}
                            />
                        )}
                    </div>
                )}

                {/* Add Item Form */}
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <AddItemForm onAdd={addItem} phases={phases} />
                </div>

                <div className="mt-12">
                    <TotalSummary totalCost={totalCost} area={totalArea || 0} />
                </div>
            </div>
        </div>
    );
}
