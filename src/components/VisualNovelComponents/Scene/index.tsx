import * as React from "react";
import BackgroundImage from "../../BackgroundImage";
import CharacterFullSprite from "../CharacterFullSprite";
import DialogueBox from "../Dialogue";
import OptionsGroup from "../OptionsGroup";
import UserInputBox from "../UserInput";

// Styles
import './style.css';
import type {Dialogue, SceneType, State, VNStory} from "../../../interfaces/interfaces.ts";

interface SceneProps {
    script: VNStory;
    state: State;
    onAdvance: () => void;
    onHandleOptionSelect: (nextScene: string) => void;
    onHandleInput: (value: string, variableName: string, color?: string) => void;
}

const Scene: React.FC<SceneProps> = ({
    script,
    state,
    onAdvance,
    onHandleOptionSelect,
    onHandleInput
}) => {
    const currentScene: SceneType = script.story[state.currentScene];
    const currentDialogue: Dialogue = currentScene.dialogues[state.currentDialogueIndex];

    // Check if we should show dialogue box
    const shouldShowDialogue: boolean = currentDialogue.name !== "" || currentDialogue.text !== "";

    // Check if we should show options
    const shouldShowOptions: boolean | undefined = currentDialogue.options && currentDialogue.options.length > 0;

    // Check if we should show user input
    const shouldShowInput: boolean = currentDialogue.input !== undefined;

    // Handle click to advance
    const handleClick = (): void => {
        return;

        if (state.isTyping) {
            // If typing, complete immediately (would be handled by Typewriter)
            return;
        }
        if (shouldShowOptions) {
            // Wait for option selection
            return;
        }
        if (shouldShowInput) {
            // Wait for input
            return;
        }
        onAdvance();
    };

    return (
        <div
            id="vn-scene"
            className="vn-scene"
            onClick={handleClick}
        >
            {/* Background */}
            <BackgroundImage fileName={currentScene.background} id="vn-background" />

            {/* Characters/Sprites */}
            {currentDialogue.sprite && (
                <CharacterFullSprite
                    script={script}
                    sprite={currentDialogue.sprite}
                    currentDialogueIndex={state.currentDialogueIndex}
                />
            )}

            {/* Dialogue Box */}
            {shouldShowDialogue && (
                <DialogueBox
                    text={currentDialogue.text}
                    textSpeed={currentDialogue.textSpeed || script.settings.textSpeed || 50}
                    name={currentDialogue.name}
                    nameDisplay={currentDialogue.nameDisplay || script.settings.defaultNameDisplay || "short"}
                    characters={script.characters}
                    state={state}
                    script={script}
                />
            )}

            {/* Options */}
            {shouldShowOptions && (
                <OptionsGroup
                    options={shouldShowOptions ? currentDialogue.options! : []}
                    handleClick={onHandleOptionSelect}
                />
            )}

            {/* User Input */}
            {(shouldShowInput && currentDialogue.input) && (
                <UserInputBox
                    variable={currentDialogue.input}
                    setVariable={onHandleInput}
                />
            )}
        </div>
    );
};

export default Scene;
