import {memo, useMemo} from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, DialoguePosition, NameDisplay, TransitionPhase} from "../../../interfaces/interfaces.ts";
import {getNameToDisplay, resolveCharacterFromName} from "../../../utils/nameUtils.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from "./style.module.css";

interface DialogueProps {
    text: string;
    textSpeed: number;
    name: string;
    nameDisplay: NameDisplay;
    position: DialoguePosition;
    onTypingComplete?: () => void;
    isOverlayHidden?: boolean;
    dialogueTransitionPhase?: TransitionPhase;
}

const positionClass: Record<DialoguePosition, string> = {
    bottom: styles.positionBottom,
    top: styles.positionTop,
    center: styles.positionCenter,
};

const DialogueBox = memo(({
    text,
    textSpeed,
    name,
    nameDisplay,
    position,
    onTypingComplete,
    isOverlayHidden,
    dialogueTransitionPhase,
}: DialogueProps) => {
    const {script, state} = useDataContext();

    const nameToDisplay: string | undefined = useMemo(
        () => getNameToDisplay(name, nameDisplay, script.characters, state.variables),
        [name, nameDisplay, script.characters, state.variables]
    );

    const resolved: { characterId: string, character: CharacterType } | undefined = useMemo(
        () => resolveCharacterFromName(name, script.characters, state.variables),
        [name, script.characters, state.variables]
    );

    const nameColor: string = resolved ? resolved.character.color : state.defaultNameColor;

    const innerAnimClass: string = useMemo(() => {
        if (dialogueTransitionPhase === "out") return styles.dialogueFadeOut;
        if (dialogueTransitionPhase === "in")  return styles.dialogueFadeIn;
        return "";
    }, [dialogueTransitionPhase]);

    return (
        <div className={`${styles.dialogueContainer} ${positionClass[position]} ${isOverlayHidden ? styles.hidden : ''}`}>
            <div className={`${styles.dialogueInner} ${innerAnimClass}`}>
                {nameToDisplay && nameToDisplay !== "" && (
                    <div className={styles.dialogueName} style={{color: nameColor}}>
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
        </div>
    );
});

export default DialogueBox;
