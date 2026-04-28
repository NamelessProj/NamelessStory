import {memo, useMemo} from "react";
import type {CharacterType, Sprite} from "../../../interfaces/interfaces.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from "./style.module.css";

interface CharacterFullSpriteProps {
    sprite: Sprite;
    currentDialogueIndex: number;
    characterId?: string;
}

const CharacterFullSprite = memo(({sprite, characterId: characterIdOverride}: CharacterFullSpriteProps) => {
    const {script} = useDataContext();
    const spriteName: string = sprite.name;

    const characterId: string | undefined = useMemo(() => {
        if (characterIdOverride) return characterIdOverride;
        return Object.keys(script.characters).find(key => {
            const char: CharacterType = script.characters[key];
            return char.sprite && (char.sprite[spriteName] || char.sprite["idle"]);
        });
    }, [characterIdOverride, script.characters, spriteName]);

    const character: CharacterType | null = characterId ? script.characters[characterId] : null;
    const spriteUrl: string = character?.sprite?.[spriteName] || character?.sprite?.["idle"] || "";

    const positionClass: string = useMemo(() => {
        const pos = sprite.position;
        if (pos === "left") return styles.spriteLeft;
        if (pos === "right") return styles.spriteRight;
        return styles.spriteCenter;
    }, [sprite.position]);

    const positionStyle = useMemo(() => {
        const pos = sprite.position;
        if (typeof pos !== "object" || pos === null) return undefined;
        const { x, y } = pos;
        if (x === undefined && y === undefined) return undefined;
        return {
            ...(x !== undefined && { left: `calc(50% + ${x}px)` }),
            ...(y !== undefined && { height: `${y}px` }),
        };
    }, [sprite.position]);

    const hasCustomHeight = typeof sprite.position === "object" && sprite.position !== null && sprite.position.y !== undefined;

    return (
        <div className={`${styles.characterSprite} ${positionClass}${hasCustomHeight ? ` ${styles.customHeight}` : ''}`} style={positionStyle}>
            {spriteUrl && (
                <picture>
                    <img
                        src={`../assets/${spriteUrl}`}
                        alt={character?.name || "Character"}
                        style={{ transform: sprite.mirror ? "scaleX(-1)" : "scaleX(1)" }}
                    />
                </picture>
            )}
        </div>
    );
});

export default CharacterFullSprite;
