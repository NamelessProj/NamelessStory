import * as React from "react";
import type {Option} from "../../../interfaces/interfaces.ts";
import UserOption from "../UserOption";

const OptionsGroup: React.FC<{ options: Option[], handleClick: (value: string) => void }> = ({options, handleClick}) => {
    return (
        <div className="options-group">
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