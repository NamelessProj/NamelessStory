import type {CharacterType, Sprite} from "../../../interfaces/interfaces.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from "./style.module.css";

interface CharacterFullSpriteProps {
    sprite: Sprite;
    currentDialogueIndex: number;
    characterId?: string; // Optional character ID to directly specify which character's sprite to use
}

const CharacterFullSprite = ({sprite, characterId: characterIdOverride}: CharacterFullSpriteProps) => {
    const {script} = useDataContext();
    const spriteName: string = sprite.name;
    // Use the provided character ID if given; otherwise search for the first character
    // that has the requested sprite variant or an idle fallback
    const characterId: string | undefined = characterIdOverride ?? Object.keys(script.characters).find(key => {
        const char: CharacterType = script.characters[key];
        return char.sprite && (char.sprite[spriteName] || char.sprite["idle"]);
    });

    const character: CharacterType | null = characterId ? script.characters[characterId] : null;
    const spriteUrl: string = character?.sprite?.[spriteName] || character?.sprite?.["idle"] || "";

    /**
     * Determines the CSS class for sprite positioning based on the sprite's position property.
     */
    const getPositionClass = (): string => {
        if (sprite.position?.name === "left") return styles.spriteLeft;
        if (sprite.position?.name === "right") return styles.spriteRight;
        return styles.spriteCenter;
    };

    return (
        <div className={`${styles.characterSprite} ${getPositionClass()}`}>
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
};

export default CharacterFullSprite;
