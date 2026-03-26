import * as React from "react";
import type {VariableType} from "../../../interfaces/interfaces.ts";

const UserInput: React.FC<{ userInput: VariableType, input: string, setInput: (value: string, variableName: string, color?: string) => void }> = ({userInput, input, setInput}) => {
    return (
        <div className="user-input-wrapper">
            <input
                value={input}
                onChange={(e): void => setInput(e.target.value, userInput.value, userInput.color ?? undefined)}
            />
        </div>
    );
};

export default UserInput;