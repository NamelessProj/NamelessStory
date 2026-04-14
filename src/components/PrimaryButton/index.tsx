interface PrimaryButtonProps {
    text: string;
    isDisabled?: boolean;
    onClick: () => void;
}

const PrimaryButton = ({text, isDisabled=false, onClick}: PrimaryButtonProps) => {
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

export default PrimaryButton;