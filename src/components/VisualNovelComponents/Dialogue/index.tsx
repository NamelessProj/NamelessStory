import {memo, useMemo} from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, DialoguePosition, NameDisplay, Sprite, TransitionPhase} from "../../../interfaces/interfaces.ts";
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
    portraitSprite?: Sprite;
    portraitCharacterId?: string;
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
    portraitSprite,
    portraitCharacterId,
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

    const portraitUrl: string = useMemo(() => {
        if (!portraitSprite) return "";
        const spriteName = portraitSprite.name;
        const char = portraitCharacterId
            ? script.characters[portraitCharacterId]
            : resolved?.character;
        return char?.sprite?.[spriteName] || char?.sprite?.["idle"] || "";
    }, [portraitSprite, portraitCharacterId, script.characters, resolved]);

    const portraitSide: "left" | "right" = useMemo(() => {
        const pos = portraitSprite?.position;
        if (!pos) return "left";
        // Support both object {name: "right"} and plain string "right" from JSON
        const posName = pos.name ?? (pos as unknown as string);
        return posName === "right" ? "right" : "left";
    }, [portraitSprite?.position]);

    const hasPortrait = !!(portraitSprite && portraitUrl);

    return (
        <div className={`${styles.dialogueContainer} ${positionClass[position]} ${isOverlayHidden ? styles.hidden : ''}`}>
            <div className={`${styles.dialogueInner} ${innerAnimClass}`}>
                {hasPortrait ? (
                    <div className={`${styles.dialogueWithPortrait} ${portraitSide === "right" ? styles.portraitOnRight : ""}`}>
                        <div className={styles.dialoguePortrait}>
                            <img
                                src={`../assets/${portraitUrl}`}
                                alt={nameToDisplay || "Character"}
                                style={{ transform: portraitSprite!.mirror ? "scaleX(-1)" : "scaleX(1)" }}
                            />
                        </div>
                        <div className={styles.dialogueContent}>
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
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
});

export default DialogueBox;
