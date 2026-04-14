import * as React from "react";
import Typewriter from "../../Typewriter";
import type {CharacterType, NameDisplay} from "../../../interfaces/interfaces.ts";
import {getNameToDisplay, resolveCharacterFromName} from "../../../utils/nameUtils.ts";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import "./style.css";

interface DialogueProps {
    text: string;
    textSpeed: number;
    name: string;
    nameDisplay: NameDisplay;
    onTypingComplete?: () => void;
}

const DialogueBox = ({
    text,
    textSpeed,
    name,
    nameDisplay,
    onTypingComplete
}: DialogueProps) => {
    const {script, state} = useDataContext();

    // Get the resolved name to display
    const nameToDisplay: string | undefined = React.useMemo(() => {
        return getNameToDisplay(
            name,
            nameDisplay,
            script.characters,
            state.variables
        );
    }, [name, nameDisplay, script.characters, state.variables]);

    // Find character for color — checks direct ID, variable name, and variable value
    const resolved: { characterId: string, character: CharacterType } | undefined = React.useMemo(() => {
        return resolveCharacterFromName(name, script.characters, state.variables);
    }, [name, script.characters, state.variables]);

    const nameColor: string = resolved ? resolved.character.color : state.defaultNameColor;

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
