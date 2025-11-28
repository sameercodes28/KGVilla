'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProjectData } from '@/hooks/useProjectData';
import { useTranslation } from '@/contexts/LanguageContext';
import {
    MapPin, ShieldCheck, FileText, ArrowRight, ArrowLeft,
    ChevronDown, ChevronUp, Scale, Ruler,
    CheckCircle2, Sparkles, Download,
    Phone, Building2, Hammer, Zap, Droplets, PaintBucket,
    ClipboardCheck, EyeOff, Plus
} from 'lucide-react';
import Link from 'next/link';
import { CostItem } from '@/types';
import { getItemRegulations, RegulationRef, REGULATION_COLORS } from '@/data/regulationMapping';
import { cn } from '@/lib/utils';
import { ContractScope } from '@/components/qto/ContractScope';

// Phase order constant (moved outside component for useMemo stability)
const PHASE_ORDER = ['ground', 'structure', 'electrical', 'plumbing', 'interior', 'completion', 'admin'];

// Phase Icons mapping
const PHASE_ICONS: Record<string, React.ElementType> = {
    ground: Building2,
    structure: Hammer,
    electrical: Zap,
    plumbing: Droplets,
    interior: PaintBucket,
    completion: ClipboardCheck,
    admin: FileText,
};

// Phase Colors
const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
    ground: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700', light: 'bg-amber-50' },
    structure: { bg: 'bg-slate-600', border: 'border-slate-200', text: 'text-slate-700', light: 'bg-slate-50' },
    electrical: { bg: 'bg-yellow-500', border: 'border-yellow-200', text: 'text-yellow-700', light: 'bg-yellow-50' },
    plumbing: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', light: 'bg-blue-50' },
    interior: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-50' },
    completion: { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', light: 'bg-green-50' },
    admin: { bg: 'bg-gray-500', border: 'border-gray-200', text: 'text-gray-700', light: 'bg-gray-50' },
};

interface PhaseBreakdownProps {
    phase: {
        id: string;
        label: string;
        items: CostItem[];
        total: number;
    };
    totalCost: number;
    t: (key: string) => string;
}

function PhaseBreakdown({ phase, totalCost, t }: PhaseBreakdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const PhaseIcon = PHASE_ICONS[phase.id] || FileText;
    const colors = PHASE_COLORS[phase.id] || PHASE_COLORS.admin;
    const percentage = totalCost > 0 ? ((phase.total / totalCost) * 100).toFixed(1) : '0';

    // Get unique regulations for this phase
    const phaseRegulations = useMemo(() => {
        const regs = new Map<string, RegulationRef>();
        phase.items.forEach(item => {
            const itemRegs = getItemRegulations(item);
            itemRegs.forEach(reg => {
                if (!regs.has(reg.id)) {
                    regs.set(reg.id, reg);
                }
            });
        });
        return Array.from(regs.values());
    }, [phase.items]);

    return (
        <div className={cn(
            "bg-white rounded-2xl border overflow-hidden transition-all duration-300",
            isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md",
            colors.border
        )}>
            {/* Phase Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
                        <PhaseIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-lg font-bold text-slate-900">{phase.label}</h4>
                        <p className="text-sm text-slate-500">
                            {phase.items.length} {t('report.phase_items')} • {percentage}% {t('report.material_labor')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-slate-900">
                        {Math.round(phase.total).toLocaleString('sv-SE')} kr
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className={cn("border-t", colors.border)}>
                    {/* Phase Regulations Summary */}
                    {phaseRegulations.length > 0 && (
                        <div className={cn("px-6 py-3 flex flex-wrap gap-2", colors.light)}>
                            {phaseRegulations.slice(0, 6).map(reg => {
                                const regColors = REGULATION_COLORS[reg.id] || { bgColor: 'bg-slate-100', color: 'text-slate-700' };
                                return (
                                    <span
                                        key={reg.id}
                                        className={cn("px-2 py-1 rounded text-xs font-medium", regColors.bgColor, regColors.color)}
                                    >
                                        {reg.name}
                                    </span>
                                );
                            })}
                            {phaseRegulations.length > 6 && (
                                <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                                    +{phaseRegulations.length - 6} {t('report.more')}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Item List */}
                    <div className="divide-y divide-slate-100">
                        {phase.items.map((item, idx) => {
                            const itemRegs = getItemRegulations(item);
                            const isDisabled = item.disabled === true;
                            // Only show "Custom" if user actually changed values from originals
                            const hasCustomPrice = (
                                (item.customUnitPrice !== undefined && item.customUnitPrice !== item.unitPrice) ||
                                (item.customQuantity !== undefined && item.customQuantity !== item.quantity)
                            );

                            return (
                                <div
                                    key={item.id || idx}
                                    className={cn(
                                        "px-6 py-5 border-l-4",
                                        isDisabled ? "bg-slate-50 opacity-60 border-l-slate-300" : "border-l-transparent hover:border-l-blue-400 hover:bg-slate-50/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Item Name & Badges */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn(
                                                    "font-semibold text-base",
                                                    isDisabled ? "text-slate-400 line-through" : "text-slate-900"
                                                )}>
                                                    {item.elementName}
                                                </span>
                                                {isDisabled && (
                                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded text-xs font-medium">
                                                        {t('report.excluded_badge')}
                                                    </span>
                                                )}
                                                {hasCustomPrice && !isDisabled && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                        {t('report.modified_badge')}
                                                    </span>
                                                )}
                                                {item.isUserAdded && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                        {t('report.added_by_you')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Item Description */}
                                            {item.description && (
                                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Quantity & Price */}
                                            <p className="text-sm text-slate-400 mt-2 font-mono">
                                                {(Math.round(Number(item.quantity) * 10) / 10).toFixed(1)} {item.unit} × {Math.round(item.unitPrice).toLocaleString('sv-SE')} kr/{item.unit}
                                            </p>

                                            {/* Item Regulations with Explanations */}
                                            {itemRegs.length > 0 && (
                                                <div className="mt-3 space-y-1.5">
                                                    {itemRegs.slice(0, 3).map(reg => {
                                                        const regColors = REGULATION_COLORS[reg.id] || { bgColor: 'bg-slate-100', color: 'text-slate-700' };
                                                        return (
                                                            <div key={reg.id} className="flex items-start gap-2">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap mt-0.5",
                                                                    regColors.bgColor, regColors.color
                                                                )}>
                                                                    {reg.name}
                                                                </span>
                                                                {reg.requirement && (
                                                                    <span className="text-xs text-slate-500 leading-relaxed">
                                                                        {reg.section && <span className="font-medium">{reg.section}: </span>}
                                                                        {reg.requirement}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <span className={cn(
                                                "text-lg font-mono font-bold whitespace-nowrap",
                                                isDisabled ? "text-slate-400 line-through" : "text-slate-900"
                                            )}>
                                                {Math.round(item.totalCost).toLocaleString('sv-SE')} kr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Phase Total */}
                    <div className={cn("px-6 py-4 flex justify-between items-center", colors.light)}>
                        <span className={cn("font-semibold", colors.text)}>{phase.label} {t('report.total')}</span>
                        <span className={cn("text-xl font-mono font-bold", colors.text)}>
                            {Math.round(phase.total).toLocaleString('sv-SE')} kr
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function CustomerViewContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project') || undefined;
    const { items, totalCost, totalArea, boa, biarea, floorPlanUrl, project, isLoading } = useProjectData(projectId);
    const { t } = useTranslation();

    // Compute derived data
    const costPerSqm = totalArea && totalArea > 0 ? Math.round(totalCost / totalArea) : 0;

    // Group items by phase
    const phaseData = useMemo(() => {
        return PHASE_ORDER
            .map(phase => ({
                id: phase,
                label: t(`phase.${phase}`),
                items: items.filter(i => i.phase === phase && !i.disabled),
                total: items.filter(i => i.phase === phase && !i.disabled).reduce((sum, i) => sum + i.totalCost, 0)
            }))
            .filter(phase => phase.total > 0);
    }, [items, t]);

    // Collect all unique regulations across all items
    const allRegulations = useMemo(() => {
        const regs = new Map<string, { reg: RegulationRef; count: number }>();
        items.forEach(item => {
            const itemRegs = getItemRegulations(item);
            itemRegs.forEach(reg => {
                if (regs.has(reg.id)) {
                    regs.get(reg.id)!.count++;
                } else {
                    regs.set(reg.id, { reg, count: 1 });
                }
            });
        });
        return Array.from(regs.values()).sort((a, b) => b.count - a.count);
    }, [items]);

    // Compute decision stats
    const decisionStats = useMemo(() => {
        const excludedItems = items.filter(i => i.disabled);
        const customItems = items.filter(i => i.isUserAdded);
        // Only count as "custom pricing" if the values were actually changed from originals
        const customPricing = items.filter(i =>
            !i.isUserAdded && !i.disabled && (
                (i.customUnitPrice !== undefined && i.customUnitPrice !== i.unitPrice) ||
                (i.customQuantity !== undefined && i.customQuantity !== i.quantity)
            )
        );
        return { excludedItems, customItems, customPricing };
    }, [items]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">{t('report.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans text-slate-900">
            {/* Back Button */}
            <Link
                href={`/qto?project=${projectId || ''}`}
                className="fixed top-6 left-6 z-50 flex items-center text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur px-4 py-2 rounded-full transition-all"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{t('report.back')}</span>
            </Link>

            {/* Hero Section */}
            <div className="relative min-h-[50vh] bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/95 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

                <div className="relative z-20 text-center text-white px-6 max-w-4xl mx-auto py-20">
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                        {t('report.ready')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{project?.name || 'New Project'}</h1>
                    <div className="flex items-center justify-center text-lg text-white/70 mb-8">
                        <MapPin className="w-5 h-5 mr-2" />
                        {project?.location || 'Location'}
                    </div>
                    <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter mb-2">
                        {Math.round(totalCost).toLocaleString('sv-SE')}
                        <span className="text-2xl ml-2 text-white/60 font-sans">SEK</span>
                    </div>
                    <p className="text-white/50 text-sm uppercase tracking-widest">{t('report.turnkey')}</p>
                </div>

                {/* Curved bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-slate-50 z-20" />
            </div>

            {/* Floor Plan Section - Prominent Display */}
            {floorPlanUrl && (
                <div className="bg-white py-12">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('report.floor_plan')}</h2>
                            <p className="text-slate-500">{t('report.floor_plan_desc')}</p>
                        </div>
                        <div className="relative bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={floorPlanUrl}
                                alt="Floor Plan"
                                className="w-full h-auto max-h-[600px] object-contain"
                            />
                            {/* Area overlay */}
                            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
                                <div className="flex items-center gap-6 text-sm">
                                    {boa && boa > 0 && (
                                        <div>
                                            <span className="text-slate-500">BOA:</span>
                                            <span className="ml-2 font-mono font-bold text-slate-900">{boa} m²</span>
                                        </div>
                                    )}
                                    {biarea && biarea > 0 && (
                                        <div>
                                            <span className="text-slate-500">Biarea:</span>
                                            <span className="ml-2 font-mono font-bold text-slate-900">{biarea} m²</span>
                                        </div>
                                    )}
                                    {totalArea && totalArea > 0 && (
                                        <div>
                                            <span className="text-slate-500">{t('report.total_area')}:</span>
                                            <span className="ml-2 font-mono font-bold text-slate-900">{totalArea} m²</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics Cards */}
            <div className={cn(
                "max-w-5xl mx-auto px-6 relative z-30",
                floorPlanUrl ? "py-8" : "-mt-8"
            )}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('report.cost_per_sqm')}</div>
                        <div className="text-2xl font-mono font-bold text-slate-900">
                            {costPerSqm.toLocaleString('sv-SE')} <span className="text-sm text-slate-400">kr/m²</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('report.living_area')}</div>
                        <div className="text-2xl font-mono font-bold text-slate-900">
                            {boa || totalArea || '—'} <span className="text-sm text-slate-400">m²</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('report.regulations_count')}</div>
                        <div className="text-2xl font-mono font-bold text-slate-900">
                            {allRegulations.length} <span className="text-sm text-slate-400">{t('common.regulations')}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('report.items_count')}</div>
                        <div className="text-2xl font-mono font-bold text-slate-900">
                            {items.filter(i => !i.disabled).length} <span className="text-sm text-slate-400">{t('common.items')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value Propositions */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{t('report.warranty_title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{t('report.warranty_desc')}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{t('report.fixed_price_title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{t('report.fixed_price_desc')}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{t('report.turnkey_title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{t('report.turnkey_desc')}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Cost Breakdown */}
            <div className="bg-white py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-2">{t('report.where_money_goes')}</h2>
                        <p className="text-slate-500">{t('report.cost_breakdown')}</p>
                    </div>

                    <div className="space-y-4">
                        {phaseData.map((phase) => (
                            <PhaseBreakdown
                                key={phase.id}
                                phase={phase}
                                totalCost={totalCost}
                                t={t}
                            />
                        ))}

                        {/* Total */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6 flex justify-between items-center">
                            <span className="text-xl font-bold">{t('summary.title')}</span>
                            <span className="text-4xl font-mono font-bold">
                                {Math.round(totalCost).toLocaleString('sv-SE')} kr
                            </span>
                        </div>
                    </div>

                    {/* Contract & Payment Plan */}
                    <div className="mt-8">
                        <ContractScope totalCost={totalCost} />
                    </div>
                </div>
            </div>

            {/* Regulatory Compliance Section */}
            <div className="py-16 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                            <Scale className="w-4 h-4 mr-2" />
                            {t('report.compliance_title')}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{t('report.compliance_title')}</h2>
                        <p className="text-slate-500">{t('report.compliance_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allRegulations.slice(0, 12).map(({ reg, count }) => {
                            const colors = REGULATION_COLORS[reg.id] || { bgColor: 'bg-slate-100', color: 'text-slate-700', borderColor: 'border-slate-200' };
                            return (
                                <div
                                    key={reg.id}
                                    className={cn(
                                        "rounded-xl p-4 border transition-all hover:shadow-md",
                                        colors.bgColor,
                                        colors.borderColor
                                    )}
                                >
                                    <div className={cn("text-sm font-bold mb-1", colors.color)}>{reg.name}</div>
                                    <div className="text-xs text-slate-500">
                                        {count} {count === 1 ? t('report.item_affected') : t('report.items_affected')}
                                    </div>
                                    {reg.requirement && (
                                        <div className="text-xs text-slate-400 mt-2 line-clamp-2">{reg.requirement}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {allRegulations.length > 12 && (
                        <p className="text-center text-sm text-slate-500 mt-6">
                            + {allRegulations.length - 12} {t('report.more_regulations')}
                        </p>
                    )}
                </div>
            </div>

            {/* Your Decisions Section */}
            {(decisionStats.excludedItems.length > 0 || decisionStats.customItems.length > 0 || decisionStats.customPricing.length > 0) && (
                <div className="py-16 bg-white">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-2">{t('report.decisions_title')}</h2>
                            <p className="text-slate-500">{t('report.decisions_subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Excluded Items */}
                            {decisionStats.excludedItems.length > 0 && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <EyeOff className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{t('report.excluded_items')}</h4>
                                            <p className="text-xs text-slate-500">{decisionStats.excludedItems.length} items</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {decisionStats.excludedItems.slice(0, 5).map(item => (
                                            <li key={item.id} className="flex justify-between text-sm">
                                                <span className="text-slate-600 line-through">{item.elementName}</span>
                                                <span className="text-slate-400 font-mono">-{Math.round(item.totalCost).toLocaleString('sv-SE')} kr</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Custom Items Added */}
                            {decisionStats.customItems.length > 0 && (
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                            <Plus className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-green-900">{t('report.custom_items')}</h4>
                                            <p className="text-xs text-green-600">{decisionStats.customItems.length} items</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {decisionStats.customItems.slice(0, 5).map(item => (
                                            <li key={item.id} className="flex justify-between text-sm">
                                                <span className="text-green-800">{item.elementName}</span>
                                                <span className="text-green-700 font-mono">+{Math.round(item.totalCost).toLocaleString('sv-SE')} kr</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Custom Pricing */}
                            {decisionStats.customPricing.length > 0 && (
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                                            <Ruler className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">{t('report.custom_pricing')}</h4>
                                            <p className="text-xs text-blue-600">{decisionStats.customPricing.length} items</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {decisionStats.customPricing.slice(0, 5).map(item => (
                                            <li key={item.id} className="flex justify-between text-sm">
                                                <span className="text-blue-800">{item.elementName}</span>
                                                <span className="text-blue-700 font-mono">{Math.round(item.totalCost).toLocaleString('sv-SE')} kr</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Call to Action */}
            <div className="py-20 bg-gradient-to-b from-white to-slate-100">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">{t('report.cta_title')}</h2>
                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">{t('report.disclaimer')}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg">
                            <Download className="w-5 h-5 mr-2" />
                            {t('report.download_pdf')}
                        </button>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg">
                            <Phone className="w-5 h-5 mr-2" />
                            {t('report.contact')}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 text-white py-8">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Sparkles className="w-4 h-4" />
                            {t('report.generated')} <span className="font-bold text-white">JB Villan Kalkyl</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            {new Date().toLocaleDateString('sv-SE')} • BBR 2025 • 22 {t('report.regulations_count').toLowerCase()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomerViewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CustomerViewContent />
        </Suspense>
    );
}
