export const getCookieName = (vnName: string) => {
    let name: string = vnName.trim().toLowerCase().replace(/\s+/g, '-'); // Convert to lowercase and replace spaces with hyphens
    name = name.replace(/[^a-z0-9-]/g, ''); // Remove any characters that are not letters, numbers, or hyphens
    return `vn-${name}`;
}