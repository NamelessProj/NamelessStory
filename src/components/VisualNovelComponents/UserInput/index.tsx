import * as React from "react";
import type {VariableType} from "../../../interfaces/interfaces.ts";

interface UserInputBoxProps {
    userInput: VariableType;
    input: string;
    setInput: (value: string, variableName: string, color?: string) => void;
}

const UserInputBox: React.FC<UserInputBoxProps> = ({userInput, input, setInput}) => {
    return (
        <div className="vn-input-container">
            <div className="vn-input-wrapper">
                <span className="vn-input-label" style={{color: userInput.color}}>
                    {userInput.value}:
                </span>
                <input
                    className="vn-input"
                    type="text"
                    value={input}
                    onChange={(e): void => setInput(e.target.value, userInput.value, userInput.color ?? undefined)}
                    autoFocus={true}
                    placeholder={`Enter your ${userInput.value}...`}
                />
            </div>
            <button className="vn-input-submit">
                Confirm
            </button>
        </div>
    );
};

export default UserInputBox;
