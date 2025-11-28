'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Loader2, BookOpen, AlertCircle, RefreshCw,
    Calculator, Ruler, FileText, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, Scale, Factory, TrendingDown,
    Zap, Target, Hammer, ArrowRight, ExternalLink, Calendar, Info
} from 'lucide-react';
import { CostItem, PriceSource } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';
import { getItemRegulations, REGULATION_COLORS } from '@/data/regulationMapping';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface CostInspectorProps {
    item: CostItem | null;
    onClose: () => void;
    context?: {
        room?: string;
        dimensions?: string;
        boa?: number;
        biarea?: number;
        totalArea?: number;
    };
}

interface NarrativeResponse {
    narrative: string;
    keyRegulations?: string[];
    materials?: string[];
    calculationSteps?: string[];
    assumptions?: string[];
}

// Cache for narratives (24-hour TTL)
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCacheKey(itemId: string, language: string): string {
    return `kgvilla_narrative_${itemId}_${language}`;
}

function getCachedNarrative(itemId: string, language: string): NarrativeResponse | null {
    try {
        const cached = localStorage.getItem(getCacheKey(itemId, language));
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
            localStorage.removeItem(getCacheKey(itemId, language));
        }
    } catch (e) {
        logger.warn('CostInspector', 'Cache read error', e);
    }
    return null;
}

function setCachedNarrative(itemId: string, language: string, data: NarrativeResponse): void {
    try {
        localStorage.setItem(getCacheKey(itemId, language), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        logger.warn('CostInspector', 'Cache write error', e);
    }
}

// Section component for collapsible sections with step numbering
function Section({
    step,
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    color = 'slate'
}: {
    step?: number;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    color?: 'slate' | 'blue' | 'green' | 'amber' | 'purple' | 'red';
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colorClasses = {
        slate: 'bg-slate-50 border-slate-200 text-slate-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
        red: 'bg-red-50 border-red-200 text-red-700',
    };

    const stepColors = {
        slate: 'bg-slate-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        amber: 'bg-amber-600',
        purple: 'bg-purple-600',
        red: 'bg-red-600',
    };

    return (
        <div className={cn("rounded-xl border overflow-hidden", colorClasses[color])}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {step && (
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold", stepColors[color])}>
                            {step}
                        </div>
                    )}
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-1 bg-white/50">
                    {children}
                </div>
            )}
        </div>
    );
}

export function CostInspector({ item, onClose, context = {} }: CostInspectorProps) {
    const { t, language } = useTranslation();
    const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [displayedItem, setDisplayedItem] = useState<CostItem | null>(null);

    // Track component mount
    useEffect(() => {
        logger.trackMount('CostInspector');
        return () => logger.trackUnmount('CostInspector');
    }, []);

    // Handle open/close animations
    useEffect(() => {
        if (item) {
            logger.info('CostInspector', 'Opening inspector', {
                itemId: item.id,
                elementName: item.elementName
            });
            setDisplayedItem(item);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setDisplayedItem(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [item]);

    // Get regulations for this item from our mapping
    const itemRegulations = displayedItem ? getItemRegulations(displayedItem) : [];

    const fetchNarrative = useCallback(async (forceRefresh = false) => {
        if (!item) return;

        if (!forceRefresh) {
            const cached = getCachedNarrative(item.id, language);
            if (cached) {
                setNarrative(cached);
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post<NarrativeResponse>('/explain', {
                item,
                context: {
                    room: item.roomId || context.room || 'Unknown room',
                    dimensions: context.dimensions || 'Not specified',
                    boa: context.boa || 0,
                    biarea: context.biarea || 0,
                    totalArea: context.totalArea || 0
                },
                language: language
            });

            setNarrative(response);
            setCachedNarrative(item.id, language, response);
        } catch (e) {
            logger.error('CostInspector', 'Failed to fetch narrative', e);
            setError(language === 'sv'
                ? 'Kunde inte generera AI-förklaring. Visar tillgänglig data.'
                : 'Unable to generate AI explanation. Showing available data.');
        } finally {
            setIsLoading(false);
        }
    }, [item, context, language]);

    useEffect(() => {
        if (item) {
            fetchNarrative();
        } else {
            setNarrative(null);
            setError(null);
        }
    }, [item, fetchNarrative]);

    if (!displayedItem) return null;

    // Parse markdown bold syntax to JSX
    const renderText = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.includes('\n')) {
                return part.split('\n').map((line, j) => (
                    <React.Fragment key={`${i}-${j}`}>
                        {j > 0 && <br />}
                        {line}
                    </React.Fragment>
                ));
            }
            return part;
        });
    };

    // Get efficiency type info
    const getEfficiencyInfo = () => {
        if (!displayedItem.prefabDiscount) return null;
        const effType = displayedItem.prefabDiscount.efficiencyType || 'PREFAB';
        return {
            type: effType,
            icon: effType === 'STREAMLINED' ? Zap : effType === 'STANDARDIZED' ? Target : Factory,
            color: effType === 'STREAMLINED' ? 'blue' : effType === 'STANDARDIZED' ? 'purple' : 'green',
        };
    };

    const efficiencyInfo = getEfficiencyInfo();

    return (
        <div
            className={cn(
                "fixed top-0 right-0 h-full w-[520px] bg-white z-[60] flex flex-col shadow-2xl border-l border-slate-200 transition-transform duration-300 ease-out",
                isVisible ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Header - Clean and focused on item name */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{t('inspector.cost_analysis')}</h2>
                        <p className="text-xs text-slate-400">{t('inspector.step_by_step')}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close Inspector"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Item Name Banner */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">{displayedItem.elementName}</h3>
                {displayedItem.description && (
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{displayedItem.description}</p>
                )}
            </div>

            {/* Content - Scrollable - NEW LOGICAL FLOW */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* STEP 1: REGULATORY BASIS - Why this item exists */}
                {itemRegulations.length > 0 && (
                    <Section step={1} title={t('inspector.why_required')} icon={Scale} color="green">
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 mb-3">
                                {t('inspector.reg_intro')}
                            </p>
                            {itemRegulations.map((reg, i) => {
                                const colors = REGULATION_COLORS[reg.id] || { bgColor: 'bg-slate-100', color: 'text-slate-700' };
                                return (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-start gap-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-bold whitespace-nowrap",
                                                colors.bgColor, colors.color
                                            )}>
                                                {reg.name}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                {reg.section && (
                                                    <p className="text-xs font-mono text-slate-500 mb-1">
                                                        {t('inspector.section')} {reg.section}
                                                    </p>
                                                )}
                                                {reg.requirement && (
                                                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                                                        {reg.requirement}
                                                    </p>
                                                )}
                                                {reg.regulationDetail && (
                                                    <p className="text-sm text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                                                        {reg.regulationDetail}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {/* STEP 2: CONSTRUCTION SPECIFICATION - How it should be built */}
                {(displayedItem.guidelineReference || itemRegulations.some(reg => reg.specificationDetail)) && (
                    <Section step={2} title={t('inspector.how_built')} icon={Hammer} color="amber">
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 mb-2">
                                {t('inspector.spec_intro')}
                            </p>

                            {/* Specification details from regulations */}
                            {itemRegulations.filter(reg => reg.specificationDetail).map((reg, i) => {
                                const colors = REGULATION_COLORS[reg.id] || { bgColor: 'bg-slate-100', color: 'text-slate-700' };
                                return (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs font-bold",
                                                colors.bgColor, colors.color
                                            )}>
                                                {reg.name}
                                            </span>
                                            {reg.section && (
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {reg.section}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {reg.specificationDetail}
                                        </p>
                                    </div>
                                );
                            })}

                            {/* Guideline reference if available */}
                            {displayedItem.guidelineReference && (
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-xs font-medium text-amber-700 uppercase mb-1">{t('inspector.reference_standard')}</p>
                                    <p className="text-sm text-slate-700">{displayedItem.guidelineReference}</p>
                                </div>
                            )}

                            {/* Materials breakdown if available */}
                            {displayedItem.breakdown?.components && displayedItem.breakdown.components.length > 0 && (
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-xs font-medium text-amber-700 uppercase mb-2">{t('inspector.materials_required')}</p>
                                    <ul className="space-y-1.5">
                                        {displayedItem.breakdown.components.map((comp, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                                {comp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* STEP 3: QUANTITY CALCULATION - Detailed step-by-step math */}
                <Section step={itemRegulations.length > 0 ? ((displayedItem.guidelineReference || itemRegulations.some(reg => reg.specificationDetail)) ? 3 : 2) : 1} title={t('inspector.quantity_calc')} icon={Ruler} color="blue">
                    <div className="space-y-3">
                        <p className="text-sm text-slate-600 mb-2">
                            {t('inspector.calc_intro')}
                        </p>

                        {/* Quantity Breakdown - Shows individual components */}
                        {displayedItem.quantityBreakdown && displayedItem.quantityBreakdown.items.length > 0 && (
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-xs font-medium text-blue-700 uppercase mb-2">
                                    {t('inspector.from_floor_plan')}
                                </p>

                                {/* Calculation method explanation */}
                                {displayedItem.quantityBreakdown.calculationMethod && (
                                    <p className="text-sm text-slate-600 mb-3 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                        {displayedItem.quantityBreakdown.calculationMethod}
                                    </p>
                                )}

                                {/* Individual items */}
                                <div className="space-y-2">
                                    {displayedItem.quantityBreakdown.items.map((breakdownItem, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                                            <span className="text-slate-700">
                                                {breakdownItem.name}
                                                {breakdownItem.category && (
                                                    <span className="ml-1 text-xs text-slate-400">
                                                        ({breakdownItem.category})
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-mono text-slate-900 font-medium">
                                                {breakdownItem.value.toFixed(1)} {breakdownItem.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Sum */}
                                <div className="mt-3 pt-2 border-t-2 border-blue-200 flex justify-between text-sm">
                                    <span className="font-medium text-blue-800">{t('qto.total')}</span>
                                    <span className="font-mono font-bold text-blue-900">
                                        {displayedItem.quantityBreakdown.total.toFixed(1)} {displayedItem.quantityBreakdown.unit}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Calculation logic if available */}
                        {displayedItem.calculationLogic && (
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-xs font-medium text-blue-700 uppercase mb-2">{t('inspector.calculation_method')}</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{displayedItem.calculationLogic}</p>
                            </div>
                        )}

                        {/* Final result */}
                        <div className="p-4 bg-blue-100 rounded-xl border border-blue-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-700 uppercase">{t('inspector.final_quantity')}</p>
                                    <p className="text-2xl font-mono font-bold text-blue-900">
                                        {(Math.round(Number(displayedItem.quantity) * 10) / 10).toFixed(1)} {displayedItem.unit}
                                    </p>
                                </div>
                                <ArrowRight className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* STEP 4: PRICING - Market rate, JB rate, and final cost */}
                <Section
                    step={itemRegulations.length > 0 ? ((displayedItem.guidelineReference || itemRegulations.some(reg => reg.specificationDetail)) ? 4 : 3) : 2}
                    title={t('inspector.pricing')}
                    icon={Calculator}
                    color={displayedItem.prefabDiscount ? (efficiencyInfo?.color as 'green' | 'blue' | 'purple') || 'green' : 'slate'}
                >
                    <div className="space-y-4">

                        {/* If no efficiency, show simple price breakdown */}
                        {!displayedItem.prefabDiscount && (
                            <>
                                <p className="text-sm text-slate-600 mb-2">
                                    {t('inspector.price_intro')}
                                </p>

                                {/* Price per unit */}
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">{t('inspector.unit_price')}</span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {Math.round(displayedItem.unitPrice).toLocaleString('sv-SE')} kr/{displayedItem.unit}
                                        </span>
                                    </div>
                                </div>

                                {/* Price Source - Verifiability */}
                                {displayedItem.priceSource && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="h-4 w-4 text-slate-500" />
                                            <span className="text-xs font-medium text-slate-600 uppercase">{t('inspector.price_source')}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 font-medium">{displayedItem.priceSource.sourceName}</span>
                                                {displayedItem.priceSource.sourceUrl && (
                                                    <a
                                                        href={displayedItem.priceSource.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        {t('inspector.view_source')}
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{t('inspector.verified')}: {displayedItem.priceSource.verificationDate}</span>
                                                </div>
                                                {displayedItem.priceSource.marketRangeLow && displayedItem.priceSource.marketRangeHigh && (
                                                    <span className="font-mono">
                                                        {t('inspector.market_range')}: {displayedItem.priceSource.marketRangeLow.toLocaleString('sv-SE')}-{displayedItem.priceSource.marketRangeHigh.toLocaleString('sv-SE')} kr
                                                    </span>
                                                )}
                                            </div>
                                            {displayedItem.priceSource.notes && (
                                                <p className="text-xs text-slate-500 italic">{displayedItem.priceSource.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Material/Labor split if available */}
                                {displayedItem.breakdown && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <p className="text-xs text-slate-500 uppercase font-medium mb-1">{t('inspector.materials')}</p>
                                            <p className="text-lg font-mono font-bold text-slate-900">
                                                {Math.round(displayedItem.breakdown.material || displayedItem.totalCost * 0.6).toLocaleString('sv-SE')} kr
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <p className="text-xs text-slate-500 uppercase font-medium mb-1">{t('inspector.labor')}</p>
                                            <p className="text-lg font-mono font-bold text-slate-900">
                                                {Math.round(displayedItem.breakdown.labor || displayedItem.totalCost * 0.4).toLocaleString('sv-SE')} kr
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* If has efficiency, show comparison */}
                        {displayedItem.prefabDiscount && efficiencyInfo && (
                            <>
                                <p className="text-sm text-slate-600 mb-2">
                                    {t('inspector.efficiency_intro')}
                                </p>

                                {/* Efficiency badge */}
                                <div className={cn(
                                    "p-3 rounded-lg border flex items-center gap-3",
                                    efficiencyInfo.color === 'green' ? "bg-green-50 border-green-200" :
                                    efficiencyInfo.color === 'blue' ? "bg-blue-50 border-blue-200" :
                                    "bg-purple-50 border-purple-200"
                                )}>
                                    <efficiencyInfo.icon className={cn(
                                        "h-5 w-5",
                                        efficiencyInfo.color === 'green' ? "text-green-600" :
                                        efficiencyInfo.color === 'blue' ? "text-blue-600" :
                                        "text-purple-600"
                                    )} />
                                    <div>
                                        <p className={cn(
                                            "text-xs font-bold uppercase",
                                            efficiencyInfo.color === 'green' ? "text-green-700" :
                                            efficiencyInfo.color === 'blue' ? "text-blue-700" :
                                            "text-purple-700"
                                        )}>
                                            {efficiencyInfo.type === 'PREFAB' ? t('prefab.title') :
                                             efficiencyInfo.type === 'STREAMLINED' ? t('prefab.streamlined_title') :
                                             t('prefab.standardized_title')}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {displayedItem.prefabDiscount.reason}
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed explanation */}
                                {displayedItem.prefabDiscount.explanation && (
                                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                                        <p className="text-xs font-medium text-slate-500 uppercase mb-2">{t('inspector.why_savings')}</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {displayedItem.prefabDiscount.explanation}
                                        </p>
                                    </div>
                                )}

                                {/* Price Comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-xs text-red-600 uppercase font-medium mb-1">{t('prefab.general_contractor')}</p>
                                        <p className="text-lg font-mono font-bold text-red-700 line-through">
                                            {Math.round(displayedItem.prefabDiscount.generalContractorPrice).toLocaleString('sv-SE')} kr
                                        </p>
                                        <p className="text-[10px] text-red-500 mt-0.5">{t('prefab.market_rate')}</p>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-lg border",
                                        efficiencyInfo.color === 'green' ? "bg-green-100 border-green-300" :
                                        efficiencyInfo.color === 'blue' ? "bg-blue-100 border-blue-300" :
                                        "bg-purple-100 border-purple-300"
                                    )}>
                                        <p className={cn(
                                            "text-xs uppercase font-medium mb-1",
                                            efficiencyInfo.color === 'green' ? "text-green-700" :
                                            efficiencyInfo.color === 'blue' ? "text-blue-700" :
                                            "text-purple-700"
                                        )}>{t('prefab.jb_price')}</p>
                                        <p className={cn(
                                            "text-lg font-mono font-bold",
                                            efficiencyInfo.color === 'green' ? "text-green-800" :
                                            efficiencyInfo.color === 'blue' ? "text-blue-800" :
                                            "text-purple-800"
                                        )}>
                                            {Math.round(displayedItem.prefabDiscount.jbVillanPrice).toLocaleString('sv-SE')} kr
                                        </p>
                                        <p className={cn(
                                            "text-[10px] mt-0.5",
                                            efficiencyInfo.color === 'green' ? "text-green-600" :
                                            efficiencyInfo.color === 'blue' ? "text-blue-600" :
                                            "text-purple-600"
                                        )}>{t('prefab.factory_optimized')}</p>
                                    </div>
                                </div>

                                {/* Savings Highlight */}
                                <div className={cn(
                                    "p-4 rounded-xl border",
                                    efficiencyInfo.color === 'green' ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300" :
                                    efficiencyInfo.color === 'blue' ? "bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300" :
                                    "bg-gradient-to-r from-purple-100 to-violet-100 border-purple-300"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                efficiencyInfo.color === 'green' ? "bg-green-200" :
                                                efficiencyInfo.color === 'blue' ? "bg-blue-200" :
                                                "bg-purple-200"
                                            )}>
                                                <TrendingDown className={cn(
                                                    "h-5 w-5",
                                                    efficiencyInfo.color === 'green' ? "text-green-700" :
                                                    efficiencyInfo.color === 'blue' ? "text-blue-700" :
                                                    "text-purple-700"
                                                )} />
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-xs font-medium uppercase",
                                                    efficiencyInfo.color === 'green' ? "text-green-700" :
                                                    efficiencyInfo.color === 'blue' ? "text-blue-700" :
                                                    "text-purple-700"
                                                )}>{t('prefab.your_savings')}</p>
                                                <p className={cn(
                                                    "text-2xl font-mono font-bold",
                                                    efficiencyInfo.color === 'green' ? "text-green-800" :
                                                    efficiencyInfo.color === 'blue' ? "text-blue-800" :
                                                    "text-purple-800"
                                                )}>
                                                    {Math.round(displayedItem.prefabDiscount.savingsAmount).toLocaleString('sv-SE')} kr
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1.5 text-white text-lg font-bold rounded-full",
                                            efficiencyInfo.color === 'green' ? "bg-green-700" :
                                            efficiencyInfo.color === 'blue' ? "bg-blue-700" :
                                            "bg-purple-700"
                                        )}>
                                            -{displayedItem.prefabDiscount.savingsPercent}%
                                        </div>
                                    </div>
                                </div>

                                {/* Price Source - Verifiability (for prefab items) */}
                                {displayedItem.priceSource && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="h-4 w-4 text-slate-500" />
                                            <span className="text-xs font-medium text-slate-600 uppercase">{t('inspector.price_source')}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 font-medium">{displayedItem.priceSource.sourceName}</span>
                                                {displayedItem.priceSource.sourceUrl && (
                                                    <a
                                                        href={displayedItem.priceSource.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        {t('inspector.view_source')}
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{t('inspector.verified')}: {displayedItem.priceSource.verificationDate}</span>
                                                </div>
                                                {displayedItem.priceSource.marketRangeLow && displayedItem.priceSource.marketRangeHigh && (
                                                    <span className="font-mono">
                                                        {t('inspector.market_range')}: {displayedItem.priceSource.marketRangeLow.toLocaleString('sv-SE')}-{displayedItem.priceSource.marketRangeHigh.toLocaleString('sv-SE')} kr
                                                    </span>
                                                )}
                                            </div>
                                            {displayedItem.priceSource.notes && (
                                                <p className="text-xs text-slate-500 italic">{displayedItem.priceSource.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Final Cost */}
                        <div className="p-4 bg-slate-900 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">{t('inspector.final_cost')}</p>
                                    <p className="text-3xl font-mono font-bold">
                                        {Math.round(displayedItem.totalCost).toLocaleString('sv-SE')} kr
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">
                                        {(Math.round(Number(displayedItem.quantity) * 10) / 10).toFixed(1)} {displayedItem.unit} × {Math.round(displayedItem.unitPrice).toLocaleString('sv-SE')} kr
                                    </p>
                                    {displayedItem.confidenceScore && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {t('inspector.confidence')} {Math.round(displayedItem.confidenceScore * 100)}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* AI Explanation Section (Optional - for additional context) */}
                {isLoading && (
                    <Section title={t('inspector.ai_analysis')} icon={Lightbulb} color="purple">
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <p className="text-sm">{t('inspector.generating')}</p>
                        </div>
                    </Section>
                )}

                {narrative && !isLoading && (
                    <Section title={t('inspector.additional_context')} icon={Lightbulb} color="purple" defaultOpen={false}>
                        <div className="space-y-4">
                            <div className="text-sm text-slate-700 leading-relaxed">
                                {renderText(narrative.narrative)}
                            </div>

                            {narrative.assumptions && narrative.assumptions.length > 0 && (
                                <div className="mt-3 p-3 bg-purple-100/50 rounded-lg">
                                    <p className="text-xs font-medium text-purple-800 mb-2">{t('inspector.assumptions')}</p>
                                    <ul className="space-y-1">
                                        {narrative.assumptions.map((assumption, i) => (
                                            <li key={i} className="text-xs text-purple-700 flex items-start gap-2">
                                                <span className="text-purple-400">•</span>
                                                {assumption}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {error && !isLoading && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-700">{t('inspector.error_ai')}</p>
                                <button
                                    onClick={() => fetchNarrative(true)}
                                    className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    {t('inspector.retry')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Regenerate Button */}
                <button
                    onClick={() => fetchNarrative(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    {t('inspector.regenerate')}
                </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span>{t('inspector.based_on')}</span>
                    </div>
                    <span className="font-mono">{itemRegulations.length} {t('common.regulations')}</span>
                </div>
            </div>
        </div>
    );
}
