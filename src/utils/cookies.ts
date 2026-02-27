export default class Cookies {
    static set(name: string, value: string, days: number = 30): void {
        if (typeof document === 'undefined') return; // Ensure we're in a browser environment
        const expires: string = new Date(Date.now() + (days * 864e5)).toUTCString(); // 864e5 is the number of milliseconds in a day
        let cookie: string = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
        if (typeof location !== 'undefined' && location.protocol === 'https:') cookie += '; Secure';
        document.cookie = cookie;
    }

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

    static delete(name: string): void {
        this.set(name, '', -1);
    }
}