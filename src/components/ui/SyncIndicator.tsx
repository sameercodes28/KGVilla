'use client';

import React, { useEffect, useState, useRef } from 'react';
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
    const [showSynced, setShowSynced] = useState(false);
    const prevStatus = useRef(status);

    // Show "Synced" briefly after saving completes, then hide
    useEffect(() => {
        // If status changed from pending to synced, show briefly then hide
        if (prevStatus.current === 'pending' && status === 'synced') {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: show synced briefly then auto-hide
            setShowSynced(true);
            const timer = setTimeout(() => {
                setShowSynced(false);
            }, 2000); // Show for 2 seconds
            return () => clearTimeout(timer);
        }
        prevStatus.current = status;
    }, [status]);

    // Only show indicator when: saving, just saved (briefly), or error
    const shouldShow = status === 'pending' || status === 'error' || showSynced;

    if (!shouldShow) {
        return null;
    }

    return (
        <div className={cn("flex items-center text-xs font-medium transition-all duration-300", className)}>
            {status === 'synced' && showSynced && (
                <div className="flex items-center text-green-600 animate-in fade-in">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('sync.synced')}</span>
                </div>
            )}
            {status === 'pending' && (
                <div className="flex items-center text-red-600">
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
