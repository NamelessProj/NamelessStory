import * as React from "react";
import Typewriter from "../../Typewriter";
import type {NameDisplay} from "../../../interfaces/interfaces.ts";
import {getNameToDisplay, resolveCharacterFromName} from "../../../utils/nameUtils.ts";

// Styles
import "./style.css";
import {useDataContext} from "../../../hooks/useDataContext.ts";

interface DialogueProps {
    text: string;
    textSpeed: number;
    name: string;
    nameDisplay: NameDisplay;
    onTypingComplete?: () => void;
}

const DialogueBox: React.FC<DialogueProps> = ({
    text,
    textSpeed,
    name,
    nameDisplay,
    onTypingComplete
}) => {
    const {script, state} = useDataContext();

    // Get the resolved name to display
    const nameToDisplay = React.useMemo(() => {
        return getNameToDisplay(
            name,
            nameDisplay,
            script.characters,
            state.variables
        );
    }, [name, nameDisplay, script.characters, state.variables]);

    // Find character for color — checks direct ID, variable name, and variable value
    const resolved = React.useMemo(() => {
        return resolveCharacterFromName(name, script.characters, state.variables);
    }, [name, script.characters, state.variables]);

    const nameColor = resolved ? resolved.character.color : state.defaultNameColor;

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
                    className="vn-dialogue-text"
                />
            </div>
        </div>
    );
};

export default DialogueBox;
