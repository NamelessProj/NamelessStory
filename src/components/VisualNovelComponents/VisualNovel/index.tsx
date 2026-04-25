import {useCallback, useState, useRef, useEffect, type RefObject} from "react";
import type {
    Dialogue,
    DialogueTransition,
    HistoryEntry,
    Page,
    SceneTransition,
    SceneType,
    State,
    TransitionInfo,
    TransitionPhase,
    TypewriterState
} from "../../../interfaces/interfaces.ts";
import Scene from "../Scene";
import VNTopOverlay from "../VNTopOverlay";
import VNBottomOverlay from "../VNBottomOverlay";
import TransitionOverlay from "../TransitionOverlay";
import { useBGM } from "../../../hooks/useBGM";
import {
    ADVANCE_THRESHOLD_MS,
    DEFAULT_HISTORY_LIMIT,
    DEFAULT_TRANSITION_DURATION_MS,
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

/** Returned by resolveDialogueAdvance to describe the next state and whether to navigate to credits. */
interface AdvanceResult {
    /** Partial state fields to merge into the full state via spread. */
    nextState: Partial<State>;
    /** When true, the caller should navigate to the credits page. */
    goToCredits: boolean;
}

const IDLE_TRANSITION: TransitionInfo = { phase: "idle", type: "none", target: "scene" };

const VisualNovel = ({onChangePage}: VisualNovelProps) => {
    const {script, state, setState} = useDataContext();
    const {typewriterState, setTypewriterState} = useTypewriterContext();
    const [isOverlayHidden, setIsOverlayHidden] = useState<boolean>(false);
    const [transitionInfo, setTransitionInfo] = useState<TransitionInfo>(IDLE_TRANSITION);

    const lastTypingCompleteRef: RefObject<number> = useRef<number>(0);
    const transitionPhaseRef = useRef<TransitionPhase>("idle");

    // Refs mirror live values so callbacks don't need them as deps and remain stable
    const stateRef: RefObject<State> = useRef<State>(state);
    const typewriterStateRef: RefObject<TypewriterState> = useRef<TypewriterState>(typewriterState);
    const isOverlayHiddenRef: RefObject<boolean> = useRef<boolean>(isOverlayHidden);
    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { typewriterStateRef.current = typewriterState; }, [typewriterState]);
    useEffect(() => { isOverlayHiddenRef.current = isOverlayHidden; }, [isOverlayHidden]);

    const transitionDuration: number = script.settings.transitionDuration ?? DEFAULT_TRANSITION_DURATION_MS;

    // Sync the CSS variable so animation durations match the JS timer
    useEffect(() => {
        document.documentElement.style.setProperty("--vn-transition-duration", `${transitionDuration / 2}ms`);
    }, [transitionDuration]);

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

    /** Resets the typewriter to play the next dialogue from the beginning. */
    const resetTypewriter = useCallback((): void => {
        setTypewriterState({ isTyping: true, skipTyping: false });
    }, [setTypewriterState]);

    /**
     * Resolves the next dialogue state after a linear advance (not an option select).
     * Handles advancing within the current scene or jumping to the next one.
     */
    const resolveDialogueAdvance = useCallback((s: State, history: HistoryEntry[]): AdvanceResult => {
        if (s.currentDialogueIndex < s.currentDialogueIndexMax) {
            const nextIndex: number = s.currentDialogueIndex + 1;
            const nextDialogue: Dialogue = script.story[s.currentScene].dialogues[nextIndex];
            return {
                nextState: { history, currentDialogueIndex: nextIndex, waitingOnUserInput: nextDialogue?.input !== undefined },
                goToCredits: false
            };
        }
        const dialogue: Dialogue = script.story[s.currentScene].dialogues[s.currentDialogueIndex];
        const next: string | undefined = dialogue.next;
        if (next && next !== END_STORY_TOKEN) {
            const firstDialogue: Dialogue = script.story[next].dialogues[0];
            return {
                nextState: { history, currentScene: next, currentDialogueIndex: 0, currentDialogueIndexMax: script.story[next].dialogues.length - 1, waitingOnUserInput: firstDialogue?.input !== undefined },
                goToCredits: false
            };
        }
        return { nextState: { history, waitingOnUserInput: false }, goToCredits: true };
    }, [script]);

    /** Reads <code>stateRef.current</code> so it doesn't depend on state and remains stable. */
    const handleCookieSave = useCallback((): void => {
        const cookieName: string = getCookieName(script.settings.titlePage.title);
        saveWorkerRef.current?.postMessage({ state: stateRef.current, cookieName });
    }, [script]);

    /**
     * Runs a transition animation then executes action at the midpoint (when content swaps).
     * Blocks any further input for the full duration of the transition.
     * @param type - The transition style to play.
     * @param target - Whether this is a scene or dialogue transition.
     * @param action - The state update to run at the midpoint.
     * @param duration - Total transition duration in ms (split equally into out + in phases).
     */
    const runTransition = useCallback((
        type: SceneTransition | DialogueTransition,
        target: "scene" | "dialogue",
        action: () => void,
        duration: number
    ): void => {
        if (type === "none") {
            action();
            return;
        }

        const half: number = duration / 2;
        transitionPhaseRef.current = "out";
        setTransitionInfo({ phase: "out", type, target });

        setTimeout(() => {
            action();
            transitionPhaseRef.current = "in";
            setTransitionInfo({ phase: "in", type, target });

            setTimeout(() => {
                transitionPhaseRef.current = "idle";
                setTransitionInfo(IDLE_TRANSITION);
            }, half);
        }, half);
    }, []);

    const handleBack = useCallback((): void => {
        if (transitionPhaseRef.current !== "idle") return;
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
        resetTypewriter();
    }, [script, setState, resetTypewriter]);

    const handleExportSave = useCallback((): void => {
        exportSaveFile(stateRef.current, script.settings.titlePage.title);
        handleCookieSave();
    }, [script, handleCookieSave]);

    const handleTypingComplete = useCallback((): void => {
        lastTypingCompleteRef.current = Date.now();
        setTypewriterState({isTyping: false, skipTyping: false});
    }, [setTypewriterState]);

    const handleAdvance = useCallback((): void => {
        const s: State = stateRef.current;
        const ts: TypewriterState = typewriterStateRef.current;

        if (s.waitingOnUserInput) return;
        if (transitionPhaseRef.current !== "idle") return;
        if (isOverlayHiddenRef.current) return;

        if (ts.isTyping) {
            setTypewriterState({isTyping: true, skipTyping: true});
            return;
        }

        if (Date.now() - lastTypingCompleteRef.current < ADVANCE_THRESHOLD_MS) return;

        const newHistory: HistoryEntry[] = pushHistory(s.history, s.currentScene, s.currentDialogueIndex);
        const { nextState, goToCredits }: AdvanceResult = resolveDialogueAdvance(s, newHistory);

        const isSceneChange: boolean = !goToCredits
            && nextState.currentScene !== undefined
            && nextState.currentScene !== s.currentScene;

        let transType: SceneTransition | DialogueTransition;
        let transTarget: "scene" | "dialogue";

        if (goToCredits) {
            transTarget = "scene";
            const currentDialogue: Dialogue = script.story[s.currentScene]?.dialogues[s.currentDialogueIndex];
            transType = currentDialogue?.transition ?? script.settings.defaultSceneTransition ?? "none";
        } else if (isSceneChange) {
            transTarget = "scene";
            transType = script.story[nextState.currentScene!]?.transition ?? script.settings.defaultSceneTransition ?? "none";
        } else {
            transTarget = "dialogue";
            const nextIndex: number = nextState.currentDialogueIndex ?? s.currentDialogueIndex;
            const nextDialogue: Dialogue = script.story[s.currentScene]?.dialogues[nextIndex];
            transType = nextDialogue?.transition ?? script.settings.defaultDialogueTransition ?? "none";
        }

        runTransition(transType, transTarget, () => {
            if (goToCredits) {
                onChangePage?.("credits");
            } else {
                setState({ ...s, ...nextState });
                resetTypewriter();
            }
            handleCookieSave();
        }, transitionDuration);
    }, [onChangePage, pushHistory, setState, setTypewriterState, handleCookieSave, resetTypewriter, resolveDialogueAdvance, runTransition, script, transitionDuration]);

    const handleOptionSelect = useCallback((next: string): void => {
        if (transitionPhaseRef.current !== "idle") return;
        const s: State = stateRef.current;

        const currentSceneId: string = s.currentScene;
        let newScene: string = s.currentScene;
        let tempIndex: number = 0;
        let newMaxIndex: number = s.currentDialogueIndexMax;
        const radix: number = 10;

        if (next === END_STORY_TOKEN) {
            const currentDialogue: Dialogue = script.story[s.currentScene]?.dialogues[s.currentDialogueIndex];
            const transType: SceneTransition = currentDialogue?.transition ?? script.settings.defaultSceneTransition ?? "none";
            runTransition(transType, "scene", () => onChangePage?.("credits"), transitionDuration);
            return;
        }

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

        let transType: SceneTransition | DialogueTransition;
        let transTarget: "scene" | "dialogue";

        if (currentSceneId !== newScene) {
            transTarget = "scene";
            transType = script.story[newScene]?.transition ?? script.settings.defaultSceneTransition ?? "none";
        } else {
            transTarget = "dialogue";
            transType = targetDialogue?.transition ?? script.settings.defaultDialogueTransition ?? "none";
        }

        runTransition(transType, transTarget, () => {
            setState({
                ...s,
                history: newHistory,
                currentScene: newScene,
                currentDialogueIndex: newDialogueIndex,
                currentDialogueIndexMax: newMaxIndex,
                waitingOnOptionSelection: false,
                waitingOnUserInput: targetDialogue?.input !== undefined,
            });
            resetTypewriter();
            handleCookieSave();
        }, transitionDuration);
    }, [script, onChangePage, setState, pushHistory, handleCookieSave, resetTypewriter, runTransition, transitionDuration]);

    const handleInput = useCallback((value: string, variableName: string, color?: string): void => {
        if (transitionPhaseRef.current !== "idle") return;
        const s: State = stateRef.current;
        const updatedVariables = { ...s.variables, [variableName]: { value, color } };
        const newHistory: HistoryEntry[] = pushHistory(s.history, s.currentScene, s.currentDialogueIndex);
        const { nextState, goToCredits }: AdvanceResult = resolveDialogueAdvance(s, newHistory);

        const isSceneChange: boolean = !goToCredits
            && nextState.currentScene !== undefined
            && nextState.currentScene !== s.currentScene;

        let transType: SceneTransition | DialogueTransition;
        let transTarget: "scene" | "dialogue";

        if (goToCredits) {
            transTarget = "scene";
            const currentDialogue: Dialogue = script.story[s.currentScene]?.dialogues[s.currentDialogueIndex];
            transType = currentDialogue?.transition ?? script.settings.defaultSceneTransition ?? "none";
        } else if (isSceneChange) {
            transTarget = "scene";
            transType = script.story[nextState.currentScene!]?.transition ?? script.settings.defaultSceneTransition ?? "none";
        } else {
            transTarget = "dialogue";
            const nextIndex: number = nextState.currentDialogueIndex ?? s.currentDialogueIndex;
            const nextDialogue: Dialogue = script.story[s.currentScene]?.dialogues[nextIndex];
            transType = nextDialogue?.transition ?? script.settings.defaultDialogueTransition ?? "none";
        }

        runTransition(transType, transTarget, () => {
            setState({ ...s, ...nextState, variables: updatedVariables });
            if (goToCredits) onChangePage?.("credits");
            resetTypewriter();
            handleCookieSave();
        }, transitionDuration);
    }, [onChangePage, setState, pushHistory, handleCookieSave, resetTypewriter, resolveDialogueAdvance, runTransition, script, transitionDuration]);

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

    /** Handles the page change when the player clicks the "Return Home" button. */
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
                transitionInfo={transitionInfo}
                onAdvance={handleAdvance}
                onTypingComplete={handleTypingComplete}
                onHandleOptionSelect={handleOptionSelect}
                onHandleInput={handleInput}
            />

            <TransitionOverlay phase={transitionInfo.phase} type={transitionInfo.type} />

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
