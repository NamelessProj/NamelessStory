import {useCallback, useState, useRef, useEffect} from "react";
import type {HistoryEntry, Page, SceneType} from "../../../interfaces/interfaces.ts";
import Scene from "../Scene";
import VNTopOverlay from "../VNTopOverlay";
import VNBottomOverlay from "../VNBottomOverlay";
import { useBGM } from "../../../hooks/useBGM";
import {ADVANCE_THRESHOLD_MS, DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT, MIN_HISTORY_LIMIT} from "../../../utils/constants.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";
import Cookies from "../../../utils/cookies.ts";
import {getCookieName} from "../../../utils/helpMethods.ts";
import {exportSaveFile} from "../../../utils/saveFile.ts";
import type {RefObject} from "react";

import styles from './style.module.css';

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

    const historyLimit: number = Math.min(
        MAX_HISTORY_LIMIT,
        Math.max(MIN_HISTORY_LIMIT, script.settings.historyLimit ?? DEFAULT_HISTORY_LIMIT)
    );

    const pushHistory = useCallback((history: HistoryEntry[], sceneId: string, dialogueIndex: number): HistoryEntry[] => {
        if (historyLimit === 0) return history;
        const entry: HistoryEntry = {sceneId, dialogueIndex};
        const next: HistoryEntry[] = [...history, entry];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    }, [historyLimit]);

    const handleBack = useCallback((): void => {
        if (state.history.length === 0) return;
        const prev: HistoryEntry = state.history[state.history.length - 1];
        const newHistory: HistoryEntry[] = state.history.slice(0, -1);
        const scene: SceneType = script.story[prev.sceneId];
        setState({
            ...state,
            currentScene: prev.sceneId,
            currentDialogueIndex: prev.dialogueIndex,
            currentDialogueIndexMax: scene.dialogues.length - 1,
            history: newHistory,
            isTyping: true,
            skipTyping: false,
            waitingOnOptionSelection: false,
            waitingOnUserInput: scene.dialogues[prev.dialogueIndex]?.input !== undefined
        });
    }, [state, setState, script]);

    const handleCookieSave = useCallback((): void => {
        const title: string = script.settings.titlePage.title;
        const saveData: string = JSON.stringify({...state, currentMusic: null});
        Cookies.set(getCookieName(title), saveData);
    }, [state, script]);

    const handleExportSave = useCallback((): void => {
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

        const newHistory: HistoryEntry[] = pushHistory(state.history, state.currentScene, state.currentDialogueIndex);

        if (state.currentDialogueIndex < state.currentDialogueIndexMax) {
            const nextIndex = state.currentDialogueIndex + 1;
            const nextDialogue = script.story[state.currentScene].dialogues[nextIndex];
            setState({
                ...state,
                history: newHistory,
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
                        history: newHistory,
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
        handleCookieSave(); // Auto-save on advance
    }, [state, setState, script, onChangePage, isOverlayHidden, handleCookieSave, pushHistory]);

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
        const newHistory: HistoryEntry[] = pushHistory(state.history, state.currentScene, state.currentDialogueIndex);

        setState({
            ...state,
            history: newHistory,
            currentScene: newScene,
            currentDialogueIndex: newDialogueIndex,
            currentDialogueIndexMax: newMaxIndex,
            waitingOnOptionSelection: false,
            waitingOnUserInput: targetDialogue?.input !== undefined,
            isTyping: true,
            skipTyping: false
        });
        handleCookieSave(); // Auto-save on option selection
    }, [state, setState, script, onChangePage, handleCookieSave, pushHistory]);

    // Handle user input — store variable then auto-advance
    const handleInput = useCallback((value: string, variableName: string, color?: string): void => {
        const updatedVariables = {
            ...state.variables,
            [variableName]: { value, color }
        };
        const newHistory: HistoryEntry[] = pushHistory(state.history, state.currentScene, state.currentDialogueIndex);

        if (state.currentDialogueIndex < state.currentDialogueIndexMax) {
            const nextIndex = state.currentDialogueIndex + 1;
            const nextDialogue = script.story[state.currentScene].dialogues[nextIndex];
            setState({
                ...state,
                history: newHistory,
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
                    history: newHistory,
                    variables: updatedVariables,
                    currentScene: newScene,
                    currentDialogueIndex: 0,
                    currentDialogueIndexMax: script.story[newScene].dialogues.length - 1,
                    isTyping: true,
                    skipTyping: false,
                    waitingOnUserInput: firstDialogue?.input !== undefined
                });
            } else {
                setState({ ...state, history: newHistory, variables: updatedVariables, waitingOnUserInput: false });
                onChangePage?.("credits");
            }
        }
        handleCookieSave(); // Auto-save on user input
    }, [state, setState, script, onChangePage, handleCookieSave, pushHistory]);

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
            className={`${styles.gameWrapper} h-100`}
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
                exportSaveFunc={handleExportSave}
                onBack={handleBack}
                hasHistory={state.history.length > 0}
                setPage={(page) => onChangePage?.(page)}
                isOverlayHidden={isOverlayHidden}
                setIsOverlayHidden={setIsOverlayHidden}
            />
        </div>
    );
};

export default VisualNovel;
