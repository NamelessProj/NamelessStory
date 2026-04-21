import {useCallback, useState, useRef, useEffect, type RefObject} from "react";
import type {Dialogue, HistoryEntry, Page, SceneType, State, TypewriterState} from "../../../interfaces/interfaces.ts";
import Scene from "../Scene";
import VNTopOverlay from "../VNTopOverlay";
import VNBottomOverlay from "../VNBottomOverlay";
import { useBGM } from "../../../hooks/useBGM";
import {
    ADVANCE_THRESHOLD_MS,
    DEFAULT_HISTORY_LIMIT,
    END_STORY_TOKEN,
    MAX_HISTORY_LIMIT,
    MIN_HISTORY_LIMIT
} from "../../../utils/constants.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";
import {useTypewriterContext} from "../../../hooks/useTypewriterContext.ts";
import Cookies from "../../../utils/cookies.ts";
import {getCookieName} from "../../../utils/helpMethods.ts";
import {exportSaveFile} from "../../../utils/saveFile.ts";

import styles from './style.module.css';

interface VisualNovelProps {
    onChangePage?: (page: Page) => void;
}

const VisualNovel = ({onChangePage}: VisualNovelProps) => {
    const {script, state, setState} = useDataContext();
    const {typewriterState, setTypewriterState} = useTypewriterContext();
    const [isOverlayHidden, setIsOverlayHidden] = useState<boolean>(false);

    const lastTypingCompleteRef: RefObject<number> = useRef<number>(0);

    // Refs mirror live values so callbacks don't need them as deps and remain stable
    const stateRef: RefObject<State> = useRef<State>(state);
    const typewriterStateRef: RefObject<TypewriterState> = useRef<TypewriterState>(typewriterState);
    const isOverlayHiddenRef: RefObject<boolean> = useRef<boolean>(isOverlayHidden);
    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { typewriterStateRef.current = typewriterState; }, [typewriterState]);
    useEffect(() => { isOverlayHiddenRef.current = isOverlayHidden; }, [isOverlayHidden]);

    // Web Worker for off-thread cookie serialization
    const saveWorkerRef: RefObject<Worker | null> = useRef<Worker | null>(null);
    useEffect(() => {
        const worker = new Worker(new URL('../../../workers/saveWorker.ts', import.meta.url), { type: 'module' });
        worker.addEventListener('message', (e: MessageEvent<{serialized: string; cookieName: string}>) => {
            Cookies.set(e.data.cookieName, e.data.serialized);
        });
        saveWorkerRef.current = worker;
        return () => {
            worker.terminate();
            saveWorkerRef.current = null;
        };
    }, []);

    const currentScene: SceneType = script.story[state.currentScene];

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

    // Reads stateRef.current so it doesn't depend on state and remains stable
    const handleCookieSave = useCallback((): void => {
        const cookieName: string = getCookieName(script.settings.titlePage.title);
        saveWorkerRef.current?.postMessage({ state: stateRef.current, cookieName });
    }, [script]);

    const handleBack = useCallback((): void => {
        const s: State = stateRef.current;
        if (s.history.length === 0) return;
        const prev: HistoryEntry = s.history[s.history.length - 1];
        const newHistory: HistoryEntry[] = s.history.slice(0, -1);
        const scene: SceneType = script.story[prev.sceneId];
        setState({
            ...s,
            currentScene: prev.sceneId,
            currentDialogueIndex: prev.dialogueIndex,
            currentDialogueIndexMax: scene.dialogues.length - 1,
            history: newHistory,
            waitingOnOptionSelection: false,
            waitingOnUserInput: scene.dialogues[prev.dialogueIndex]?.input !== undefined
        });
        setTypewriterState({isTyping: true, skipTyping: false});
    }, [script, setState, setTypewriterState]);

    /**
     * Handles saving the current game state to a file. When the player chooses to export their save, this function will take the current state, serialize it, and trigger a download of the save file.
     * It also sends the state to a Web Worker for off-thread cookie saving, ensuring that the player's progress is preserved both in a downloadable file and in a cookie for future sessions.
     */
    const handleExportSave = useCallback((): void => {
        const s: State = stateRef.current;
        const title: string = script.settings.titlePage.title;
        exportSaveFile(s, title);
        saveWorkerRef.current?.postMessage({ state: s, cookieName: getCookieName(title) });
    }, [script]);

    /**
     * Handles the completion of the typewriter effect for dialogue text.
     * When the typewriter effect finishes displaying the current dialogue text, this function is called to update the typewriter state, indicating that typing is complete and resetting the skipTyping flag.
     * This allows the game to know when it can allow the player to advance to the next dialogue or scene, and ensures that any logic related to typing completion (such as enabling input or options) can be triggered appropriately.
     */
    const handleTypingComplete = useCallback((): void => {
        lastTypingCompleteRef.current = Date.now();
        setTypewriterState({isTyping: false, skipTyping: false});
    }, [setTypewriterState]);

    /**
     * Handles advancing the dialogue when the player clicks or presses a key.
     * This function checks various conditions to determine whether advancing is allowed (e.g., not waiting on user input, not skipping typing, etc.) and then updates the game state to move to the next dialogue or scene as appropriate.
     * It also manages the typewriter state to control text display and ensures that the player's progress is saved to a cookie after advancing.
     */
    const handleAdvance = useCallback((): void => {
        const s: State = stateRef.current;
        const ts: TypewriterState = typewriterStateRef.current;

        if (s.waitingOnUserInput) return;
        if (isOverlayHiddenRef.current) return;

        if (ts.isTyping) {
            setTypewriterState({isTyping: true, skipTyping: true});
            return;
        }

        if (Date.now() - lastTypingCompleteRef.current < ADVANCE_THRESHOLD_MS) return;

        const newHistory: HistoryEntry[] = pushHistory(s.history, s.currentScene, s.currentDialogueIndex);

        if (s.currentDialogueIndex < s.currentDialogueIndexMax) {
            const nextIndex: number = s.currentDialogueIndex + 1;
            const nextDialogue: Dialogue = script.story[s.currentScene].dialogues[nextIndex];
            setState({
                ...s,
                history: newHistory,
                currentDialogueIndex: nextIndex,
                waitingOnUserInput: nextDialogue?.input !== undefined
            });
            setTypewriterState({isTyping: true, skipTyping: false});
        } else {
            const currentDialogue: Dialogue = script.story[s.currentScene].dialogues[s.currentDialogueIndex];
            if (currentDialogue.next) {
                if (currentDialogue.next === END_STORY_TOKEN) {
                    onChangePage?.("credits");
                } else {
                    const newScene: string = currentDialogue.next;
                    const firstDialogue: Dialogue = script.story[newScene].dialogues[0];
                    setState({
                        ...s,
                        history: newHistory,
                        currentScene: newScene,
                        currentDialogueIndex: 0,
                        currentDialogueIndexMax: script.story[newScene].dialogues.length - 1,
                        waitingOnUserInput: firstDialogue?.input !== undefined
                    });
                    setTypewriterState({isTyping: true, skipTyping: false});
                }
            } else {
                onChangePage?.("credits");
            }
        }
        handleCookieSave();
    }, [script, onChangePage, pushHistory, setState, setTypewriterState, handleCookieSave]);

    /**
     * Handles the selection of an option in the dialogue. When the player selects an option, this function determines the next scene and dialogue index based on the option's "next" value, updates the game state accordingly, and saves the updated state to a cookie. This allows for branching narratives where player choices can lead to different scenes and dialogues, and ensures that the player's progress is preserved across sessions.
     * @param next {string} The "next" value associated with the selected option. This value can take several forms:
     * - If the value is <code>\_\_end\_\_</code>, the game will navigate to the credits page.
     * - If the value is an empty string, it will advance to the next dialogue in the current scene.
     * - If the value is a number (as a string), it will jump to that dialogue index within the current scene.
     * - If the value contains a colon (e.g., <code>"sceneName:3"</code>), it will jump to the specified scene and dialogue index.
     * - If the value is a string without a colon, it will jump to the first dialogue of the specified scene.
     */
    const handleOptionSelect = useCallback((next: string): void => {
        const s: State = stateRef.current;

        if (next === END_STORY_TOKEN) {
            onChangePage?.("credits");
            return;
        }

        const currentSceneId: string = s.currentScene;
        let newScene: string = s.currentScene;
        let tempIndex: number = 0;
        let newMaxIndex: number = s.currentDialogueIndexMax;
        const radix: number = 10;

        if (next === "") {
            tempIndex = s.currentDialogueIndex + 1;
        } else if (!isNaN(Number(next))) {
            tempIndex = parseInt(next, radix);
        } else if (next.includes(":")) {
            const [sceneName, indexStr] = next.split(":");
            newScene = sceneName;
            tempIndex = parseInt(indexStr, radix);
        } else {
            newScene = next;
        }

        if (currentSceneId !== newScene) {
            newMaxIndex = script.story[newScene].dialogues.length - 1;
        }

        const newDialogueIndex: number = newMaxIndex >= tempIndex ? tempIndex : 0;
        const targetDialogue: Dialogue = script.story[newScene]?.dialogues[newDialogueIndex];
        const newHistory: HistoryEntry[] = pushHistory(s.history, s.currentScene, s.currentDialogueIndex);

        setState({
            ...s,
            history: newHistory,
            currentScene: newScene,
            currentDialogueIndex: newDialogueIndex,
            currentDialogueIndexMax: newMaxIndex,
            waitingOnOptionSelection: false,
            waitingOnUserInput: targetDialogue?.input !== undefined,
        });
        setTypewriterState({isTyping: true, skipTyping: false});
        handleCookieSave();
    }, [script, onChangePage, setState, setTypewriterState, pushHistory, handleCookieSave]);

    /**
     * Handles user input for dialogues that require it. When the player submits input, this function updates the game state with the new variable values, advances to the next dialogue or scene as appropriate, and saves the updated state to a cookie.
     * This allows for dynamic storytelling where player choices can influence the narrative and be preserved across sessions.
     * @param value {string} The value of the user input. This is typically the text that the player has entered in response to a prompt in the dialogue.
     * @param variableName {string} The name of the variable that should be updated with the user's input. This variable can then be used in the script to influence future dialogues, options, or conditions based on the player's input.
     * @param color {string?} An optional color value that can be associated with the variable. This can be used for display purposes, such as showing the player's name in a specific color when they input it.
     */
    const handleInput = useCallback((value: string, variableName: string, color?: string): void => {
        const s: State = stateRef.current;
        const updatedVariables = { ...s.variables, [variableName]: { value, color } };
        const newHistory: HistoryEntry[] = pushHistory(s.history, s.currentScene, s.currentDialogueIndex);

        if (s.currentDialogueIndex < s.currentDialogueIndexMax) {
            const nextIndex: number = s.currentDialogueIndex + 1;
            const nextDialogue: Dialogue = script.story[s.currentScene].dialogues[nextIndex];
            setState({
                ...s,
                history: newHistory,
                variables: updatedVariables,
                currentDialogueIndex: nextIndex,
                waitingOnUserInput: nextDialogue?.input !== undefined
            });
        } else {
            const currentDialogue: Dialogue = script.story[s.currentScene].dialogues[s.currentDialogueIndex];
            if (currentDialogue.next && currentDialogue.next !== END_STORY_TOKEN) {
                const newScene: string = currentDialogue.next;
                const firstDialogue: Dialogue = script.story[newScene]?.dialogues[0];
                setState({
                    ...s,
                    history: newHistory,
                    variables: updatedVariables,
                    currentScene: newScene,
                    currentDialogueIndex: 0,
                    currentDialogueIndexMax: script.story[newScene].dialogues.length - 1,
                    waitingOnUserInput: firstDialogue?.input !== undefined
                });
            } else {
                setState({ ...s, history: newHistory, variables: updatedVariables, waitingOnUserInput: false });
                onChangePage?.("credits");
            }
        }
        setTypewriterState({isTyping: true, skipTyping: false});
        handleCookieSave();
    }, [script, onChangePage, setState, setTypewriterState, pushHistory, handleCookieSave]);

    // Stable — handleAdvance reads refs, no tick-sensitive deps here
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (typewriterStateRef.current.skipTyping) return;
            if (stateRef.current.waitingOnOptionSelection) return;
            if (event.code === "Space" || event.code === "Enter") {
                handleAdvance();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return (): void => { window.removeEventListener("keydown", handleKeyDown); };
    }, [handleAdvance]);

    /**
     * Handles the page change when the player clicks the "Back" button.
     */
    const handleSetPage = useCallback((page: Page) => onChangePage?.(page), [onChangePage]);

    /**
     * Handles clicks on the main game wrapper. If the overlay is currently hidden, this function will set it to be visible again.
     * This allows players to click anywhere on the game area to bring back the UI overlay if they have hidden it, ensuring that they can always access important information and controls when needed.
     */
    const handleClick = useCallback((): void => {
        if (isOverlayHiddenRef.current) setIsOverlayHidden(false);
    }, []);

    if (!currentScene) return null;

    return (
        <div
            id="vn-game-wrapper"
            className={`${styles.gameWrapper} h-100`}
            onClick={handleClick}
        >
            <VNTopOverlay isOverlayHidden={isOverlayHidden} />

            <Scene
                isOverlayHidden={isOverlayHidden}
                onAdvance={handleAdvance}
                onTypingComplete={handleTypingComplete}
                onHandleOptionSelect={handleOptionSelect}
                onHandleInput={handleInput}
            />

            <VNBottomOverlay
                exportSaveFunc={handleExportSave}
                onBack={handleBack}
                hasHistory={state.history.length > 0}
                setPage={handleSetPage}
                isOverlayHidden={isOverlayHidden}
                setIsOverlayHidden={setIsOverlayHidden}
            />
        </div>
    );
};

export default VisualNovel;
