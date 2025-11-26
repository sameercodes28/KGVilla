'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Loader2, BookOpen, AlertCircle, RefreshCw,
    Calculator, Ruler, FileText, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, Scale
} from 'lucide-react';
import { CostItem } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';
import { getItemRegulations, RegulationRef, REGULATION_COLORS } from '@/data/regulationMapping';
import { cn } from '@/lib/utils';

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

function getCacheKey(itemId: string): string {
    return `kgvilla_narrative_${itemId}`;
}

function getCachedNarrative(itemId: string): NarrativeResponse | null {
    try {
        const cached = localStorage.getItem(getCacheKey(itemId));
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
            localStorage.removeItem(getCacheKey(itemId));
        }
    } catch (e) {
        logger.warn('CostInspector', 'Cache read error', e);
    }
    return null;
}

function setCachedNarrative(itemId: string, data: NarrativeResponse): void {
    try {
        localStorage.setItem(getCacheKey(itemId), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        logger.warn('CostInspector', 'Cache write error', e);
    }
}

// Section component for collapsible sections
function Section({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    color = 'slate'
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    color?: 'slate' | 'blue' | 'green' | 'amber' | 'purple';
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colorClasses = {
        slate: 'bg-slate-50 border-slate-200 text-slate-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
    };

    return (
        <div className={cn("rounded-xl border overflow-hidden", colorClasses[color])}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
                <div className="flex items-center gap-2">
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
    const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get regulations for this item from our mapping
    const itemRegulations = item ? getItemRegulations(item) : [];

    const fetchNarrative = useCallback(async (forceRefresh = false) => {
        if (!item) return;

        if (!forceRefresh) {
            const cached = getCachedNarrative(item.id);
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
                }
            });

            setNarrative(response);
            setCachedNarrative(item.id, response);
        } catch (e) {
            logger.error('CostInspector', 'Failed to fetch narrative', e);
            setError('Unable to generate AI explanation. Showing available data.');
        } finally {
            setIsLoading(false);
        }
    }, [item, context]);

    useEffect(() => {
        if (item) {
            fetchNarrative();
        } else {
            setNarrative(null);
            setError(null);
        }
    }, [item, fetchNarrative]);

    if (!item) return null;

    // Generate calculation explanation from item data
    const getCalculationExplanation = () => {
        const explanations: string[] = [];

        // Use calculationLogic if available
        if (item.calculationLogic) {
            explanations.push(item.calculationLogic);
        }

        // Generate based on unit type
        const qty = Number(item.quantity).toFixed(1);
        const unit = item.unit;

        if (unit === 'm2') {
            explanations.push(`Total area calculated: ${qty} m² based on floor plan measurements`);
            if (context.boa) {
                explanations.push(`Reference: BOA (Living Area) = ${context.boa} m²`);
            }
        } else if (unit === 'm') {
            explanations.push(`Linear measurement: ${qty} m from perimeter/wall lengths on floor plan`);
        } else if (unit === 'st') {
            explanations.push(`Count: ${qty} units based on room analysis and building requirements`);
        }

        // Add breakdown formula if available
        if (item.breakdown?.formula) {
            explanations.push(`Formula: ${item.breakdown.formula}`);
        }

        return explanations;
    };

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

    const calculationSteps = getCalculationExplanation();

    return (
        <div className="fixed top-0 right-0 h-full w-[520px] bg-white z-[60] flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Cost Analysis</h2>
                        <p className="text-xs text-slate-400">Detailed calculation breakdown</p>
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

            {/* Item Summary */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.elementName}</h3>
                {item.description && (
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.description}</p>
                )}
                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-4xl font-mono font-bold text-slate-900">
                            {Math.round(item.totalCost).toLocaleString('sv-SE')}
                        </span>
                        <span className="text-lg text-slate-500 ml-1">kr</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-mono text-slate-600">
                            {(Math.round(Number(item.quantity) * 10) / 10).toFixed(1)} {item.unit} × {Math.round(item.unitPrice).toLocaleString('sv-SE')} kr
                        </div>
                        {item.confidenceScore && (
                            <div className="text-xs text-slate-400 mt-1">
                                Confidence: {Math.round(item.confidenceScore * 100)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* Quantity Calculation Section */}
                <Section title="How We Calculated the Quantity" icon={Ruler} color="blue">
                    <div className="space-y-3">
                        {calculationSteps.length > 0 ? (
                            calculationSteps.map((step, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 italic">
                                Quantity derived from AI analysis of the floor plan dimensions.
                            </p>
                        )}

                        {/* Show the actual measurement */}
                        <div className="mt-3 p-3 bg-blue-100/50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-800 uppercase">Result</span>
                                <span className="font-mono font-bold text-blue-900">
                                    {(Math.round(Number(item.quantity) * 10) / 10).toFixed(1)} {item.unit}
                                </span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Regulations Section - Always show from our mapping */}
                {itemRegulations.length > 0 && (
                    <Section title="Applicable Regulations" icon={Scale} color="green">
                        <div className="space-y-3">
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
                                                        Section: {reg.section}
                                                    </p>
                                                )}
                                                {reg.requirement && (
                                                    <p className="text-sm text-slate-700 leading-relaxed">
                                                        {reg.requirement}
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

                {/* Price Breakdown Section */}
                {item.breakdown && (
                    <Section title="Price Breakdown" icon={FileText} color="amber">
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-amber-100/50 rounded-lg">
                                    <p className="text-xs text-amber-600 uppercase font-medium mb-1">Materials</p>
                                    <p className="text-lg font-mono font-bold text-amber-900">
                                        {Math.round(item.breakdown.material).toLocaleString('sv-SE')} kr
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-100/50 rounded-lg">
                                    <p className="text-xs text-amber-600 uppercase font-medium mb-1">Labor</p>
                                    <p className="text-lg font-mono font-bold text-amber-900">
                                        {Math.round(item.breakdown.labor).toLocaleString('sv-SE')} kr
                                    </p>
                                </div>
                            </div>

                            {item.breakdown.components && item.breakdown.components.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-amber-700 font-medium mb-2">Includes:</p>
                                    <ul className="space-y-1">
                                        {item.breakdown.components.map((comp, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                                {comp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {item.breakdown.source && (
                                <p className="text-xs text-slate-400 mt-2">
                                    Price source: {item.breakdown.source}
                                </p>
                            )}
                        </div>
                    </Section>
                )}

                {/* AI Explanation Section */}
                {isLoading && (
                    <Section title="AI Analysis" icon={Lightbulb} color="purple">
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <p className="text-sm">Generating detailed analysis...</p>
                        </div>
                    </Section>
                )}

                {narrative && !isLoading && (
                    <Section title="AI Analysis" icon={Lightbulb} color="purple">
                        <div className="space-y-4">
                            <div className="text-sm text-slate-700 leading-relaxed">
                                {renderText(narrative.narrative)}
                            </div>

                            {narrative.assumptions && narrative.assumptions.length > 0 && (
                                <div className="mt-3 p-3 bg-purple-100/50 rounded-lg">
                                    <p className="text-xs font-medium text-purple-800 mb-2">Assumptions Made:</p>
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
                                <p className="text-sm text-amber-700">{error}</p>
                                <button
                                    onClick={() => fetchNarrative(true)}
                                    className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Retry AI analysis
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guideline Reference */}
                {item.guidelineReference && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Reference Standard</p>
                        <p className="text-sm text-slate-700">{item.guidelineReference}</p>
                    </div>
                )}

                {/* Regenerate Button */}
                <button
                    onClick={() => fetchNarrative(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Analysis
                </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span>Based on BBR 2025, Säker Vatten & Swedish standards</span>
                    </div>
                    <span className="font-mono">{itemRegulations.length} regulations</span>
                </div>
            </div>
        </div>
    );
}
