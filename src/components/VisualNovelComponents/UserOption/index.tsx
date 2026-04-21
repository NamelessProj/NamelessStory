import {memo} from "react";
import styles from './style.module.css';

interface UserOptionProps {
    text: string;
    onClick?: () => void;
}

const UserOption = memo(({text, onClick = undefined}: UserOptionProps) => {
    return (
        <button type="button" className={styles.vnUserOption} onClick={onClick}>
            <span>{text}</span>
        </button>
    );
});

export default UserOption;
