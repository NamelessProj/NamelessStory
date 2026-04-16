import type {CharacterType, NameDisplay, PauseMap, Token, VariableType} from "../interfaces/interfaces.ts";
import {PAUSE_SYMBOL, VARIABLE_REGEX} from "./constants.ts";

export default class TypewriterUtils {
    /**
     * Splits text into tokens of text and pauses based on a provided pause map.
     * @param text {string} - The input text containing potential pause symbols.
     * @param pauseMap {PauseMap} - A mapping of characters following the pause symbol to their corresponding pause durations.
     * @returns {Token[]} An array of tokens representing the split text and pauses.
     */
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

    /**
     * Tokenizes an HTML string into a sequence of tokens representing text, pauses, and HTML tags.
     * @param html {string} - The input HTML string to tokenize.
     * @param pauseMap {PauseMap} - A mapping of characters following the pause symbol to their corresponding pause durations.
     * @returns {Token[]} An array of tokens representing the tokenized HTML content.
     */
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

    /**
     * Extracts the tag name from an HTML tag string.
     * @param tag {string} - The HTML tag string to extract the name from.
     * @returns {string | null} The extracted tag name, or null if the input is not a valid tag.
     */
    static getTagName = (tag: string): string | null => {
        const tagRegex: RegExp = /^<\s*\/?\s*([a-zA-Z0-9-]+)/;
        const match: RegExpMatchArray | null = tag.match(tagRegex);
        return match ? match[1] : null;
    }

    /**
     * Builds an HTML string from a sequence of tokens up to a specified step, ensuring that all opened tags are properly closed.
     * @param tokens {Token[]} - The array of tokens to build the HTML from.
     * @param currentStep {number} - The current step up to which the HTML should be built, counting text characters and pauses.
     * @returns {string} The resulting HTML string that represents the content up to the specified step, with all opened tags properly closed.
     */
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

    /**
     * Counts the total number of steps represented by an array of tokens, where each text character counts as one step and each pause counts as one step.
     * @param tokens {Token[]} - The array of tokens to count steps from.
     * @returns {number} The total number of steps represented by the tokens.
     */
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

    /**
     * Determines the appropriate delay for the current step in a typewriter effect based on the provided tokens, the current step, and a default speed. It accounts for both text characters and pause tokens to calculate the correct delay.
     * @param tokens {Token[]} - The array of tokens representing the text and pauses.
     * @param currentStep {number} - The current step in the typewriter effect, counting text characters and pauses.
     * @param defaultSpeed {number} - The default delay in milliseconds for each step when no pause tokens are encountered.
     * @returns {number} The calculated delay in milliseconds for the current step, accounting for any pause tokens at that step.
     */
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

    /**
     * Replaces variable references in the input text with their corresponding values, applying character-specific styling when applicable.
     * It supports both character and variable references, allowing for dynamic text generation based on the provided characters and variables.
     * The function also takes into account a default name display setting to determine how character names should be displayed when referenced.
     * @param text {string} - The input text containing variable references in the format of {C!id}, {c!id}, or {v!id}, where "id" is the identifier for a character or variable.
     * @param characters {Record<string, CharacterType>} - A mapping of character IDs to their corresponding CharacterType objects, which contain information such as name and color.
     * @param variables {Record<string, VariableType>} - A mapping of variable IDs to their corresponding VariableType objects, which contain information such as value and color.
     * @param defaultNameDisplaySetting {NameDisplay} - A setting that determines how character names should be displayed when referenced without an explicit display type (e.g., "short" for name or "full" for fullName).
     * @returns {string} The resulting text with variable references replaced by their corresponding values and styled according to the character's color when applicable.
     */
    static getTextWithCharacters = (text: string, characters: Record<string, CharacterType>, variables: Record<string, VariableType>, defaultNameDisplaySetting: NameDisplay = "short"): string => {
        return text.replace(VARIABLE_REGEX, (match: string, prefix: string | undefined, id: string): string => {
            const char: CharacterType | undefined = characters[id];
            const vars: VariableType | undefined = variables[id];

            // Handle v! prefix (variable reference with optional color)
            if (prefix === "v!") {
                if (vars) {
                    // If the variable name matches a character ID, use that character's color
                    const color = char ? char.color : vars.color;
                    if (color) {
                        return `<span class="variable-${id}" style="color: ${color}">${vars.value || id}</span>`;
                    }
                    return vars.value || id;
                }
                return id;
            }

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
                default: {
                    // If both a character and a variable share the same ID, show the variable's
                    // value styled with the character's color
                    if (char && vars) {
                        result = `<span class="variable-${id}" style="color: ${char.color}">${vars.value || id}</span>`;
                        break;
                    }
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