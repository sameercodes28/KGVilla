import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { ClientCostSection } from './ClientCostSection';
import { ContractScope } from './ContractScope';
import { PhaseSection } from './PhaseSection';
import { TotalSummary } from './TotalSummary';
import { AddItemForm } from './AddItemForm';
import { useProjectContext } from '@/contexts/ProjectDataContext';

export function ProjectDataFeed() {
    const { t } = useTranslation();

    const {
        project,
        items,
        totalCost,
        totalArea,
        boa,
        biarea,
        updateItem,
        addItem,
        setHighlightedItem,
        setInspectingItem,
        getItemsByPhase
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
                {/* Header - Clean & Simple */}
                <header className="mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{project.name}</h1>
                        <p className="text-slate-500">
                            {project.location}
                            {(boa > 0 || biarea > 0) ? (
                                <span>
                                    {' '} • <span className="font-medium text-slate-700">{boa || 0} m²</span>
                                    <span className="text-slate-400"> BOA</span>
                                    {biarea > 0 && (
                                        <span>
                                            {' + '}<span className="font-medium text-slate-600">{biarea} m²</span>
                                            <span className="text-slate-400"> Biarea</span>
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span> • {totalArea || 0} m²</span>
                            )}
                        </p>
                    </div>
                </header>

                <ClientCostSection onInspectItem={setInspectingItem} />

                <ContractScope totalCost={totalCost} />

                {/* Phases View */}
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

                {/* Add Item Form */}
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <AddItemForm onAdd={addItem} phases={phases} />
                </div>

                <div className="mt-12">
                    <TotalSummary totalCost={totalCost} area={totalArea || 0} boa={boa} biarea={biarea} />
                </div>
            </div>
        </div>
    );
}
