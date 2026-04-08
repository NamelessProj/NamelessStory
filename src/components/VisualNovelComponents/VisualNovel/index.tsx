import * as React from "react";
import type {State, VariableType, VNStory} from "../../../interfaces/interfaces.ts";
import Scene from "../Scene";
import VNTopOverlay from "../VNTopOverlay";
import VNBottomOverlay from "../VNBottomOverlay";

import './style.css';

interface VisualNovelProps {
    script: VNStory;
    state: State;
    setState: (state: State) => void;
}

const VisualNovel: React.FC<VisualNovelProps> = ({script, state, setState}) => {
    const [isOverlayHidden, setIsOverlayHidden] = React.useState<boolean>(false);

    // Handle advancing to next dialogue
    const handleAdvance = React.useCallback((): void => {
        if (state.currentDialogueIndex < state.currentDialogueIndexMax) {
            setState({
                ...state,
                currentDialogueIndex: state.currentDialogueIndex + 1
            });
        } else {
            // End of scene, go to next scene if specified
            const currentDialogue = script.story[state.currentScene].dialogues[state.currentDialogueIndex];
            if (currentDialogue.next) {
                setState({
                    ...state,
                    currentScene: currentDialogue.next,
                    currentDialogueIndex: 0
                });
            }
        }
    }, [state, setState, script]);

    // Handle option selection
    const handleOptionSelect = React.useCallback((next: string): void => {
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
            newMaxIndex = script.story[state.currentScene].dialogues.length - 1;
        }

        const newDialogueIndex: number = state.currentDialogueIndexMax >= tempIndex ? tempIndex : state.currentDialogueIndex;

        setState({
            ...state,
            currentScene: newScene,
            currentDialogueIndex: newDialogueIndex,
            currentDialogueIndexMax: newMaxIndex,
            waitingOnOptionSelection: false
        });
    }, [state, setState, script]);

    // Handle user input
    const handleInput = React.useCallback((value: string, variableName: string, color?: string): void => {
        const newVariable: Record<string, VariableType> = {
            [variableName]: {
                value: value,
                color: color
            }
        };

        setState({
            ...state,
            variables: {...state.variables, ...newVariable},
            waitingOnUserInput: false
        });
    }, [state, setState]);

    // Check if user can advance (typing must be complete, no options or inputs pending)
    const canAdvance = !state.isTyping && !state.waitingOnOptionSelection && !state.waitingOnUserInput;

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (isOverlayHidden) return;

            // Spacebar or Enter to advance
            if (event.code === "Space" || event.code === "Enter") {
                if (canAdvance) {
                    handleAdvance();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOverlayHidden, canAdvance, handleAdvance, setIsOverlayHidden]);

    const handleClick = (): void => {
        if (isOverlayHidden) setIsOverlayHidden(false);
    }

    return (
        <div
            id="vn-game-wrapper"
            className="h-100"
            onClick={handleClick}
        >
            <VNTopOverlay isOverlayHidden={isOverlayHidden} />

            <Scene
                script={script}
                state={state}
                onAdvance={handleAdvance}
                onHandleOptionSelect={handleOptionSelect}
                onHandleInput={handleInput}
            />

            <VNBottomOverlay
                saveFunc={() => console.log("Save function not implemented")}
                setPage={(page) => console.log(`Page change to ${page} not implemented`)}
                isOverlayHidden={isOverlayHidden}
                setIsOverlayHidden={setIsOverlayHidden}
            />
        </div>
    );
};

export default VisualNovel;
