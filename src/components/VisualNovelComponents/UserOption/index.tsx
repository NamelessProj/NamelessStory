import * as React from "react";

const UserOption: React.FC<{ text: string, onClick?: () => void, className?: string }> = ({text, onClick = null, className=""}) => {
    const handleClick = (): void => {
        if (onClick) onClick();
    }

    return (
        <button
            className={`user-option ${className}`}
            onClick={handleClick}
        >
            <span>
                {text}
            </span>
        </button>
    );
};

export default UserOption;