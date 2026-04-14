import {useCallback, useState, useRef, useEffect} from "react";
import type {Page, SceneType} from "../../../interfaces/interfaces.ts";
import Scene from "../Scene";
import VNTopOverlay from "../VNTopOverlay";
import VNBottomOverlay from "../VNBottomOverlay";
import { useBGM } from "../../../hooks/useBGM";
import {ADVANCE_THRESHOLD_MS} from "../../../utils/constants.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";
import Cookies from "../../../utils/cookies.ts";
import {getCookieName} from "../../../utils/helpMethods.ts";
import {exportSaveFile} from "../../../utils/saveFile.ts";
import type {RefObject} from "react";

import './style.css';

interface VisualNovelProps {
    onChangePage?: (page: Page) => void;
}

const VisualNovel = ({onChangePage}: VisualNovelProps) => {
    const {script, state, setState} = useDataContext();
    const [isOverlayHidden, setIsOverlayHidden] = useState<boolean>(false);
    // Timestamp of the last time typing completed — used to enforce the advance threshold
    const lastTypingCompleteRef: RefObject<number> = useRef<number>(0);

    const currentScene: SceneType = script.story[state.currentScene];

    // Handle background music - use scene name as trigger to only play on scene entry
    useBGM({
        bgmFile: currentScene?.bgmFile,
        bgmLoop: currentScene?.bgmLoop,
        state,
        setState,
        trigger: state.currentScene
    });

    const handleSave = useCallback((): void => {
        const title: string = script.settings.titlePage.title;
        const saveData: string = JSON.stringify({...state, currentMusic: null});
        Cookies.set(getCookieName(title), saveData);
        exportSaveFile(state, title);
    }, [state, script]);

    // Called by Typewriter (via DialogueBox → Scene) when text animation finishes
    const handleTypingComplete = useCallback((): void => {
        lastTypingCompleteRef.current = Date.now();
        setState({...state, isTyping: false, skipTyping: false});
    }, [state, setState]);

    // Handle advancing to next dialogue
    const handleAdvance = useCallback((): void => {
        // Don't advance if waiting on user input
        if (state.waitingOnUserInput) return;

        // Don't advance if overlay is hidden (user needs to click to show overlay before advancing)
        if (isOverlayHidden) return;

        // If still typing, skip to the end instead of advancing
        if (state.isTyping) {
            setState({...state, skipTyping: true});
            return;
        }

        // Enforce a small delay after typing completes to prevent accidental double-press
        if (Date.now() - lastTypingCompleteRef.current < ADVANCE_THRESHOLD_MS) return;

        if (state.currentDialogueIndex < state.currentDialogueIndexMax) {
            const nextIndex = state.currentDialogueIndex + 1;
            const nextDialogue = script.story[state.currentScene].dialogues[nextIndex];
            setState({
                ...state,
                currentDialogueIndex: nextIndex,
                isTyping: true,
                skipTyping: false,
                waitingOnUserInput: nextDialogue?.input !== undefined
            });
        } else {
            // End of scene, go to next scene if specified
            const currentDialogue = script.story[state.currentScene].dialogues[state.currentDialogueIndex];
            if (currentDialogue.next) {
                if (currentDialogue.next === "__end__") {
                    onChangePage?.("credits");
                } else {
                    const newScene = currentDialogue.next;
                    const firstDialogue = script.story[newScene]?.dialogues[0];
                    setState({
                        ...state,
                        currentScene: newScene,
                        currentDialogueIndex: 0,
                        currentDialogueIndexMax: script.story[newScene].dialogues.length - 1,
                        isTyping: true,
                        skipTyping: false,
                        waitingOnUserInput: firstDialogue?.input !== undefined
                    });
                }
            } else {
                onChangePage?.("credits");
            }
        }
        handleSave(); // Auto-save on advance
    }, [state, setState, script, onChangePage, isOverlayHidden, handleSave]);

    // Handle option selection
    const handleOptionSelect = useCallback((next: string): void => {
        if (next === "__end__") {
            // End of story, show credits
            onChangePage?.("credits");
            return;
        }

        const currentScene: string = state.currentScene;
        let newScene: string = state.currentScene;
        let tempIndex: number = 0;
        let newMaxIndex: number = state.currentDialogueIndexMax;
        const radix: number = 10;

        if (next === "") {
            // Empty string: go to next index of current scene
            tempIndex = state.currentDialogueIndex + 1;
        } else if (!isNaN(Number(next))) {
            // Numeric value: stay in current scene, change dialogue index
            tempIndex = parseInt(next, radix);
        } else if (next.includes(":")) {
            // Scene:index format: change scene and dialogue index
            const [sceneName, indexStr] = next.split(":");
            newScene = sceneName;
            tempIndex = parseInt(indexStr, radix);
        } else {
            // Scene name only: change scene and start from index 0
            newScene = next;
        }

        if (currentScene !== newScene) {
            newMaxIndex = script.story[newScene].dialogues.length - 1;
        }

        const newDialogueIndex: number = newMaxIndex >= tempIndex ? tempIndex : 0;
        const targetDialogue = script.story[newScene]?.dialogues[newDialogueIndex];

        setState({
            ...state,
            currentScene: newScene,
            currentDialogueIndex: newDialogueIndex,
            currentDialogueIndexMax: newMaxIndex,
            waitingOnOptionSelection: false,
            waitingOnUserInput: targetDialogue?.input !== undefined,
            isTyping: true,
            skipTyping: false
        });
    }, [state, setState, script, onChangePage]);

    // Handle user input — store variable then auto-advance
    const handleInput = useCallback((value: string, variableName: string, color?: string): void => {
        const updatedVariables = {
            ...state.variables,
            [variableName]: { value, color }
        };

        if (state.currentDialogueIndex < state.currentDialogueIndexMax) {
            const nextIndex = state.currentDialogueIndex + 1;
            const nextDialogue = script.story[state.currentScene].dialogues[nextIndex];
            setState({
                ...state,
                variables: updatedVariables,
                currentDialogueIndex: nextIndex,
                isTyping: true,
                skipTyping: false,
                waitingOnUserInput: nextDialogue?.input !== undefined
            });
        } else {
            const currentDialogue = script.story[state.currentScene].dialogues[state.currentDialogueIndex];
            if (currentDialogue.next && currentDialogue.next !== "__end__") {
                const newScene = currentDialogue.next;
                const firstDialogue = script.story[newScene]?.dialogues[0];
                setState({
                    ...state,
                    variables: updatedVariables,
                    currentScene: newScene,
                    currentDialogueIndex: 0,
                    currentDialogueIndexMax: script.story[newScene].dialogues.length - 1,
                    isTyping: true,
                    skipTyping: false,
                    waitingOnUserInput: firstDialogue?.input !== undefined
                });
            } else {
                setState({ ...state, variables: updatedVariables, waitingOnUserInput: false });
                onChangePage?.("credits");
            }
        }
    }, [state, setState, script, onChangePage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (isOverlayHidden) return;
            if (state.waitingOnOptionSelection) return;

            if (event.code === "Space" || event.code === "Enter") {
                handleAdvance();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOverlayHidden, state.waitingOnOptionSelection, handleAdvance]);

    const handleClick = (): void => {
        if (isOverlayHidden) setIsOverlayHidden(false);
    }

    // If scene doesn't exist, a page transition is in progress — don't render
    if (!currentScene) return null;

    return (
        <div
            id="vn-game-wrapper"
            className="h-100"
            onClick={handleClick}
        >
            <VNTopOverlay
                isOverlayHidden={isOverlayHidden}
            />

            <Scene
                onAdvance={handleAdvance}
                onTypingComplete={handleTypingComplete}
                onHandleOptionSelect={handleOptionSelect}
                onHandleInput={handleInput}
            />

            <VNBottomOverlay
                saveFunc={handleSave}
                setPage={(page) => console.log(`Page change to ${page} not implemented`)}
                isOverlayHidden={isOverlayHidden}
                setIsOverlayHidden={setIsOverlayHidden}
            />
        </div>
    );
};

export default VisualNovel;
