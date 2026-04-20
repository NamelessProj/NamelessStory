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
        if (sprite.position?.name === "left") return styles.spriteLeft;
        if (sprite.position?.name === "right") return styles.spriteRight;
        return styles.spriteCenter;
    }, [sprite.position?.name]);

    return (
        <div className={`${styles.characterSprite} ${positionClass}`}>
            {spriteUrl && (
                <img
                    src={`../assets/${spriteUrl}`}
                    alt={character?.name || "Character"}
                    style={{
                        transform: sprite.mirror ? "scaleX(-1)" : "scaleX(1)",
                        height: sprite.position?.y !== undefined ? `${sprite.position.y}px` : "auto"
                    }}
                />
            )}
        </div>
    );
});

export default CharacterFullSprite;
