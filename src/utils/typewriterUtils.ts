import type {CharacterType, NameDisplay, PauseMap, Token, VariableType} from "../interfaces/interfaces.ts";
import {PAUSE_SYMBOL} from "./constants.ts";

export default class TypewriterUtils {
    static splitTextWithPauses = (text: string, pauseMap: PauseMap): Token[] => {
        const tokens: Token[] = [];
        let buffer: string = "";

        for (let i: number = 0; i < text.length; i++) {
            const currentChar: string = text[i];
            const nextChar: string = text[i + 1] || "";

            if (currentChar === PAUSE_SYMBOL && nextChar && pauseMap[nextChar] !== undefined) {
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

        if (buffer) tokens.push({ type: "text", value: buffer });

        return tokens;
    }

    static tokenizeHtmlWithPauses = (html: string, pauseMap: PauseMap): Token[] => {
        const tokens: Token[] = [];
        const tagRegex: RegExp = /<\/?[^>]+>/g;

        let lastIndex: number = 0;
        let match: RegExpExecArray | null;

        while ((match = tagRegex.exec(html)) !== null) {
            if (match.index > lastIndex) {
                tokens.push(
                    ...this.splitTextWithPauses(html.slice(lastIndex, match.index), pauseMap)
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
                ...this.splitTextWithPauses(html.slice(lastIndex), pauseMap)
            );
        }

        return tokens;
    }

    static getTagName = (tag: string): string | null => {
        const tagRegex: RegExp = /^<\s*\/?\s*([a-zA-Z0-9-]+)/;
        const match: RegExpMatchArray | null = tag.match(tagRegex);
        return match ? match[1] : null;
    }

    static buildHtmlUntilStep = (tokens: Token[], currentStep: number): string => {
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
                        const tagName: string | null = this.getTagName(token.value);
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

    static countSteps = (tokens: Token[]): number => {
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

    static getDelayForStep = (tokens: Token[], currentStep: number, defaultSpeed: number): number => {
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

    static getTextWithCharacters = (text: string, characters: Record<string, CharacterType>, variables: Record<string, VariableType>, defaultNameDisplaySetting: NameDisplay = "short"): string => {
        const regex: RegExp = /{{([vcC]!)?([a-zA-Z0-9]+)}}/g;

        return text.replace(regex, (match: string, prefix: string | undefined, id: string): string => {
            const char: CharacterType | undefined = characters[id];
            const vars: VariableType | undefined = variables[id];

            if (!char && !vars) return match;

            let result: string | undefined;

            switch (prefix?.slice(0, -1)) {
                case "C": {
                    result = `<span class="character-name-${id}" style="color: ${char.color}">${char.fullName}</span>`;
                    break;
                }
                case "c": {
                    result = `<span class="character-name-${id}" style="color: ${char.color}">${char.name}</span>`;
                    break;
                }
                case "v": {
                    if (char) {
                        result = `<span class="character-name-${id}" style="color: ${char.color}">${vars.value}</span>`;
                    } else {
                        result = vars.color ? `<span class="variable-${id}" style="color: ${vars.color}">${vars.value}</span>` : vars.value;
                    }
                    break;
                }
                default: {
                    let name: string | undefined = defaultNameDisplaySetting === "full" ? char.fullName : char.name;
                    name = name || char.name;
                    result = `<span class="character-name-${id}" style="color: ${char.color}">${name}</span>`;
                    break;
                }
            }

            return result || match;
        });
    }
}