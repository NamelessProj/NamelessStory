import type {CharacterType, NameDisplay, PauseMap, Token, VariableType} from "../interfaces/interfaces.ts";
import {PAUSE_SYMBOL, VARIABLE_REGEX} from "./constants.ts";

export default class TypewriterUtils {
    /**
     * Splits text into tokens of text and pauses based on a provided pause map.
     * @param text {string} The input text containing potential pause symbols.
     * @param pauseMap {PauseMap} A mapping of characters following the pause symbol to their corresponding pause durations.
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
     * @param html {string} The input HTML string to tokenize.
     * @param pauseMap {PauseMap} A mapping of characters following the pause symbol to their corresponding pause durations.
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
     * @param tag {string} The HTML tag string to extract the name from.
     * @returns {string | null} The extracted tag name, or null if the input is not a valid tag.
     */
    static getTagName = (tag: string): string | null => {
        const tagRegex: RegExp = /^<\s*\/?\s*([a-zA-Z0-9-]+)/;
        const match: RegExpMatchArray | null = tag.match(tagRegex);
        return match ? match[1] : null;
    }

    /**
     * Counts the total number of steps represented by an array of tokens, where each text character counts as one step and each pause counts as one step.
     * @param tokens {Token[]} The array of tokens to count steps from.
     * @returns {number} The total number of steps represented by the tokens.
     */
    static countSteps = (tokens: Token[]): number => {
        return tokens.reduce((total: number, token: Token) => {
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
     * Precomputes all HTML snapshots and per-step delays in a single O(n) pass over tokens.
     * Each index in the returned arrays corresponds to a step value:
     *
     *   htmlSnapshots[i] = the HTML string to display when currentStep === i
     *   
     *   delays[i]        = the delay in ms before advancing from step i to step i+1
     * 
     * This makes the Typewriter component O(1) per tick instead of O(n).
     * @param tokens {Token[]} - Pre-tokenised token array
     * @param speed {number} - Default delay per character in ms
     * @return {{ htmlSnapshots: string[]; delays: number[] }} Object containing precomputed htmlSnapshots and delays arrays
     */
    static precomputeSteps = (tokens: Token[], speed: number): { htmlSnapshots: string[]; delays: number[] } => {
        const total: number = TypewriterUtils.countSteps(tokens);
        const htmlSnapshots: string[] = new Array(total + 1);
        const delays: number[] = new Array(total).fill(speed);

        let result: string = "";
        const openTags: string[] = [];
        let step: number = 0;

        const snapshot = (): string => {
            if (openTags.length === 0) return result;
            let closeTags: string = "";
            for (let i: number = openTags.length - 1; i >= 0; i--) closeTags += `</${openTags[i]}>`;
            return result + closeTags;
        };

        htmlSnapshots[0] = "";

        for (const token of tokens) {
            switch (token.type) {
                case "text": {
                    for (let ci: number = 0; ci < token.value.length; ci++) {
                        delays[step] = speed;
                        result += token.value[ci];
                        step++;
                        htmlSnapshots[step] = snapshot();
                    }
                    break;
                }
                case "pause": {
                    delays[step] = token.duration;
                    step++;
                    htmlSnapshots[step] = snapshot();
                    break;
                }
                case "openTag": {
                    result += token.value;
                    const tagName: string | null = TypewriterUtils.getTagName(token.value);
                    if (tagName) openTags.push(tagName);
                    break;
                }
                case "closeTag": {
                    result += token.value;
                    openTags.pop();
                    break;
                }
                case "selfClosingTag": {
                    result += token.value;
                    break;
                }
            }
        }

        return { htmlSnapshots, delays };
    }

    /**
     * Replaces variable references in the input text with their corresponding values, styled according to the associated character's color if applicable.
     * It supports different prefixes to determine how to display the variable or character name, and it uses a default name display setting to choose between short and full names when both are available.
     * @param text {string} - The input text containing variable references that need to be replaced with their corresponding values.
     * @param characters {Record<string, CharacterType>} - A mapping of character IDs to their corresponding CharacterType objects, which contain information about the character's name, full name, color, and optional sprite.
     * @param variables {Record<string, VariableType>} - A mapping of variable IDs to their corresponding VariableType objects, which contain information about the variable's value and optional color. 
     * @param defaultNameDisplaySetting {NameDisplay} - A setting that determines whether to display the short name or full name of a character when both are available. This setting is used when the variable reference does not specify a prefix to indicate which name to use.
     * @returns {string} The resulting text with all variable references replaced by their corresponding values, styled according to the associated character's color if applicable. If a variable reference does not match any character or variable, it is returned unchanged in the output text.
     */
    static getTextWithCharacters = (text: string, characters: Record<string, CharacterType>, variables: Record<string, VariableType>, defaultNameDisplaySetting: NameDisplay = "short"): string => {
        return text.replace(VARIABLE_REGEX, (match: string, prefix: string | undefined, id: string): string => {
            const char: CharacterType | undefined = characters[id];
            const vars: VariableType | undefined = variables[id];

            // Handle v! prefix (variable reference with optional color)
            if (prefix === "v!") {
                if (vars) {
                    // If the variable name matches a character ID, use that character's color
                    const color: string | undefined = char ? char.color : vars.color;
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