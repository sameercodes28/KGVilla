export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configure the logger
export const LOG_LEVEL: LogLevel = 'info'; // 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    component: string;
    message: string;
    data?: any;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs: number = 100;

    private log(level: LogLevel, component: string, message: string, data?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            data
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

    debug(component: string, message: string, data?: any) {
        if (LOG_LEVEL === 'debug') this.log('debug', component, message, data);
    }

    info(component: string, message: string, data?: any) {
        if (['debug', 'info'].includes(LOG_LEVEL)) this.log('info', component, message, data);
    }

    warn(component: string, message: string, data?: any) {
        if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) this.log('warn', component, message, data);
    }

    error(component: string, message: string, data?: any) {
        this.log('error', component, message, data);
    }

    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

export const logger = new Logger();
