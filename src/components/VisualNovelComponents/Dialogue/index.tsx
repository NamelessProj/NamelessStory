import {useMemo} from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, NameDisplay} from "../../../interfaces/interfaces.ts";
import {getNameToDisplay, resolveCharacterFromName} from "../../../utils/nameUtils.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from "./style.module.css";

interface DialogueProps {
    text: string;
    textSpeed: number;
    name: string;
    nameDisplay: NameDisplay;
    onTypingComplete?: () => void;
    isOverlayHidden?: boolean;
}

const DialogueBox = ({
    text,
    textSpeed,
    name,
    nameDisplay,
    onTypingComplete,
    isOverlayHidden,
}: DialogueProps) => {
    const {script, state} = useDataContext();

    // Get the resolved name to display
    const nameToDisplay: string | undefined = useMemo(() => {
        return getNameToDisplay(
            name,
            nameDisplay,
            script.characters,
            state.variables
        );
    }, [name, nameDisplay, script.characters, state.variables]);

    // Find character for color — checks direct ID, variable name, and variable value
    const resolved: { characterId: string, character: CharacterType } | undefined = useMemo(() => {
        return resolveCharacterFromName(name, script.characters, state.variables);
    }, [name, script.characters, state.variables]);

    const nameColor: string = resolved ? resolved.character.color : state.defaultNameColor;

    return (
        <div className={`${styles.dialogueContainer} ${isOverlayHidden ? styles.hidden : ''}`}>
            {/* Character Name - only display if nameToDisplay exists and is not empty */}
            {nameToDisplay && nameToDisplay !== "" && (
                <div
                    className={styles.dialogueName}
                    style={{color: nameColor}}
                >
                    {nameToDisplay}
                </div>
            )}

            <div className={styles.dialogueBox}>
                <Typewriter
                    text={text}
                    speed={textSpeed}
                    onComplete={onTypingComplete}
                    className={styles.dialogueText}
                />
            </div>
        </div>
    );
};

export default DialogueBox;
