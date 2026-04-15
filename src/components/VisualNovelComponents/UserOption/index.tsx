import styles from './style.module.css';

interface UserOptionProps {
    text: string;
    onClick?: () => void;
}

const UserOption = ({text, onClick = undefined}: UserOptionProps) => {
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
