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

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // Handle empty responses (e.g. DELETE 204)
            if (response.status === 204) {
                return {} as T;
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            logger.error('ApiClient', `Failed: ${method} ${url}`, error);
            throw error;
        }
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
