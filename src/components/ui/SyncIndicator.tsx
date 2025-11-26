'use client';

import React from 'react';
import { SyncState } from '@/hooks/useProjectData';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface SyncIndicatorProps {
    syncState: SyncState;
    className?: string;
}

export function SyncIndicator({ syncState, className }: SyncIndicatorProps) {
    const { t } = useTranslation();
    const { status, errorMessage } = syncState;

    return (
        <div className={cn("flex items-center text-xs font-medium transition-all duration-300", className)}>
            {status === 'synced' && (
                <div className="flex items-center text-green-600 animate-in fade-in">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('sync.synced')}</span>
                </div>
            )}
            {status === 'pending' && (
                <div className="flex items-center text-blue-600">
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>{t('sync.saving')}</span>
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center text-amber-600" title={errorMessage || 'Sync failed'}>
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('sync.offline')}</span>
                </div>
            )}
        </div>
    );
}
