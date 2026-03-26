import * as React from "react";

const UserOption: React.FC<{ text: string, onClick?: () => void }> = ({text, onClick = null}) => {
    const handleClick = (): void => {
        if (onClick) onClick();
    }

    return (
        <button
            className="user-option"
            onClick={handleClick}
        >
            <span>
                {text}
            </span>
        </button>
    );
};

export default UserOption;