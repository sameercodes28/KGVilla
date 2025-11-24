import { API_URL } from './api';
import { logger } from './logger';

/**
 * Centralized API Client
 * Handles standardized fetch requests, error handling, and logging.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

class ApiClient {
    private async request<T>(endpoint: string, method: HttpMethod = 'GET', body?: unknown, customHeaders?: HeadersInit): Promise<T> {
        const url = `${API_URL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || 'dev-key-123', // Fallback matching backend
            ...customHeaders,
        };

        const config: RequestInit = {
            method,
            headers,
        };

        if (body) {
            // If body is FormData, let the browser set Content-Type
            if (body instanceof FormData) {
                // @ts-expect-error - We are intentionally deleting a readonly property or one that TS thinks shouldn't be deleted, but it's necessary for fetch + FormData
                delete headers['Content-Type'];
                config.body = body;
            } else {
                config.body = JSON.stringify(body);
            }
        }

        logger.info('ApiClient', `Request: ${method} ${url}`);

        let attempt = 0;
        const maxRetries = 3;
        
        while (attempt <= maxRetries) {
            try {
                const response = await fetch(url, config);

                // If successful, or client error (4xx), return immediately
                // We typically don't retry 4xx unless it's 429, but let's keep it simple:
                // Retry only on 5xx
                if (response.ok) {
                    if (response.status === 204) return {} as T;
                    return await response.json() as T;
                }

                if (response.status < 500 && response.status !== 429) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                
                // If 5xx or 429, fall through to retry logic
                throw new Error(`Server Error: ${response.status}`);

            } catch (error) {
                attempt++;
                if (attempt > maxRetries) {
                    logger.error('ApiClient', `Failed after ${attempt} attempts: ${method} ${url}`, error);
                    throw error;
                }
                
                // Exponential backoff: 500, 1000, 2000ms
                const delay = 500 * Math.pow(2, attempt - 1);
                logger.warn('ApiClient', `Retry ${attempt}/${maxRetries} in ${delay}ms for ${url}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error('Unreachable'); // Should not be reached due to throw above
    }

    public get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, 'GET');
    }

    public post<T>(endpoint: string, body: unknown): Promise<T> {
        return this.request<T>(endpoint, 'POST', body);
    }

    public put<T>(endpoint: string, body: unknown): Promise<T> {
        return this.request<T>(endpoint, 'PUT', body);
    }

    public delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, 'DELETE');
    }
    
    public upload<T>(endpoint: string, formData: FormData): Promise<T> {
         return this.request<T>(endpoint, 'POST', formData);
    }
}

export const apiClient = new ApiClient();
