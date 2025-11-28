/**
 * Application constants
 * These values are hardcoded to ensure reliability across SSR and client-side hydration
 */

// Base path for GitHub Pages deployment
// IMPORTANT: This must be a string literal for proper static site generation
// The path is determined at runtime by checking if we're on GitHub Pages
export function getBasePath(): string {
    // In browser, check actual hostname
    if (typeof window !== 'undefined') {
        // If on GitHub Pages (sameercodes28.github.io), use /KGVilla
        if (window.location.hostname.includes('github.io')) {
            return '/KGVilla';
        }
        // Local development
        return '';
    }
    // Server-side: use env variable or default to production path for static export
    return process.env.NEXT_PUBLIC_BASE_PATH ?? '/KGVilla';
}

// Helper to get full asset path
export function getAssetPath(path: string): string {
    const basePath = getBasePath();
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${normalizedPath}`;
}
