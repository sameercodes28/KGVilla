'use client';

import React, { useState } from 'react';
import { Copy, RefreshCcw, Wind } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useTranslation } from '@/contexts/LanguageContext';

interface ErrorFallbackProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const debugInfo = JSON.stringify({
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                digest: error.digest,
            },
            context: {
                url: window.location.href,
                userAgent: window.navigator.userAgent,
                timestamp: new Date().toISOString(),
            },
            telemetry: JSON.parse(logger.exportLogs() || '[]')
        }, null, 2);

        navigator.clipboard.writeText(debugInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-center">

                {/* Fun Header */}
                <div className="bg-gradient-to-b from-blue-50 to-white p-10 pb-6">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-sm">
                        <Wind className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{t('error.title')}</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        {t('error.message')}
                    </p>
                </div>

                {/* Action Area */}
                <div className="p-8 pt-2 space-y-4">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center"
                        >
                            <RefreshCcw className="h-5 w-5 mr-2" />
                            {t('error.retry')}
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-semibold transition-all"
                        >
                            {t('error.return_home')}
                        </button>
                    </div>

                    {/* Developer Tools */}
                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">{t('error.for_developer')}</p>
                        <button
                            onClick={handleCopy}
                            className="w-full group flex items-center justify-between bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 p-4 rounded-xl transition-all duration-300"
                        >
                            <div className="text-left">
                                <p className="text-xs font-mono font-medium opacity-70 mb-0.5">{t('error.code')} {error.digest || 'UNKNOWN'}</p>
                                <p className="text-sm font-bold">{copied ? t('error.copied') : t('error.copy_report')}</p>
                            </div>
                            <Copy className="h-5 w-5 opacity-50 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
