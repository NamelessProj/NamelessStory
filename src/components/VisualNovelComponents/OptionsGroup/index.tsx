import {memo} from "react";
import UserOption from "../UserOption";
import type {Option} from "../../../interfaces/interfaces.ts";
import styles from './style.module.css';

interface OptionsGroupProps {
    options: Option[];
    handleClick: (value: string) => void;
}

const OptionsGroup = memo(({options, handleClick}: OptionsGroupProps) => {
    return (
        <div className={styles.vnOptionsContainer}>
            {options.map((option: Option) => (
                <UserOption
                    text={option.text}
                    onClick={(): void => handleClick(option.next)}
                    key={option.next || option.text}
                />
            ))}
        </div>
    );
});

export default OptionsGroup;
