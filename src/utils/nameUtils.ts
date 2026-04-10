import type {CharacterType, NameDisplay, VariableType} from "../interfaces/interfaces.ts";

/**
 * Resolves the character name to display based on the name property.
 *
 * Rules:
 * 1. If name is empty or doesn't exist, return undefined (don't display)
 * 2. If name is a character ID, display based on nameDisplay mode:
 *    - "full": use fullName if available, otherwise fall back to name
 *    - "short": use name
 * 3. If name is a variable reference (e.g., "userName"):
 *    - If the variable value matches a character ID, display that character's name
 *    - Otherwise, display the variable's value
 * 4. If nothing matches, return the raw name value
 */
export function getNameToDisplay(
    name: string,
    nameDisplay: NameDisplay,
    characters: Record<string, CharacterType>,
    variables: Record<string, VariableType>
): string | undefined {
    // If name is empty, don't display anything
    if (!name || name === "") {
        return undefined;
    }

    // Check if name matches a character ID
    const character = characters[name];

    // If it's a character, use the appropriate name based on display mode
    if (character) {
        if (nameDisplay === "full") {
            return character.fullName || character.name;
        }
        return character.name;
    }

    // Check if name matches a variable
    const variable = variables[name];
    if (variable) {
        // If the variable value matches a character ID, display that character's name
        const charFromVar = characters[variable.value];
        if (charFromVar) {
            if (nameDisplay === "full") {
                return charFromVar.fullName || charFromVar.name;
            }
            return charFromVar.name;
        }
        // Otherwise, return the variable's value
        return variable.value;
    }

    // Fallback: return the raw name value
    return name;
}
