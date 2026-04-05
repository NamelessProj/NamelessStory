import * as React from "react";
import type {State, VNStory} from "../../../interfaces/interfaces.ts";
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
    const handleOptionSelect = React.useCallback((nextScene: string): void => {
        setState({
            ...state,
            currentScene: nextScene,
            currentDialogueIndex: 0,
            waitingOnOptionSelection: false
        });
    }, [state, setState]);

    // Handle user input
    const handleInput = React.useCallback((value: string, variableName: string, color?: string): void => {
        const newVariable: Record<string, State["variables"][string]> = {
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
