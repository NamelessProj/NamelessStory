import {useState} from "react";
import type {VariableType} from "../../../interfaces/interfaces.ts";

interface UserInputBoxProps {
    variable: VariableType;
    setVariable: (value: string, variableName: string, color?: string) => void;
}

const UserInputBox = ({variable, setVariable}: UserInputBoxProps) => {
    const [input, setInput] = useState<string>("");
    const [isWrong, setIsWrong] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLElement>): void => {
        e.preventDefault();

        if (!input || input === "") {
            setIsWrong(true);
            setTimeout((): void => setIsWrong(false), 1000);
            return;
        }

        setVariable(input, variable.value, variable.color);
        setInput("");
    }

    return (
        <form className="vn-input-container" onSubmit={handleSubmit}>
            <div className="vn-input-wrapper">
                <input
                    className={`vn-input ${isWrong ? "vn-input-wrong" : ""}`}
                    type="text"
                    value={input}
                    onChange={(e): void => setInput(e.target.value)}
                    autoFocus={true}
                    placeholder="Type your response here..."
                />
            </div>
            <button
                className="vn-input-submit"
                type="submit"
                onClick={handleSubmit}
            >
                Confirm
            </button>
        </form>
    );
};

export default UserInputBox;
