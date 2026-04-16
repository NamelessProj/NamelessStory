import {type FormEvent, type MouseEvent, useState} from "react";
import type {VariableType} from "../../../interfaces/interfaces.ts";
import styles from './style.module.css';

interface UserInputBoxProps {
    variable: VariableType;
    setVariable: (value: string, variableName: string, color?: string) => void;
}

const UserInputBox = ({variable, setVariable}: UserInputBoxProps) => {
    const [input, setInput] = useState<string>("");
    const [isWrong, setIsWrong] = useState<boolean>(false);

    /**
     * Handles submission of user input. It validates that the input is not empty, and if valid, it calls the setVariable function passed in as a prop to update the variable in the global state.
     * If the input is invalid (empty), it triggers a visual indication of the error by setting isWrong to true temporarily.
     * @param e - The form submission event or button click event that triggers the input submission.
     */
    const handleSubmit = (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLElement>): void => {
        e.preventDefault();

        if (!input || input.trim() === "") {
            setIsWrong(true);
            setTimeout((): void => setIsWrong(false), 1000);
            return;
        }

        setVariable(input.trim(), variable.value, variable.color);
        setInput("");
    }

    return (
        <form className={styles.vnInputContainer} onSubmit={handleSubmit}>
            <div className={styles.vnInputWrapper}>
                <input
                    className={`${styles.vnInput} ${isWrong ? styles.vnInputWrong : ""}`}
                    type="text"
                    value={input}
                    onChange={(e): void => setInput(e.target.value)}
                    autoFocus={true}
                    placeholder="Type your response here..."
                />
            </div>
            <button
                className={styles.vnInputSubmit}
                type="submit"
                onClick={handleSubmit}
            >
                Confirm
            </button>
        </form>
    );
};

export default UserInputBox;
