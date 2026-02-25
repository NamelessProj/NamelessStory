import * as React from "react";

const Index: React.FC<{ text: string, isDisabled?: boolean, onClick: () => void }> = ({text, isDisabled=false, onClick}) => {
    const handleClick: () => void = () => {if (!isDisabled) onClick();}

    return (
        <div className="button-wrapper">
            <button
                className={`primary-button ${isDisabled ? "disabled" : ""}`}
                onClick={handleClick}
                disabled={isDisabled}
            >
                {text}
            </button>
        </div>
    );
};

export default Index;