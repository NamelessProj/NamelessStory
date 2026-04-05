import * as React from "react";
import UserOption from "../UserOption";
import type {Option} from "../../../interfaces/interfaces.ts";

interface OptionsGroupProps {
    options: Option[];
    handleClick: (value: string) => void;
}

const OptionsGroup: React.FC<OptionsGroupProps> = ({options, handleClick}) => {
    return (
        <div className="vn-options-container">
            {options.map((option: Option, i: number) => (
                <UserOption
                    text={option.text}
                    onClick={(): void => handleClick(option.next)}
                    key={i}
                />
            ))}
        </div>
    );
};

export default OptionsGroup;
