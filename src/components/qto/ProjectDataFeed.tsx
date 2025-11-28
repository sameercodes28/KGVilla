import React, { useMemo } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { ClientCostSection } from './ClientCostSection';
import { PhaseSection } from './PhaseSection';
import { TotalSummary } from './TotalSummary';
import { AddItemForm } from './AddItemForm';
import { useProjectContext } from '@/contexts/ProjectDataContext';
import { TrendingUp } from 'lucide-react';

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

    // Calculate total savings from prefab efficiency
    const prefabSavings = useMemo(() => {
        return items.reduce((total, item) => {
            if (item.prefabDiscount) {
                return total + item.prefabDiscount.savingsAmount;
            }
            return total;
        }, 0);
    }, [items]);

    // Calculate what a general contractor would charge
    const generalContractorTotal = useMemo(() => {
        return items.reduce((total, item) => {
            if (item.prefabDiscount) {
                return total + item.prefabDiscount.generalContractorPrice;
            }
            return total + item.totalCost;
        }, 0);
    }, [items]);

    if (!project) {
        return <div className="p-8 text-center text-slate-500">{t('common.loading_project')}</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-white">
            <div className="w-full p-8 pb-32">
                {/* Header - Clean & Simple */}
                <header className="mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{project.name}</h1>
                        <p className="text-slate-500">
                            {(boa > 0 || biarea > 0) ? (
                                <span>
                                    <span className="font-medium text-slate-700">{boa || 0} m²</span>
                                    <span className="text-slate-400"> BOA</span>
                                    {biarea > 0 && (
                                        <span>
                                            {' + '}<span className="font-medium text-slate-600">{biarea} m²</span>
                                            <span className="text-slate-400"> Biarea</span>
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span>{totalArea || 0} m²</span>
                            )}
                            {' • '}<span className="font-medium text-slate-700">{items.length} Items</span>
                            {' • '}<span className="font-medium text-slate-700">
                                {(boa || totalArea) > 0 ? Math.round(totalCost / (boa || totalArea)).toLocaleString('sv-SE') : '—'} kr/m²
                            </span>
                        </p>
                    </div>
                </header>

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

                {/* Contractor Total (JB Villan price) */}
                <div className="mt-12">
                    <TotalSummary totalCost={totalCost} area={totalArea || 0} boa={boa} biarea={biarea} />
                </div>

                {/* General Contractor Comparison */}
                {prefabSavings > 0 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-green-800">{t('prefab.advantage_title')}</h4>
                                <p className="text-sm text-green-700 mt-1">
                                    {t('prefab.contractor_charge')}{' '}
                                    <span className="font-bold font-mono">{Math.round(generalContractorTotal).toLocaleString('sv-SE')} kr</span>{' '}
                                    {t('prefab.for_this_build')}
                                </p>
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="text-sm">
                                        <span className="text-green-600">{t('prefab.you_save')}</span>{' '}
                                        <span className="font-bold font-mono text-green-700">
                                            {Math.round(prefabSavings).toLocaleString('sv-SE')} kr
                                        </span>
                                    </div>
                                    <div className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full font-semibold">
                                        {Math.round((prefabSavings / generalContractorTotal) * 100)}% {t('prefab.savings_percent')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Client Costs Section - MOVED TO BOTTOM */}
                <div className="mt-12">
                    <ClientCostSection onInspectItem={setInspectingItem} />
                </div>
            </div>
        </div>
    );
}
