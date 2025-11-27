'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * GlobalErrorHandler
 *
 * Catches and handles DOM-related errors that can occur when:
 * - Browser extensions (like Google Translate) modify the DOM
 * - Third-party scripts interfere with React's DOM management
 *
 * These errors are typically "Failed to execute 'removeChild' on 'Node'"
 * and happen when React tries to update nodes that have been modified externally.
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            const isRemoveChildError = event.message?.includes('removeChild') ||
                event.message?.includes('insertBefore') ||
                event.message?.includes('appendChild');

            const isDOMError = event.error?.name === 'NotFoundError' ||
                event.error?.name === 'HierarchyRequestError';

            if (isRemoveChildError || isDOMError) {
                // Suppress the error - it's likely caused by Google Translate or similar
                event.preventDefault();
                event.stopPropagation();

                logger.warn('GlobalErrorHandler', 'DOM manipulation error suppressed (likely Google Translate)', {
                    message: event.message,
                    filename: event.filename,
                });

                // Don't crash the app - the UI will recover on next render
                return true;
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason?.message || String(event.reason);

            if (reason?.includes('removeChild') || reason?.includes('insertBefore')) {
                event.preventDefault();
                logger.warn('GlobalErrorHandler', 'Promise rejection suppressed (likely DOM issue)', {
                    reason,
                });
                return true;
            }
        };

        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError, true);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return <>{children}</>;
}
