import type {CharacterType, Sprite} from "../../../interfaces/interfaces.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import "./style.css";

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

    // Determine position class
    const getPositionClass = (): string => {
        if (sprite.position) {
            if (sprite.position.name) return `sprite-${sprite.position.name}`;
            if (sprite.position.x !== undefined) return `sprite-x-${sprite.position.x}`;
        }
        return "sprite-center";
    };

    return (
        <div className={`character-sprite ${getPositionClass()}`}>
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
