import UserOption from "../UserOption";
import type {Option} from "../../../interfaces/interfaces.ts";
import styles from './style.module.css';

interface OptionsGroupProps {
    options: Option[];
    handleClick: (value: string) => void;
}

const OptionsGroup = ({options, handleClick}: OptionsGroupProps) => {
    return (
        <div className={styles.vnOptionsContainer}>
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
