/**
 * Central API Configuration
 *
 * BACKEND_URL is loaded from process.env.NEXT_PUBLIC_BACKEND_URL.
 * Supports runtime override stored in localStorage if the user needs to point to a specific host.
 */

export function getRawBackendUrl(): string {
    if (typeof window !== 'undefined') {
        const userOverride = localStorage.getItem('NEXT_PUBLIC_BACKEND_URL');
        if (userOverride && userOverride.trim()) {
            return userOverride.trim().replace(/\/+$/, '');
        }
    }

    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (envUrl && envUrl.trim()) {
        return envUrl.trim().replace(/\/+$/, '');
    }

    return 'http://localhost:5000';
}

export const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function getBaseApiUrl(): string {
    return getRawBackendUrl();
}

export function setCustomBackendUrl(url: string | null): void {
    if (typeof window !== 'undefined') {
        if (url && url.trim()) {
            localStorage.setItem('NEXT_PUBLIC_BACKEND_URL', url.trim());
        } else {
            localStorage.removeItem('NEXT_PUBLIC_BACKEND_URL');
        }
    }
}
