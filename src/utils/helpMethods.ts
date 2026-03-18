import type {CharacterType, NameDisplay, PauseMap, Token} from "../interfaces/interfaces.ts";

export const splitTextWithPauses = (text: string, pauseMap: PauseMap): Token[] => {
    const tokens: Token[] = [];
    let buffer: string = "";

    for (let i: number = 0; i < text.length; i++) {
        const currentChar: string = text[i];
        const nextChar: string = text[i + 1] || "";

        if (currentChar === "\\" && nextChar && pauseMap[nextChar] !== undefined) {
            if (buffer) {
                tokens.push({ type: "text", value: buffer });
                buffer = "";
            }

            tokens.push({ type: "pause", duration: pauseMap[nextChar] });

            i++;
            continue;
        }

        buffer += currentChar;
    }

    if (buffer) {
        tokens.push({ type: "text", value: buffer });
    }

    return tokens;
}

export const tokenizeHtmlWithPauses = (html: string, pauseMap: PauseMap): Token[] => {
    const tokens: Token[] = [];
    const tagRegex: RegExp = /<\/?[^>]+>/g;

    let lastIndex: number = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
        if (match.index > lastIndex) {
            tokens.push(
                ...splitTextWithPauses(html.slice(lastIndex, match.index), pauseMap)
            );
        }

        const tag: string = match[0];

        if (tag.startsWith("</")) {
            tokens.push({ type: "closeTag", value: tag });
        } else if (tag.endsWith("/>")) {
            tokens.push({ type: "selfClosingTag", value: tag });
        } else {
            tokens.push({ type: "openTag", value: tag });
        }

        lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < html.length) {
        tokens.push(
            ...splitTextWithPauses(html.slice(lastIndex), pauseMap)
        );
    }

    return tokens;
}

export const getTagName = (tag: string): string | null => {
    const match = tag.match(/^<\s*\/?\s*([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
}

export const buildHtmlUntilStep = (tokens: Token[], currentStep: number): string => {
    let result: string = "";
    let remainingSteps: number = currentStep;
    const openTags: string[] = [];

    tokenLoop:
    for (const token of tokens) {
        switch (token.type) {
            case "text": {
                if (remainingSteps <= 0) break tokenLoop;

                const slice: string = token.value.slice(0, remainingSteps);
                result += slice;
                remainingSteps -= slice.length;

                if (slice.length < token.value.length) break tokenLoop;
                break;
            }
            case "pause": {
                if (remainingSteps <= 0) break tokenLoop;
                remainingSteps -= 1;
                break;
            }
            case "openTag": {
                result += token.value;
                const tagName: string | null = getTagName(token.value);
                if (tagName) openTags.push(tagName);
                break;
            }
            case "selfClosingTag": {
                result += token.value;
                break;
            }
            case "closeTag": {
                result += token.value;
                openTags.pop();
                break;
            }
            default:
                break;
        }
    }

    for (let i: number = openTags.length - 1; i >= 0; i--) {
        result += `</${openTags[i]}>`;
    }

    return result;
}

export const countSteps = (tokens: Token[]): number => {
    return tokens.reduce((total, token) => {
        switch (token.type) {
            case "text":
                return total + token.value.length;
            case "pause":
                return total + 1;
            default:
                return total;
        }
    }, 0);
}

export const getDelayForStep = (tokens: Token[], currentStep: number, defaultSpeed: number): number => {
    let traversed: number = 0;

    for (const token of tokens) {
        switch (token.type) {
            case "text": {
                const nextTraversed: number = traversed + token.value.length;
                if (currentStep < nextTraversed) return defaultSpeed;
                traversed = nextTraversed;
                break;
            }
            case "pause": {
                if (currentStep === traversed) return token.duration;
                traversed += 1;
                break;
            }
        }
    }

    return defaultSpeed;
}

export const getTextWithCharacters = (text: string, characters: Record<string, CharacterType>, defaultNameDisplaySetting: NameDisplay = "short"): string => {
    const regex: RegExp = /{{([cC]!)?([a-zA-Z0-9]+)}}/g;

    return text.replace(regex, (match: string, prefix: string | undefined, characterId: string): string => {
        const char: CharacterType | undefined = characters[characterId];
        if (!char) return match;

        let name: string | undefined;
        switch (prefix) {
            case "C!": {
                name = char.fullName;
                break;
            }
            case "c!": {
                name = char.name;
                break;
            }
            default: {
                name = defaultNameDisplaySetting === "full" ? char.fullName : char.name;
                break;
            }
        }

        return name || match;
    });
}