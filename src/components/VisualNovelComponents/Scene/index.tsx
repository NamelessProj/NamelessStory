import BackgroundImage from "../../BackgroundImage";
import CharacterFullSprite from "../CharacterFullSprite";
import DialogueBox from "../Dialogue";
import OptionsGroup from "../OptionsGroup";
import UserInputBox from "../UserInput";
import type {CharacterType, Dialogue, SceneType, Sprite} from "../../../interfaces/interfaces.ts";
import {resolveCharacterFromName} from "../../../utils/nameUtils.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from './style.module.css';

interface SceneProps {
    onAdvance: () => void;
    onTypingComplete: () => void;
    onHandleOptionSelect: (nextScene: string) => void;
    onHandleInput: (value: string, variableName: string, color?: string) => void;
}

const Scene = ({
    onAdvance,
    onTypingComplete,
    onHandleOptionSelect,
    onHandleInput
}: SceneProps) => {
    const {script, state} = useDataContext();
    const currentScene: SceneType | undefined = script.story[state.currentScene];
    const currentDialogue: Dialogue | undefined = currentScene?.dialogues[state.currentDialogueIndex];

    // If scene or dialogue doesn't exist, don't render
    if (!currentScene || !currentDialogue) {
        return null;
    }

    // Resolve the character associated with the current dialogue's name field
    const resolvedSpeaker: { characterId: string, character: CharacterType } | undefined = resolveCharacterFromName(
        currentDialogue.name,
        script.characters,
        state.variables
    );

    // Use the explicit sprite from the dialogue, or auto-generate an idle sprite
    // when the speaker is a character resolved via a variable and has sprites defined
    const spriteToShow: Sprite | undefined = currentDialogue.sprite ?? (
        resolvedSpeaker && resolvedSpeaker.character.sprite
            ? { name: "idle" }
            : undefined
    );

    // Check if we should show dialogue box
    const shouldShowDialogue: boolean = currentDialogue.name !== "" || currentDialogue.text !== "";

    // Check if we should show options
    const shouldShowOptions: boolean | undefined = currentDialogue.options && currentDialogue.options.length > 0;

    // Check if we should show user input
    const shouldShowInput: boolean = currentDialogue.input !== undefined;

    // Handle click to advance — typing skip and threshold are handled inside onAdvance
    const handleClick = (): void => {
        if (shouldShowOptions) return;
        if (shouldShowInput) return;
        onAdvance();
    };

    return (
        <div
            id="vn-scene"
            className={styles.vnScene}
            onClick={handleClick}
        >
            {/* Background */}
            <BackgroundImage fileName={currentScene.background} id="vn-background" />

            {/* Characters/Sprites */}
            {spriteToShow && (
                <CharacterFullSprite
                    sprite={spriteToShow}
                    currentDialogueIndex={state.currentDialogueIndex}
                    characterId={resolvedSpeaker?.characterId}
                />
            )}

            {/* Dialogue Box */}
            {shouldShowDialogue && (
                <DialogueBox
                    text={currentDialogue.text}
                    textSpeed={currentDialogue.textSpeed || script.settings.textSpeed || 50}
                    name={currentDialogue.name}
                    nameDisplay={currentDialogue.nameDisplay || script.settings.defaultNameDisplay || "short"}
                    onTypingComplete={onTypingComplete}
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
