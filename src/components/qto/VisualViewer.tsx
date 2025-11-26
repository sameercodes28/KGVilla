'use client';

import { useState, useRef } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

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
    const { t } = useTranslation();
    const [zoom, setZoom] = useState(0.8);  // Start zoomed out to fit
    const [isFullScreen, setIsFullScreen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpload) {
            onUpload(e.target.files[0]);
        }
    };

    const hasPlan = !!floorPlanUrl;

    return (
        <div className={cn(
            "bg-slate-900 overflow-hidden flex items-center justify-center transition-all duration-300",
            isFullScreen ? "fixed inset-0 z-[70]" : "h-full w-full relative"
        )}>
            {/* Toolbar (Only show if plan exists) */}
            {hasPlan && (
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                    <button
                        onClick={() => setZoom(0.8)}
                        className="px-3 py-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors text-xs font-bold"
                        title={t('viewer.fit_view')}
                    >
                        {t('viewer.fit')}
                    </button>
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors">
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors">
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors"
                    >
                        {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                </div>
            )}

            {/* Image Container */}
            <div
                className="relative transition-transform duration-300 ease-out"
                style={{ transform: hasPlan ? `scale(${zoom})` : 'none' }}
            >
                {hasPlan ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={floorPlanUrl!}
                        alt="Floor Plan"
                        className="object-contain max-w-[90vw] max-h-[90vh] opacity-90"
                        style={{ maxHeight: '80vh', width: 'auto' }}
                    />
                ) : (
                    /* Empty State / Upload */
                    <div className="flex flex-col items-center justify-center p-12 max-w-md text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                            <UploadCloud className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t('viewer.upload_title')}</h3>
                        <p className="text-slate-400 mb-8">
                            {t('viewer.upload_desc')}
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
                            {t('viewer.select_file')}
                        </button>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-bold text-lg">{hasPlan ? t('viewer.plan_loaded') : t('viewer.no_plan')}</h3>
                        <p className="text-sm text-slate-300">{hasPlan ? t('viewer.ready_analysis') : t('viewer.upload_start')}</p>
                    </div>
                    {highlightedItem ? (
                        <div className="bg-blue-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            {t('viewer.validating')} {highlightedItem.name}
                        </div>
                    ) : (
                        <div className="bg-slate-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-300">
                            {t('viewer.ready')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
