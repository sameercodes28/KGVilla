export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configure the logger - set to 'debug' for maximum verbosity
export const LOG_LEVEL: LogLevel = 'debug';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    component: string;
    message: string;
    data?: unknown;
    sessionId?: string;
}

export interface InteractionEntry {
    timestamp: string;
    type: 'click' | 'input' | 'navigation' | 'state_change' | 'api_call' | 'error' | 'mount' | 'unmount';
    target: string;
    details?: unknown;
}

export interface PerformanceEntry {
    timestamp: string;
    operation: string;
    duration: number;
    success: boolean;
    details?: unknown;
}

class Logger {
    private logs: LogEntry[] = [];
    private interactions: InteractionEntry[] = [];
    private performance: PerformanceEntry[] = [];
    private maxLogs: number = 200;
    private maxInteractions: number = 100;
    private sessionId: string;
    private lastInteraction: InteractionEntry | null = null;

    constructor() {
        // Generate unique session ID for tracking
        this.sessionId = this.generateSessionId();
        this.log('info', 'Logger', `Session started: ${this.sessionId}`);
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getLastInteraction(): InteractionEntry | null {
        return this.lastInteraction;
    }

    log(level: LogLevel, component: string, message: string, data?: unknown) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            data,
            sessionId: this.sessionId
        };

        // Add to internal history (for export/debug)
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Output to console with nice formatting
        const prefix = `[${entry.timestamp.split('T')[1].split('.')[0]}] [${component}]`;
        const css = this.getLevelCSS(level);

        if (data) {
            console.groupCollapsed(`%c${prefix} ${message}`, css);
            console.log(data);
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${message}`, css);
        }
    }

    private getLevelCSS(level: LogLevel): string {
        switch (level) {
            case 'debug': return 'color: #9ca3af';
            case 'info': return 'color: #2563eb; font-weight: bold';
            case 'warn': return 'color: #d97706; font-weight: bold';
            case 'error': return 'color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 4px; border-radius: 4px';
            default: return 'color: inherit';
        }
    }

    debug(component: string, message: string, data?: unknown) {
        if (LOG_LEVEL === 'debug') this.log('debug', component, message, data);
    }

    info(component: string, message: string, data?: unknown) {
        if (['debug', 'info'].includes(LOG_LEVEL)) this.log('info', component, message, data);
    }

    warn(component: string, message: string, data?: unknown) {
        if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) this.log('warn', component, message, data);
    }

    error(component: string, message: string, data?: unknown) {
        this.log('error', component, message, data);
    }

    // Track user interactions for debugging crashes
    trackInteraction(type: InteractionEntry['type'], target: string, details?: unknown) {
        const entry: InteractionEntry = {
            timestamp: new Date().toISOString(),
            type,
            target,
            details
        };

        this.interactions.push(entry);
        this.lastInteraction = entry;

        if (this.interactions.length > this.maxInteractions) {
            this.interactions.shift();
        }

        // Log interactions as debug
        this.debug('Interaction', `${type}: ${target}`, details);
    }

    // Track click events with enhanced context
    trackClick(componentName: string, elementId?: string, additionalData?: unknown) {
        this.trackInteraction('click', componentName, {
            elementId,
            ...((typeof additionalData === 'object' && additionalData !== null) ? additionalData : { value: additionalData })
        });
    }

    // Track state changes
    trackStateChange(componentName: string, stateName: string, oldValue: unknown, newValue: unknown) {
        this.trackInteraction('state_change', `${componentName}.${stateName}`, {
            from: oldValue,
            to: newValue
        });
    }

    // Track component mount/unmount
    trackMount(componentName: string, props?: unknown) {
        this.trackInteraction('mount', componentName, { props });
    }

    trackUnmount(componentName: string) {
        this.trackInteraction('unmount', componentName);
    }

    // Track navigation
    trackNavigation(from: string, to: string) {
        this.trackInteraction('navigation', `${from} → ${to}`);
    }

    // Track API calls
    trackApiCall(endpoint: string, method: string, status: 'start' | 'success' | 'error', data?: unknown) {
        this.trackInteraction('api_call', `${method} ${endpoint}`, { status, data });
    }

    // Performance tracking
    startPerformance(operation: string): () => void {
        const startTime = performance.now();
        return () => {
            const duration = performance.now() - startTime;
            this.recordPerformance(operation, duration, true);
        };
    }

    recordPerformance(operation: string, duration: number, success: boolean, details?: unknown) {
        const entry: PerformanceEntry = {
            timestamp: new Date().toISOString(),
            operation,
            duration,
            success,
            details
        };

        this.performance.push(entry);
        if (this.performance.length > this.maxInteractions) {
            this.performance.shift();
        }

        if (duration > 1000) {
            this.warn('Performance', `Slow operation: ${operation} took ${duration.toFixed(0)}ms`);
        }
    }

    // Error tracking with full context
    trackError(error: Error, componentName: string, context?: unknown) {
        this.trackInteraction('error', componentName, {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context
        });

        this.error(componentName, `Error: ${error.message}`, {
            name: error.name,
            stack: error.stack,
            context,
            lastInteraction: this.lastInteraction,
            recentInteractions: this.interactions.slice(-10)
        });
    }

    // Export all logs for debugging
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    // Export comprehensive crash report
    exportCrashReport() {
        return JSON.stringify({
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
            url: typeof window !== 'undefined' ? window.location.href : 'N/A',
            lastInteraction: this.lastInteraction,
            recentInteractions: this.interactions.slice(-20),
            recentLogs: this.logs.slice(-50),
            performanceMetrics: this.performance.slice(-20)
        }, null, 2);
    }

    // Get summary for quick debugging
    getSummary() {
        const errorCount = this.logs.filter(l => l.level === 'error').length;
        const warnCount = this.logs.filter(l => l.level === 'warn').length;
        return {
            sessionId: this.sessionId,
            logCount: this.logs.length,
            interactionCount: this.interactions.length,
            errorCount,
            warnCount,
            lastInteraction: this.lastInteraction
        };
    }
}

export const logger = new Logger();

// Make logger available globally for debugging in browser console
if (typeof window !== 'undefined') {
    (window as unknown as { __kgvilla_logger: Logger }).__kgvilla_logger = logger;
}
