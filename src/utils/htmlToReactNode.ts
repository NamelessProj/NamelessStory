import { createElement, Fragment, type ReactNode } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tags our markup pipeline and getTextWithCharacters can produce. */
const ALLOWED_TAGS = new Set(['b', 'i', 'u', 's', 'span', 'a', 'br']);

/**
 * Parses key="value" attribute pairs from a raw attribute string.
 * @param attrStr {string} The raw attribute string from an HTML tag, e.g. 'class="foo" style="color:red"'
 * @returns {Record<string, string>} An object mapping attribute names to values, e.g. { class: "foo", style: "color:red" }
 */
const parseAttrs = (attrStr: string): Record<string, string> => {
    const attrs: Record<string, string> = {};
    const re = /([a-zA-Z-]+)="([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrStr)) !== null) attrs[m[1]] = m[2];
    return attrs;
}

/**
 * Converts a CSS string like "color:red;font-weight:bold" to a React style object.
 * @param css {string} The CSS string to convert
 * @returns {Record<string, string>} The corresponding React style object, e.g. { color: "red", fontWeight: "bold" }
 */
const cssToObject = (css: string): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (const decl of css.split(';')) {
        const sep: number = decl.indexOf(':');
        if (sep === -1) continue;
        const prop: string = decl.slice(0, sep).trim();
        const value: string = decl.slice(sep + 1).trim();
        if (!prop || !value) continue;
        // kebab-case → camelCase (e.g. font-size → fontSize)
        obj[prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
    }
    return obj;
}

/**
 * Maps parsed HTML attributes to React-compatible props for the given tag.
 * @param tag {string} The HTML tag name (e.g. "span", "a")
 * @param attrs {Record<string, string>} The parsed attributes from the tag
 * @returns {Record<string, unknown>} The corresponding React props to apply to the element
 */
const toReactProps = (tag: string, attrs: Record<string, string>): Record<string, unknown> => {
    const props: Record<string, unknown> = {};
    if (attrs.class) props.className = attrs.class;
    if (attrs.style) props.style = cssToObject(attrs.style);
    if (tag === 'a') {
        if (attrs.href)   props.href   = attrs.href;
        if (attrs.target) props.target = attrs.target;
        if (attrs.rel)    props.rel    = attrs.rel;
    }
    return props;
}

/**
 * Decodes the HTML entities that {@link escapeHtml} produced so React text nodes
 * receive the original characters (React re-escapes them safely for the DOM).
 * @param text {string} The text to decode, e.g. "Hello &amp; welcome to &lt;React&gt;!"
 * @returns {string} The decoded text, e.g. "Hello & welcome to <React>!"
 */
const decodeEntities = (text: string): string => {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

// ─── Parser ───────────────────────────────────────────────────────────────────

interface Frame {
    tag: string;
    props: Record<string, unknown>;
    children: ReactNode[];
}

/**
 * Converts a controlled HTML string (produced by the markup pipeline) into
 * React nodes, eliminating any need for <code>dangerouslySetInnerHTML</code>.
 *
 * Only tags from {@link ALLOWED_TAGS} are rendered; anything else is silently dropped,
 * so stray HTML that somehow bypassed escaping has no effect.
 *
 * @param html {text} The HTML string to convert, e.g. "Hello <b>world</b>! Visit <a href='https://example.com'>my site</a>."
 * @returns {ReactNode} The corresponding React nodes, e.g. ["Hello ", <b>world</b>, "! Visit ", <a href='https://example.com'>my site</a>, "."]
 */
export const htmlToReactNode = (html: string): ReactNode => {
    if (!html) return null;

    const stack: Frame[] = [{ tag: '__root__', props: {}, children: [] }];
    const tagRe: RegExp = /<\/?([a-zA-Z]+)([^>]*)>/g;
    let lastIndex: number = 0;
    let key: number = 0;

    /**
     * Gets the current frame (the one we're adding children to). Always at least the root frame is present.
     * @return {Frame} The current frame on top of the stack, which has the structure {@link Frame}
     */
    const top = (): Frame => stack[stack.length - 1];

    /**
     * Pushes a text node onto the current frame's children, after decoding HTML entities.
     * @param raw {string} The raw text to push, which may contain HTML entities like &amp; that need decoding
     */
    const pushText = (raw: string): void => {
        const text: string = decodeEntities(raw);
        if (text) top().children.push(text);
    };

    /**
     * Closes the current frame by popping it from the stack and creating a React element from its tag, props, and children,
     * then pushing that element onto the new top frame's children. If the stack only has the root frame, this does nothing.
     */
    const closeFrame = (): void => {
        if (stack.length <= 1) return;
        const { tag, props, children } = stack.pop()!;
        top().children.push(createElement(tag, { ...props, key: key++ }, ...children));
    };

    let match: RegExpExecArray | null;
    while ((match = tagRe.exec(html)) !== null) {
        if (match.index > lastIndex) pushText(html.slice(lastIndex, match.index));

        const fullTag: string = match[0];
        const tagName: string = match[1].toLowerCase();
        const attrStr: string = match[2];
        lastIndex = tagRe.lastIndex;

        if (!ALLOWED_TAGS.has(tagName)) continue;

        if (fullTag.startsWith('</')) {
            closeFrame();
        } else if (fullTag.endsWith('/>') || tagName === 'br') {
            const props = toReactProps(tagName, parseAttrs(attrStr));
            top().children.push(createElement(tagName, { ...props, key: key++ }));
        } else {
            stack.push({ tag: tagName, props: toReactProps(tagName, parseAttrs(attrStr)), children: [] });
        }
    }

    if (lastIndex < html.length) pushText(html.slice(lastIndex));

    // Close any tags that were left open (e.g. partial typewriter snapshot)
    while (stack.length > 1) closeFrame();

    const { children } = stack[0];
    if (children.length === 0) return null;
    if (children.length === 1) return children[0];
    return createElement(Fragment, null, ...children);
}
