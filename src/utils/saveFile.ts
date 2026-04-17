import type {State} from "../interfaces/interfaces.ts";

/**
 * Exports the current state as a JSON file. The file name is generated from the story title, converted to lowercase, with spaces replaced by hyphens, and non-alphanumeric characters removed.
 * The currentMusic property is set to null before exporting to avoid issues with serializing audio objects.
 * @param state {State} - The current game state to be exported. This should include all relevant information about the player's progress, such as the current scene, dialogue index, inventory, and any other state variables defined in the State interface.
 * @param storyTitle {string} - The title of the story, which is used to generate the file name for the exported save file. This should be a string that represents the name of the visual novel or story being played.
 */
export const exportSaveFile = (state: State, storyTitle: string): void => {
    const saveData: string = JSON.stringify({...state, currentMusic: null}, null, 2);
    const blob = new Blob([saveData], {type: "application/json"});
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    const fileName: string = storyTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-save.json";
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Parses a JSON string from a save file and returns a State object. It validates that the required properties (currentScene and currentDialogueIndex) are present and of the correct type.
 * If the validation fails, it throws an error indicating that the save file is invalid. The currentMusic property is set to null in the returned state to ensure that any audio objects are not included in the parsed state.
 * @param json {string} - The JSON string read from a save file, which should represent the game state at the time of saving. This string is expected to be in the format produced by the exportSaveFile function, containing all relevant state information needed to restore the game to its previous state.
 * @return {string} - A State object representing the parsed game state from the save file. This object should include all necessary properties to restore the game, such as currentScene, currentDialogueIndex, inventory, variables, and any other state variables defined in the State interface. The currentMusic property will be set to null in the returned state.
 * @throws {Error} - If the JSON string does not contain the required properties or if they are of the wrong type, an error is thrown indicating that the save file is invalid. This ensures that only properly formatted save files can be loaded into the game, preventing potential issues with corrupted or malformed data.
 */
export const parseSaveFile = (json: string): State => {
    const parsed: Partial<State> = JSON.parse(json) as Partial<State>;
    if (typeof parsed.currentScene !== "string" || typeof parsed.currentDialogueIndex !== "number") {
        throw new Error("Invalid save file");
    }
    return {...parsed, currentMusic: null} as State;
}
