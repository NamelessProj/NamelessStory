import type {State} from "../interfaces/interfaces.ts";

export function exportSaveFile(state: State, storyTitle: string): void {
    const saveData = JSON.stringify({...state, currentMusic: null}, null, 2);
    const blob = new Blob([saveData], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = storyTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-save.json";
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

export function parseSaveFile(json: string): State {
    const parsed = JSON.parse(json);
    if (typeof parsed.currentScene !== "string" || typeof parsed.currentDialogueIndex !== "number") {
        throw new Error("Invalid save file");
    }
    return {...parsed, currentMusic: null} as State;
}
