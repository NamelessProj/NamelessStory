import * as React from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, NameDisplay, State, VNStory} from "../../../interfaces/interfaces.ts";
// import TypewriterUtils from "../../../utils/typewriterUtils.ts";
import {getNameToDisplay} from "../../../utils/nameUtils.ts";

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
    // Get the resolved name to display
    const nameToDisplay = React.useMemo(() => {
        return getNameToDisplay(
            name,
            nameDisplay,
            characters,
            state.variables
        );
    }, [name, nameDisplay, characters, state.variables]);

    // Find character for color (use current dialogue's character)
    const scene = script.story[state.currentScene];
    const dialogue = scene?.dialogues[state.currentDialogueIndex];
    const characterID: string = dialogue?.name || "";
    const character: CharacterType | undefined = characters[characterID];

    const nameColor = character ? character.color : state.defaultNameColor;

    return (
        <div className="vn-dialogue-container">
            {/* Character Name - only display if nameToDisplay exists and is not empty */}
            {nameToDisplay && nameToDisplay !== "" && (
                <div
                    className="vn-dialogue-name"
                    style={{color: nameColor}}
                >
                    {nameToDisplay}
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