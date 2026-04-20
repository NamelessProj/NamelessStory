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
    const stateRef = useRef<State>(state);
    const typewriterStateRef = useRef<TypewriterState>(typewriterState);
    const isOverlayHiddenRef = useRef<boolean>(isOverlayHidden);
    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { typewriterStateRef.current = typewriterState; }, [typewriterState]);
    useEffect(() => { isOverlayHiddenRef.current = isOverlayHidden; }, [isOverlayHidden]);

    // Web Worker for off-thread cookie serialization
    const saveWorkerRef = useRef<Worker | null>(null);
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
        const cookieName = getCookieName(script.settings.titlePage.title);
        saveWorkerRef.current?.postMessage({ state: stateRef.current, cookieName });
    }, [script]);

    const handleBack = useCallback((): void => {
        const s = stateRef.current;
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

    const handleExportSave = useCallback((): void => {
        const s = stateRef.current;
        const title: string = script.settings.titlePage.title;
        exportSaveFile(s, title);
        saveWorkerRef.current?.postMessage({ state: s, cookieName: getCookieName(title) });
    }, [script]);

    const handleTypingComplete = useCallback((): void => {
        lastTypingCompleteRef.current = Date.now();
        setTypewriterState({isTyping: false, skipTyping: false});
    }, [setTypewriterState]);

    const handleAdvance = useCallback((): void => {
        const s = stateRef.current;
        const ts = typewriterStateRef.current;

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
                    const firstDialogue: Dialogue = script.story[newScene]?.dialogues[0];
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

    const handleOptionSelect = useCallback((next: string): void => {
        const s = stateRef.current;

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

    const handleInput = useCallback((value: string, variableName: string, color?: string): void => {
        const s = stateRef.current;
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

    const handleSetPage = useCallback((page: Page) => onChangePage?.(page), [onChangePage]);

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
