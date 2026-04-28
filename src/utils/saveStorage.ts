import Cookies from './cookies.ts';

// Conservative limit: 4096 byte total cookie max minus ~300 bytes for name, metadata, and encoding overhead
const COOKIE_VALUE_BYTE_LIMIT = 3800;

/**
 * Saves serialized game state. Uses a cookie for small payloads; falls back to
 * localStorage when the encoded size would exceed the 4 KB cookie limit.
 * Cleans up the other storage location to prevent stale data on next load.
 */
export const saveState = (cookieName: string, serialized: string): void => {
    if (encodeURIComponent(serialized).length <= COOKIE_VALUE_BYTE_LIMIT) {
        Cookies.set(cookieName, serialized);
        localStorage.removeItem(cookieName);
    } else {
        localStorage.setItem(cookieName, serialized);
        Cookies.remove(cookieName);
    }
};

/**
 * Loads serialized game state, checking the cookie first then localStorage.
 * This order handles both legacy cookie-only saves and newer localStorage saves.
 */
export const loadState = (cookieName: string): string | null => {
    return Cookies.get(cookieName) ?? localStorage.getItem(cookieName);
};
