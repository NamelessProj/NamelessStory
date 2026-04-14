interface UserOptionProps {
    text: string;
    onClick?: () => void;
}

const UserOption = ({text, onClick = undefined}: UserOptionProps) => {
    const handleClick = (): void => {
        if (onClick) onClick();
    };

    return (
        <button className="vn-user-option" onClick={handleClick}>
            <span>{text}</span>
        </button>
    );
};

export default UserOption;
