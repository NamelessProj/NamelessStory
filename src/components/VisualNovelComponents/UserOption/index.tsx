import styles from './style.module.css';

interface UserOptionProps {
    text: string;
    onClick?: () => void;
}

const UserOption = ({text, onClick = undefined}: UserOptionProps) => {
    /**
     * Handles the click event on the user option button. If an onClick function is provided, it will be called when the button is clicked.
     * If no onClick function is provided, the button will simply do nothing when clicked.
     */
    const handleClick = (): void => {
        if (onClick) onClick();
    };

    return (
        <button className={styles.vnUserOption} onClick={handleClick}>
            <span>{text}</span>
        </button>
    );
};

export default UserOption;
