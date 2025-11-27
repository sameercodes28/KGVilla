'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * GlobalErrorHandler
 *
 * Comprehensive error tracking and handling:
 * - Catches and handles DOM-related errors from browser extensions
 * - Tracks all JavaScript errors for debugging
 * - Monitors unhandled promise rejections
 * - Provides click tracking for debugging crash context
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        logger.info('GlobalErrorHandler', 'Error handlers initialized');

        // Track all clicks for debugging context
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const componentName = target.closest('[data-component]')?.getAttribute('data-component') ||
                target.closest('button')?.textContent?.slice(0, 30) ||
                target.closest('a')?.textContent?.slice(0, 30) ||
                target.tagName.toLowerCase();

            const elementInfo = {
                tagName: target.tagName,
                id: target.id || undefined,
                className: target.className?.toString()?.slice(0, 50) || undefined,
                textContent: target.textContent?.slice(0, 30) || undefined,
                parentComponent: target.closest('[data-component]')?.getAttribute('data-component')
            };

            logger.trackClick(componentName, target.id, elementInfo);
        };

        // Handle JavaScript errors
        const handleError = (event: ErrorEvent) => {
            const isRemoveChildError = event.message?.includes('removeChild') ||
                event.message?.includes('insertBefore') ||
                event.message?.includes('appendChild');

            const isDOMError = event.error?.name === 'NotFoundError' ||
                event.error?.name === 'HierarchyRequestError';

            // Log ALL errors for debugging
            logger.error('GlobalErrorHandler', `JavaScript Error: ${event.message}`, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error ? {
                    name: event.error.name,
                    message: event.error.message,
                    stack: event.error.stack
                } : null,
                isDOMError,
                isRemoveChildError,
                lastInteraction: logger.getLastInteraction(),
                timestamp: new Date().toISOString()
            });

            if (isRemoveChildError || isDOMError) {
                // Suppress DOM errors - likely caused by Google Translate or similar
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

        // Handle unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason?.message || String(event.reason);

            logger.error('GlobalErrorHandler', `Unhandled Promise Rejection: ${reason}`, {
                reason: event.reason,
                stack: event.reason?.stack,
                lastInteraction: logger.getLastInteraction(),
                timestamp: new Date().toISOString()
            });

            if (reason?.includes('removeChild') || reason?.includes('insertBefore')) {
                event.preventDefault();
                logger.warn('GlobalErrorHandler', 'Promise rejection suppressed (likely DOM issue)', {
                    reason,
                });
                return true;
            }
        };

        // Track page visibility changes (helpful for debugging intermittent issues)
        const handleVisibilityChange = () => {
            logger.debug('GlobalErrorHandler', `Page visibility: ${document.visibilityState}`);
        };

        // Track before unload (capture state before potential crashes)
        const handleBeforeUnload = () => {
            logger.info('GlobalErrorHandler', 'Page unloading', {
                summary: logger.getSummary()
            });
        };

        // Register all listeners
        document.addEventListener('click', handleClick, true);
        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('click', handleClick, true);
            window.removeEventListener('error', handleError, true);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return <>{children}</>;
}
