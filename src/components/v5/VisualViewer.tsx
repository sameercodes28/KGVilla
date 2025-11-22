'use client';

import { useState, useRef } from 'react';
import { Maximize2, ZoomIn, ZoomOut, UploadCloud } from 'lucide-react';
import { electricalPoints, plumbingPoints } from '@/data/floorPlanOverlays';
import { cn } from '@/lib/utils';

interface VisualViewerProps {
    floorPlanUrl?: string | null;
    onUpload?: (file: File) => void;
    highlightedItem?: {
        id: string;
        name: string;
        validationData?: {
            type: 'area' | 'line' | 'point';
            count?: number;
            coordinates: number[][];
        };
    } | null;
}

export function VisualViewer({ floorPlanUrl, onUpload, highlightedItem }: VisualViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [activeLayers, setActiveLayers] = useState({ el: true, vvs: true, structure: true });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            onUpload(e.target.files[0]);
        }
    };

    const hasPlan = !!floorPlanUrl;

    return (
        <div className="h-full w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
            {/* Toolbar (Only show if plan exists) */}
            {hasPlan && (
                <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                    <div className="bg-black/50 backdrop-blur rounded-lg p-2 space-y-2 mb-2">
                        <label className="flex items-center space-x-2 text-xs text-white cursor-pointer">
                            <input type="checkbox" checked={activeLayers.el} onChange={e => setActiveLayers(p => ({ ...p, el: e.target.checked }))} className="rounded border-slate-600 bg-slate-800 text-blue-500" />
                            <span>Electrical</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-white cursor-pointer">
                            <input type="checkbox" checked={activeLayers.vvs} onChange={e => setActiveLayers(p => ({ ...p, vvs: e.target.checked }))} className="rounded border-slate-600 bg-slate-800 text-green-500" />
                            <span>Plumbing</span>
                        </label>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors">
                            <ZoomIn className="h-5 w-5" />
                        </button>
                        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors">
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div
                className="relative transition-transform duration-300 ease-out"
                style={{ transform: hasPlan ? `scale(${zoom})` : 'none' }}
            >
                {hasPlan ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={floorPlanUrl!}
                            alt="Floor Plan"
                            className="object-contain max-w-[90vw] max-h-[90vh] opacity-90"
                            style={{ maxHeight: '80vh', width: 'auto' }}
                        />

                        {/* Overlays (Only show if plan exists) */}
                        {activeLayers.el && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }}>
                                {electricalPoints.map((p, i) => (
                                    <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                                ))}
                            </svg>
                        )}
                        {activeLayers.vvs && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }}>
                                {plumbingPoints.map((p, i) => (
                                    <rect key={i} x={`${p.x}%`} y={`${p.y}%`} width="16" height="16" fill="#10b981" stroke="white" strokeWidth="2" rx="2" />
                                ))}
                            </svg>
                        )}
                        {highlightedItem && highlightedItem.validationData && (
                            <div className="absolute inset-0 pointer-events-none">
                                {highlightedItem.validationData.type === 'point' ? (
                                    highlightedItem.validationData.coordinates.map((coord, idx) => (
                                        <div
                                            key={idx}
                                            className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce"
                                            style={{ left: `${coord[0]}%`, top: `${coord[1]}%` }}
                                        >
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping"></div>
                                            <div className="relative bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl border-2 border-white font-bold text-sm whitespace-nowrap flex items-center">
                                                {highlightedItem.name}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State / Upload */
                    <div className="flex flex-col items-center justify-center p-12 max-w-md text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                            <UploadCloud className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload Floor Plan</h3>
                        <p className="text-slate-400 mb-8">
                            Upload your architectural drawing (PDF or Image) to start the AI analysis.
                        </p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden" 
                            accept="image/*,application/pdf"
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
                        >
                            Select File
                        </button>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-bold text-lg">{hasPlan ? 'Floor Plan Loaded' : 'No Plan Loaded'}</h3>
                        <p className="text-sm text-slate-300">{hasPlan ? 'Ready for analysis' : 'Upload to start'}</p>
                    </div>
                    {highlightedItem ? (
                        <div className="bg-blue-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            Validating: {highlightedItem.name}
                        </div>
                    ) : (
                        <div className="bg-slate-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-300">
                            Ready
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}