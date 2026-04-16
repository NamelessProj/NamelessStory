export default class Cookies {
    /**
     * Sets a cookie with the specified name, value, and expiration in days. The cookie is set with the <code>path</code> of <code>'/'</code> and <code>SameSite</code> attribute of <code>'Lax'</code>. If the current page is served over HTTPS, the cookie will also be marked as Secure.
     * @param name {string} - The name of the cookie to set. This should be a string that identifies the cookie and is used to retrieve it later.
     * @param value {string} - The value of the cookie to set. This can be any string that you want to store in the cookie, such as a user ID, session token, or game state.
     * @param days {number?} - The number of days until the cookie expires. This determines how long the cookie will be stored in the user's browser before it is automatically deleted. By default, this is set to <code>30</code> days if not specified.
     */
    static set(name: string, value: string, days: number = 30): void {
        if (typeof document === 'undefined') return; // Ensure we're in a browser environment
        const expires: string = new Date(Date.now() + (days * 864e5)).toUTCString(); // 864e5 is the number of milliseconds in a day
        let cookie: string = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
        if (typeof location !== 'undefined' && location.protocol === 'https:') cookie += '; Secure';
        document.cookie = cookie;
    }

    /**
     * Retrieves the value of a cookie with the specified name. If the cookie is found, its value is returned as a string. If the cookie is not found, <code>null</code> is returned.
     * @param name {string} - The name of the cookie to retrieve. This should be a string that identifies the cookie you want to access, and it should match the name used when the cookie was set.
     * @returns {string|null} - The value of the cookie if found, or <code>null</code> if the cookie does not exist. The returned value is decoded from its URL-encoded form, so it will be in its original format as it was set.
     */
    static get(name: string): string|null {
        if (typeof document === 'undefined') return null; // Ensure we're in a browser environment
        const encodedName: string = encodeURIComponent(name) + '=';
        const parts: string[] = document.cookie.split('; ');
        for (let i: number = 0; i < parts.length; i++) {
            const part: string = parts[i];
            if (part.indexOf(encodedName) === 0) {
                return decodeURIComponent(part.substring(encodedName.length));
            }
        }
        return null;
    }

    /**
     * Deletes a cookie with the specified name by setting its expiration date to a time in the past. This effectively removes the cookie from the user's browser.
     * The cookie is deleted with the same <code>path</code> and <code>SameSite</code> attributes as when it was set to ensure it is properly removed.
     * @param name {string} - The name of the cookie to delete. This should be a string that identifies the cookie you want to remove, and it should match the name used when the cookie was set.
     */
    static delete(name: string): void {
        this.set(name, '', -1);
    }
}