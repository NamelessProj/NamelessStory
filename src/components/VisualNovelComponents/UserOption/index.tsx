import * as React from "react";

interface UserOptionProps {
    text: string;
    onClick?: () => void;
}

const UserOption: React.FC<UserOptionProps> = ({text, onClick = null}) => {
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
