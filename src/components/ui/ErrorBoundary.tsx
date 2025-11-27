'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { AlertTriangle, Copy, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const componentName = this.props.componentName || 'Unknown';

        // Log comprehensive error info
        logger.trackError(error, `ErrorBoundary:${componentName}`, {
            componentStack: errorInfo.componentStack,
            lastInteraction: logger.getLastInteraction()
        });

        logger.error('ErrorBoundary', `Component crashed: ${componentName}`, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            componentStack: errorInfo.componentStack,
            crashReport: logger.exportCrashReport()
        });

        this.setState({ errorInfo });
    }

    handleReset = () => {
        logger.info('ErrorBoundary', 'User clicked reset');
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleCopyReport = () => {
        const report = logger.exportCrashReport();
        navigator.clipboard.writeText(report);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
        logger.info('ErrorBoundary', 'Crash report copied to clipboard');
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, errorInfo, showDetails, copied } = this.state;

            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl m-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-red-900 mb-1">
                                Something went wrong
                            </h3>
                            <p className="text-sm text-red-700 mb-3">
                                {error?.message || 'An unexpected error occurred'}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                                <button
                                    onClick={this.handleReset}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <RefreshCcw className="h-4 w-4 mr-1.5" />
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleCopyReport}
                                    className="inline-flex items-center px-3 py-1.5 bg-white text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                    <Copy className="h-4 w-4 mr-1.5" />
                                    {copied ? 'Copied!' : 'Copy Debug Info'}
                                </button>
                                <button
                                    onClick={() => this.setState({ showDetails: !showDetails })}
                                    className="inline-flex items-center px-3 py-1.5 text-red-600 text-sm font-medium hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    {showDetails ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-1" />
                                            Hide Details
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                            Show Details
                                        </>
                                    )}
                                </button>
                            </div>

                            {showDetails && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-red-100 overflow-auto max-h-64">
                                    <p className="text-xs font-mono text-red-800 mb-2">
                                        <strong>Error:</strong> {error?.name}: {error?.message}
                                    </p>
                                    {error?.stack && (
                                        <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap mb-2">
                                            {error.stack}
                                        </pre>
                                    )}
                                    {errorInfo?.componentStack && (
                                        <>
                                            <p className="text-xs font-mono text-red-800 mb-1 mt-3">
                                                <strong>Component Stack:</strong>
                                            </p>
                                            <pre className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                                                {errorInfo.componentStack}
                                            </pre>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC for wrapping functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary componentName={componentName}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
