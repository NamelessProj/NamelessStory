/**
 * Generates a cookie name based on the provided visual novel name. The function takes the name, trims any leading or trailing whitespace, converts it to lowercase, and replaces spaces with hyphens.
 * It also removes any characters that are not letters, numbers, or hyphens to ensure the cookie name is valid. Finally, it prefixes the name with "vn-" to create a unique cookie name.
 * @param vnName {string} - The name of the visual novel for which to generate the cookie name.
 * @returns {string} - The generated cookie name in the format "vn-{processedName}", where {processedName} is the sanitized version of the visual novel name.
 */
export const getCookieName = (vnName: string): string => {
    let name: string = vnName.trim().toLowerCase().replace(/\s+/g, '-'); // Convert to lowercase and replace spaces with hyphens
    name = name.replace(/[^a-z0-9-]/g, ''); // Remove any characters that are not letters, numbers, or hyphens
    return `vn-${name}`;
}