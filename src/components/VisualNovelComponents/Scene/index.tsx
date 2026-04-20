import {memo, useMemo} from "react";
import BackgroundImage from "../../BackgroundImage";
import CharacterFullSprite from "../CharacterFullSprite";
import DialogueBox from "../Dialogue";
import OptionsGroup from "../OptionsGroup";
import UserInputBox from "../UserInput";
import type {CharacterType, Dialogue, DialoguePosition, SceneType, Sprite} from "../../../interfaces/interfaces.ts";
import {resolveCharacterFromName} from "../../../utils/nameUtils.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from './style.module.css';

interface SceneProps {
    isOverlayHidden: boolean;
    onAdvance: () => void;
    onTypingComplete: () => void;
    onHandleOptionSelect: (nextScene: string) => void;
    onHandleInput: (value: string, variableName: string, color?: string) => void;
}

const Scene = memo(({
    isOverlayHidden,
    onAdvance,
    onTypingComplete,
    onHandleOptionSelect,
    onHandleInput
}: SceneProps) => {
    const {script, state} = useDataContext();
    const currentScene: SceneType | undefined = script.story[state.currentScene];
    const currentDialogue: Dialogue | undefined = currentScene?.dialogues[state.currentDialogueIndex];

    const resolvedSpeaker: { characterId: string, character: CharacterType } | undefined = useMemo(
        () => currentDialogue ? resolveCharacterFromName(currentDialogue.name, script.characters, state.variables) : undefined,
        [currentDialogue, script.characters, state.variables]
    );

    const spriteToShow: Sprite | undefined = useMemo(
        () => currentDialogue?.sprite ?? (resolvedSpeaker?.character.sprite ? { name: "idle" } : undefined),
        [currentDialogue, resolvedSpeaker]
    );

    const dialoguePosition: DialoguePosition = useMemo(
        () => currentDialogue?.dialoguePosition ?? script.settings.defaultDialoguePosition ?? "bottom",
        [currentDialogue, script.settings.defaultDialoguePosition]
    );

    if (!currentScene || !currentDialogue) return null;

    const shouldShowDialogue: boolean = currentDialogue.name !== "" || currentDialogue.text !== "";
    const shouldShowOptions: boolean = !!(currentDialogue.options && currentDialogue.options.length > 0);
    const shouldShowInput: boolean = currentDialogue.input !== undefined;

    /**
     * Handles advancing the dialogue when the player clicks on the scene.
     * This function checks if options or input are currently being displayed, and if not, it calls the onAdvance function passed in as a prop to move to the next dialogue or scene.
     */
    const handleClick = (): void => {
        if (shouldShowOptions || shouldShowInput) return;
        onAdvance();
    };

    return (
        <div id="vn-scene" className={styles.vnScene} onClick={handleClick}>
            <BackgroundImage fileName={currentScene.background} id="vn-background" />

            {spriteToShow && (
                <CharacterFullSprite
                    sprite={spriteToShow}
                    currentDialogueIndex={state.currentDialogueIndex}
                    characterId={resolvedSpeaker?.characterId}
                />
            )}

            {shouldShowDialogue && (
                <DialogueBox
                    text={currentDialogue.text}
                    textSpeed={currentDialogue.textSpeed || script.settings.textSpeed || 50}
                    name={currentDialogue.name}
                    nameDisplay={currentDialogue.nameDisplay || script.settings.defaultNameDisplay || "short"}
                    position={dialoguePosition}
                    onTypingComplete={onTypingComplete}
                    isOverlayHidden={isOverlayHidden}
                />
            )}

            {shouldShowOptions && (
                <OptionsGroup
                    options={currentDialogue.options!}
                    handleClick={onHandleOptionSelect}
                />
            )}

            {(shouldShowInput && currentDialogue.input) && (
                <UserInputBox
                    variable={currentDialogue.input}
                    setVariable={onHandleInput}
                />
            )}
        </div>
    );
});

export default Scene;
