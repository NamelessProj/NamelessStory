/**
 * Sanitizes a string for use as an identifier: trims whitespace, lowercases, replaces spaces with hyphens, and strips non-alphanumeric/hyphen characters.
 * @param name {string} The raw string to sanitize.
 * @returns {string} The sanitized string.
 */
export const sanitizeName = (name: string): string => name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/**
 * Generates a cookie name based on the provided visual novel name. The function sanitizes the name and prefixes it with "vn-" to create a unique cookie name.
 * @param vnName {string} The name of the visual novel for which to generate the cookie name.
 * @returns {string} The generated cookie name in the format "vn-{processedName}", where {processedName} is the sanitized version of the visual novel name.
 */
export const getCookieName = (vnName: string): string => `vn-${sanitizeName(vnName)}`;