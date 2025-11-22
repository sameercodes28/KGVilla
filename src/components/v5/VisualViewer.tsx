'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

import { electricalPoints, plumbingPoints } from '@/data/floorPlanOverlays';

interface VisualViewerProps {
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

export function VisualViewer({ highlightedItem }: VisualViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [activeLayers, setActiveLayers] = useState({ el: true, vvs: true, structure: true });
    const [imageError, setImageError] = useState(false);

    const basePath = process.env.NODE_ENV === 'production' ? '/KGVilla' : '';

    return (
        <div className="h-full w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
            {/* Toolbar */}
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

            {/* Image Container */}
            <div
                className="relative transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoom})` }}
            >
                {!imageError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={`${basePath}/hus-1405-plan.jpg`}
                        alt="Floor Plan - Villa JB-1405"
                        className="object-contain max-w-[90vw] max-h-[90vh] opacity-90"
                        style={{ maxHeight: '80vh', width: 'auto' }}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    /* Placeholder for missing floor plan */
                    <div
                        id="floor-plan-placeholder"
                        className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-600 max-w-2xl"
                    >
                        <svg className="w-24 h-24 text-slate-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">Floor Plan Not Found</h3>
                        <p className="text-slate-400 text-center mb-6 max-w-md">
                            Add your architectural drawing to display it here.
                        </p>
                        <div className="bg-slate-900/80 rounded-lg p-6 text-sm text-slate-300 font-mono max-w-lg">
                            <p className="text-blue-400 font-semibold mb-2">To add your floor plan:</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Save your floor plan as <span className="text-green-400">hus-1405-plan.jpg</span></li>
                                <li>Place it in the <span className="text-green-400">/public/</span> folder</li>
                                <li>Refresh the page</li>
                            </ol>
                            <p className="mt-4 text-xs text-slate-500">Supported formats: JPG, PNG (recommended: 1920x1080px)</p>
                        </div>
                    </div>
                )}

                {/* Electrical Layer Overlay */}
                {activeLayers.el && !imageError && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }}>
                        {electricalPoints.map((p, i) => (
                            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                        ))}
                    </svg>
                )}

                {/* Plumbing Layer Overlay */}
                {activeLayers.vvs && !imageError && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }}>
                        {plumbingPoints.map((p, i) => (
                            <rect key={i} x={`${p.x}%`} y={`${p.y}%`} width="16" height="16" fill="#10b981" stroke="white" strokeWidth="2" rx="2" />
                        ))}
                    </svg>
                )}

                {/* Highlight Overlay */}
                {highlightedItem && highlightedItem.validationData && !imageError && (
                    <div className="absolute inset-0 pointer-events-none">
                        {highlightedItem.validationData.type === 'point' ? (
                            // Render Points (e.g. Sockets)
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
                            // Render Area/Line (Mocked as a central pulse for now, ideally SVG)
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping"></div>
                                    <div className="relative bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl border-2 border-white font-bold text-sm whitespace-nowrap flex items-center">
                                        {highlightedItem.validationData.count ? (
                                            <span className="mr-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                {highlightedItem.validationData.count}
                                            </span>
                                        ) : null}
                                        {highlightedItem.name}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-bold text-lg">Level 1 - Entrance Plan</h3>
                        <p className="text-sm text-slate-300">Scale 1:100 • A-40-1-001</p>
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
