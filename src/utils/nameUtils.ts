import type {CharacterType, NameDisplay, VariableType} from "../interfaces/interfaces.ts";
import {VARIABLE_REGEX_SINGLE} from "./constants.ts";

/**
 * Resolves the character (and its ID) associated with a dialogue name field.
 *
 * Priority:
 * 1. Direct character ID (e.g., name = "Char1")
 * 2. Variable whose NAME matches a character ID (e.g., name = "{{playerName}}" and characters["playerName"] exists)
 * 3. Variable whose VALUE matches a character ID (e.g., name = "{{speaker}}" and variables["speaker"].value = "Char1")
 */
export const resolveCharacterFromName = (
    name: string,
    characters: Record<string, CharacterType>,
    variables: Record<string, VariableType>
): { characterId: string; character: CharacterType } | undefined => {
    if (!name) return undefined;

    // Direct character ID
    const direct: CharacterType = characters[name];
    if (direct) return { characterId: name, character: direct };

    // Variable pattern
    const match = name.match(VARIABLE_REGEX_SINGLE);
    if (match) {
        const variableName: string = match[2];

        // Check if the variable NAME itself matches a character ID
        const charByVarName: CharacterType = characters[variableName];
        if (charByVarName) return { characterId: variableName, character: charByVarName };

        // Check if the variable VALUE matches a character ID
        const variable: VariableType = variables[variableName];
        if (variable) {
            const charByValue = characters[variable.value];
            if (charByValue) return { characterId: variable.value, character: charByValue };
        }
    }

    return undefined;
}

/**
 * Resolves the character name to display based on the name property.
 *
 * Rules:
 * 1. If name is empty or doesn't exist, return undefined (don't display)
 * 2. If name is a character ID, display based on nameDisplay mode:
 *    - "full": use fullName if available, otherwise fall back to name
 *    - "short": use name
 * 3. If name matches a variable pattern (e.g., "{{userName}}"):
 *    - If the variable NAME matches a character ID, display the variable's value
 *    - If the variable VALUE matches a character ID, display that character's name
 *    - Otherwise, display the variable's value
 * 4. If nothing matches, return the raw name value
 */
export const getNameToDisplay = (
    name: string,
    nameDisplay: NameDisplay,
    characters: Record<string, CharacterType>,
    variables: Record<string, VariableType>
): string | undefined => {
    // If name is empty, don't display anything
    if (!name || name === "") {
        return undefined;
    }

    // Check if name matches a character ID directly
    const character: CharacterType = characters[name];

    // If it's a character, use the appropriate name based on display mode
    if (character) {
        if (nameDisplay === "full") {
            return character.fullName || character.name;
        }
        return character.name;
    }

    // Check if name matches a variable pattern (e.g., {{userName}})
    const match = name.match(VARIABLE_REGEX_SINGLE);
    if (match) {
        const prefix = match[1]; // e.g., "v!" or undefined
        const variableName = match[2];
        const variable: VariableType = variables[variableName];

        // Handle v! prefix (variable reference) - always use variable value
        if (prefix === "v!") {
            if (variable) {
                return variable.value;
            } else {
                return variableName;
            }
        }

        if (variable) {
            // If the variable NAME matches a character ID, the variable holds that
            // character's display name — show the variable's value directly
            const charByVarName: CharacterType = characters[variableName];
            if (charByVarName) {
                return variable.value;
            }

            // If the variable VALUE matches a character ID, display that character's name
            const charFromVar: CharacterType = characters[variable.value];
            if (charFromVar) {
                if (nameDisplay === "full") {
                    return charFromVar.fullName || charFromVar.name;
                }
                return charFromVar.name;
            }

            // Otherwise, return the variable's value
            return variable.value;
        }
    }

    // Fallback: return the raw name value
    return name;
}

// Export getVariableName for backwards compatibility
export const getVariableName = (variable: string): string => {
    const match = variable.match(VARIABLE_REGEX_SINGLE);
    if (match) {
        return match[2]; // Return the variable name without the prefix
    }
    return variable; // If it doesn't match the pattern, return as is
}
