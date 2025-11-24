import React, { useState } from 'react';
import { Room } from '@/types';
import { rooms } from '@/data/projectData';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ClientCostSection } from './ClientCostSection';
import { ContractScope } from './ContractScope';
import { PhaseSection } from './PhaseSection';
import { TotalSummary } from './TotalSummary';
import { AddItemForm } from './AddItemForm';
import { useProjectContext } from '@/contexts/ProjectDataContext';

export function ProjectDataFeed() {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'phases' | 'rooms'>('phases');
    
    const { 
        project, 
        items, 
        totalCost, 
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

    if (!project) {
        return <div className="p-8 text-center text-slate-500">Loading project...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-white">
            <div className="w-full p-8 pb-32">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{t('qto.beta')}</span>
                        <span>•</span>
                        <span>{project.id}</span>
                        <span>•</span>
                        <span>{project.lastModified || 'Just now'}</span>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{project.name}</h1>

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
                    <p className="text-slate-500 text-lg">{project.location} • {project.totalArea || 0} m²</p>
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
                        {rooms.map((room: Room) => {
                            const roomItems = getItemsByRoom(room.id);
                            if (roomItems.length === 0) return null;
                            const roomTotal = roomItems.reduce((sum, i) => sum + i.totalCost, 0);

                            return (
                                <PhaseSection
                                    key={room.id}
                                    title={room.name}
                                    totalCost={roomTotal}
                                    items={roomItems}
                                    onUpdateItem={updateItem}
                                    onHoverItem={setHighlightedItem}
                                    onInspectItem={setInspectingItem}
                                />
                            );
                        })}

                        {getUnassignedItems().length > 0 && (
                            <PhaseSection
                                title={t('qto.general_unassigned')}
                                totalCost={getUnassignedItems().reduce((sum, i) => sum + i.totalCost, 0)}
                                items={getUnassignedItems()}
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
                    <TotalSummary totalCost={totalCost} area={project.totalArea || 0} />
                </div>
            </div>
        </div>
    );
}
