'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileText, Plus, Layers, Image as ImageIcon, File } from 'lucide-react';
import { Level } from '@/types';
import { cn } from '@/lib/utils';

interface VisualHeaderProps {
    levels: Level[];
    currentLevelId: string;
    onLevelChange: (id: string) => void;
}

export function VisualHeader({ levels, currentLevelId, onLevelChange }: VisualHeaderProps) {
    const [activeTab, setActiveTab] = useState<'plans' | 'renderings'>('plans');

    const documents = [
        { name: 'A-40-1-001 Planer.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'A-40-2-001 Fasader.pdf', size: '1.8 MB', type: 'pdf' },
        { name: 'K-10-1-001 Grundplan.pdf', size: '3.1 MB', type: 'pdf' },
    ];

    return (
        <div className="mb-12 space-y-6">
            {/* Top Bar: Documents & Add Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                    {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 whitespace-nowrap hover:border-blue-300 transition-colors cursor-pointer">
                            <FileText className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            {doc.name}
                        </div>
                    ))}
                    <button className="flex items-center px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600 font-medium hover:bg-blue-100 transition-colors whitespace-nowrap">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Document
                    </button>
                </div>
            </div>

            {/* Visual Area */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 relative aspect-[16/9] group">
                {/* Image Display */}
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    {/* In a real app, this would be the actual image URL based on level/tab */}
                    <div className="text-center">
                        {activeTab === 'plans' ? (
                            <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                                <Image
                                    src="/hus-1405-plan.jpg"
                                    alt="Floor Plan"
                                    width={800}
                                    height={600}
                                    className="object-contain max-h-[400px] opacity-90"
                                />
                            </div>
                        ) : (
                            <div className="text-slate-500 flex flex-col items-center">
                                <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                <p>3D Rendering Placeholder</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">

                    {/* View Switcher */}
                    <div className="bg-black/50 backdrop-blur-md rounded-lg p-1 flex space-x-1">
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center",
                                activeTab === 'plans' ? "bg-white text-slate-900" : "text-white/70 hover:bg-white/10"
                            )}
                        >
                            <Layers className="h-3.5 w-3.5 mr-1.5" />
                            Floor Plans
                        </button>
                        <button
                            onClick={() => setActiveTab('renderings')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center",
                                activeTab === 'renderings' ? "bg-white text-slate-900" : "text-white/70 hover:bg-white/10"
                            )}
                        >
                            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                            Renderings
                        </button>
                    </div>

                    {/* Level Selector (Only for Plans) */}
                    {activeTab === 'plans' && (
                        <div className="bg-black/50 backdrop-blur-md rounded-lg p-1 flex flex-col space-y-1">
                            {levels.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => onLevelChange(level.id)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all text-left",
                                        currentLevelId === level.id ? "bg-white text-slate-900" : "text-white/70 hover:bg-white/10"
                                    )}
                                >
                                    {level.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
