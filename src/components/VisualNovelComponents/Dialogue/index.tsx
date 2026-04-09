import * as React from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, NameDisplay, State, VNStory} from "../../../interfaces/interfaces.ts";
import TypewriterUtils from "../../../utils/typewriterUtils.ts";

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
    // Process the name through the typewriter utils to resolve variables
    const processedName = React.useMemo(() => {
        return TypewriterUtils.getTextWithCharacters(
            name,
            characters,
            state.variables,
            nameDisplay
        );
    }, [name, characters, state.variables, nameDisplay]);

    // Find character by name or color to get character info
    const characterID: string = script.story[state.currentScene].dialogues[state.currentDialogueIndex].name;
    const character: CharacterType = characters[characterID];

    const nameColor = character ? character.color : state.defaultNameColor;

    let nameToDisplay: string | undefined = "";

    if (name && name !== "") {
        nameToDisplay = name;
        if (character) {
            nameToDisplay = nameDisplay === "full" ? character.fullName : character.name;
            if (typeof nameToDisplay === "undefined") {
                nameToDisplay = character.name || "";
            }
        }
    }

    return (
        <div className="vn-dialogue-container">
            {/* Character Name */}
            {(processedName || nameToDisplay !== "") && (
                <div
                    className="vn-dialogue-name"
                    style={{color: nameColor}}
                >
                    {processedName ?? nameToDisplay}
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