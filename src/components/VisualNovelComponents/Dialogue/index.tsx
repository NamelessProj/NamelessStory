import * as React from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, NameDisplay, State, VNStory} from "../../../interfaces/interfaces.ts";

// Styles
import "./style.css";

interface DialogueProps {
    text: string;
    textSpeed: number;
    name: string;
    nameDisplay: NameDisplay;
    characters: Record<string, CharacterType>;
    script: VNStory;
    state: State;
    onTypingComplete?: () => void;
}

const DialogueBox: React.FC<DialogueProps> = ({
    text,
    textSpeed,
    name,
    nameDisplay,
    characters,
    script,
    state,
    onTypingComplete
}) => {
    // Find character by name or color to get character info
    const characterID = script.story[state.currentScene].dialogues[state.currentDialogueIndex].name;
    const character: CharacterType = characters[characterID];

    const nameColor = character ? character.color : state.defaultNameColor;

    return (
        <div className="vn-dialogue-container">
            {/* Character Name */}
            {name && name !== "" && (
                <div
                    className="vn-dialogue-name"
                    style={{color: nameColor}}
                >
                    {nameDisplay === "full" && character ? character.fullName : character.name}
                </div>
            )}

            <div className="vn-dialogue-box">
                <Typewriter
                    text={text}
                    speed={textSpeed}
                    onComplete={onTypingComplete}
                    script={script}
                    state={state}
                    className="vn-dialogue-text"
                />
            </div>
        </div>
    );
};

export default DialogueBox;