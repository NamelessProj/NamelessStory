// ─── Validators ──────────────────────────────────────────────────────────────

const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;
const CLASS_RE = /^[a-zA-Z0-9_\- ]+$/;
const URL_RE   = /^https?:\/\//;

const isValidColor = (v: string): boolean => COLOR_RE.test(v.trim());
const isValidClass = (v: string): boolean => CLASS_RE.test(v);
const isValidUrl   = (v: string): boolean => URL_RE.test(v.trim());

// ─── Rule registry ────────────────────────────────────────────────────────────

/**
 * A markup rule maps a regex pattern to a safe HTML string.
 * To add a new tag, append an entry here — no other changes needed.
 *
 * Supported syntax (all tags are case-insensitive):
 *   [b]…[/b]                     → <b>
 *   [i]…[/i]                     → <i>
 *   [u]…[/u]                     → <u>
 *   [s]…[/s]                     → <s>
 *   [color=red|#rrggbb|rgb(…)]…[/color]  → <span style="color:…">
 *   [class="my-class"]…[/class]    → <span class="my-class">
 *   [link href="https://…"]…[/link]      → <a target="_blank">
 *   [br]                         → <br/>
 */

interface MarkupRule {
    name: string;
    regex: RegExp;
    replace: (match: string, ...groups: string[]) => string;
}

const MARKUP_RULES: MarkupRule[] = [
    {
        name: "newline",
        regex: /\[br\]/gi,
        replace: () => "<br/>",
    },
    {
        name: "bold",
        regex: /\[b\]([\s\S]*?)\[\/b\]/gi,
        replace: (_m, content) => `<b>${content}</b>`,
    },
    {
        name: "italic",
        regex: /\[i\]([\s\S]*?)\[\/i\]/gi,
        replace: (_m, content) => `<i>${content}</i>`,
    },
    {
        name: "underline",
        regex: /\[u\]([\s\S]*?)\[\/u\]/gi,
        replace: (_m, content) => `<u>${content}</u>`,
    },
    {
        name: "strikethrough",
        regex: /\[s\]([\s\S]*?)\[\/s\]/gi,
        replace: (_m, content) => `<s>${content}</s>`,
    },
    {
        // Accepts: color name, #rrggbb / #rgb, rgb(…), rgba(…)
        name: "color",
        regex: /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi,
        replace: (_m, color, content) =>
            isValidColor(color)
                ? `<span style="color:${color.trim()}">${content}</span>`
                : content,
    },
    {
        // Custom CSS class block — class names may contain letters, digits, hyphens, underscores, spaces
        name: "classBlock",
        regex: /\[class=([^\]]+)\]([\s\S]*?)\[\/class\]/gi,
        replace: (_m, className, content) =>
            isValidClass(className)
                ? `<span class="${className}">${content}</span>`
                : content,
    },
    {
        // Only http / https URLs are allowed to prevent javascript: injections
        name: "link",
        regex: /\[link href="([^"]+)"\]([\s\S]*?)\[\/link\]/gi,
        replace: (_m, href, content) =>
            isValidUrl(href)
                ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${content}</a>`
                : content,
    },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Converts custom markup tags in a story text string to safe HTML.
 * Runs each rule once in order; nesting different tag types is fully supported.
 */
export function parseMarkup(text: string): string {
    let result = text;
    for (const rule of MARKUP_RULES) {
        result = result.replace(rule.regex, rule.replace as Parameters<typeof String.prototype.replace>[1]);
    }
    return result;
}
