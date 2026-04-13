import * as React from "react";

// Styles
import "./style.css";
import type {Sprite, VNStory} from "../../../interfaces/interfaces.ts";

const CharacterFullSprite: React.FC<{
    script: VNStory;
    sprite: Sprite;
    currentDialogueIndex: number;
    characterId?: string;
}> = ({script, sprite, characterId: characterIdOverride}) => {
    const spriteName = sprite.name;
    // Use the provided character ID if given; otherwise search for the first character
    // that has the requested sprite variant or an idle fallback
    const characterId = characterIdOverride ?? Object.keys(script.characters).find(key => {
        const char = script.characters[key];
        return char.sprite && (char.sprite[spriteName] || char.sprite["idle"]);
    });

    const character = characterId ? script.characters[characterId] : null;
    const spriteUrl = character?.sprite?.[spriteName] || character?.sprite?.["idle"] || "";

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
