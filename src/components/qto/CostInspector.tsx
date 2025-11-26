'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { CostItem } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';

interface CostInspectorProps {
    item: CostItem | null;
    onClose: () => void;
    context?: {
        room?: string;
        dimensions?: string;
        boa?: number;
        biarea?: number;
    };
}

interface NarrativeResponse {
    narrative: string;
    keyRegulations?: string[];
    materials?: string[];
}

// Cache for narratives (24-hour TTL)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
            // Expired - remove it
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

export function CostInspector({ item, onClose, context = {} }: CostInspectorProps) {
    const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNarrative = useCallback(async (forceRefresh = false) => {
        if (!item) return;

        // Check cache first (unless forcing refresh)
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
                    biarea: context.biarea || 0
                }
            });

            setNarrative(response);
            setCachedNarrative(item.id, response);
        } catch (e) {
            logger.error('CostInspector', 'Failed to fetch narrative', e);
            setError('Unable to generate explanation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [item, context]);

    // Fetch narrative when item changes
    useEffect(() => {
        if (item) {
            fetchNarrative();
        } else {
            setNarrative(null);
            setError(null);
        }
    }, [item, fetchNarrative]);

    if (!item) return null;

    // Parse markdown bold syntax to JSX
    const renderNarrative = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            // Handle line breaks
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

    return (
        <div className="fixed top-0 right-0 h-full w-[480px] bg-white z-[60] flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Cost Analysis</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Close Inspector"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Item Summary */}
            <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{item.elementName}</h3>
                <p className="text-slate-500 text-sm mb-4">{item.description}</p>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-mono font-bold text-slate-900">
                        {Math.round(item.totalCost).toLocaleString('sv-SE')} kr
                    </span>
                    <span className="text-sm text-slate-500">
                        ({item.quantity} {item.unit} × {Math.round(item.unitPrice).toLocaleString('sv-SE')} kr)
                    </span>
                </div>
            </div>

            {/* Narrative Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="text-sm">Generating detailed explanation...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                            <p className="text-sm text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchNarrative(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {narrative && !isLoading && (
                    <div className="space-y-6">
                        {/* Main Narrative */}
                        <div className="prose prose-slate prose-sm max-w-none">
                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {renderNarrative(narrative.narrative)}
                            </div>
                        </div>

                        {/* Regulations List (if present) */}
                        {narrative.keyRegulations && narrative.keyRegulations.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
                                    Key Regulations
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {narrative.keyRegulations.map((reg, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-mono"
                                        >
                                            {reg}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchNarrative(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Regenerate Explanation
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center text-xs text-slate-500">
                    <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                    Generated based on BBR, Säker Vatten, and Swedish construction standards
                </div>
            </div>
        </div>
    );
}
