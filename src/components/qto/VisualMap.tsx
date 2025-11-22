'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, Layers } from 'lucide-react';
import { Level } from '@/types';
import { cn } from '@/lib/utils';

interface VisualMapProps {
    imageUrl: string;
    levels: Level[];
    currentLevelId: string;
    onLevelChange: (levelId: string) => void;
}

export function VisualMap({ imageUrl, levels, currentLevelId, onLevelChange }: VisualMapProps) {
    // Mock zones for Hus 1405 floor plan
    // In a real app, these coordinates would come from the AI analysis
    const zones = [
        { id: 'z1', label: 'Vardagsrum', top: '40%', left: '45%', width: '25%', height: '30%' },
        { id: 'z2', label: 'Kök', top: '60%', left: '55%', width: '15%', height: '20%' },
        { id: 'z3', label: 'Sov 1', top: '65%', left: '75%', width: '15%', height: '20%' },
        { id: 'z4', label: 'Garage', top: '45%', left: '15%', width: '20%', height: '40%' },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-4">
                    <h3 className="font-semibold text-slate-900">Ritningsvy</h3>

                    {/* Level Selector */}
                    <div className="flex bg-slate-200 rounded-lg p-1 space-x-1">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => onLevelChange(level.id)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    currentLevelId === level.id
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
                                )}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
                    <Maximize2 className="h-4 w-4" />
                </button>
            </div>

            <div className="relative flex-1 bg-slate-100 overflow-hidden group">
                {/* Floor Plan Image */}
                <div className="relative w-full h-full min-h-[400px]">
                    <Image
                        src={imageUrl}
                        alt="Floor Plan"
                        fill
                        className="object-contain p-4"
                    />

                    {/* Overlay Zones */}
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className="absolute border-2 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition-all rounded-sm flex items-center justify-center"
                            style={{
                                top: zone.top,
                                left: zone.left,
                                width: zone.width,
                                height: zone.height
                            }}
                            title={zone.label}
                        >
                            <span className="bg-white/90 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {zone.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
