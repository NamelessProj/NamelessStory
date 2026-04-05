import './style.css';
import * as React from "react";
import type {Page} from "../../../interfaces/interfaces.ts";

interface VNOverlayProps {
    children?: React.ReactNode;
    saveFunc: () => void;
    setPage: (page: Page) => void;
    onNextDialogue: () => void;
    canAdvance: boolean;
    isOverlayHidden: boolean;
    setIsOverlayHidden: (hidden: boolean) => void;
}

const VNOverlay: React.FC<VNOverlayProps> = ({
    children,
    saveFunc,
    setPage,
    onNextDialogue,
    canAdvance,
    isOverlayHidden,
    setIsOverlayHidden
}) => {
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (isOverlayHidden) return;

            // Spacebar or Enter to advance
            if (event.code === "Space" || event.code === "Enter") {
                if (canAdvance) {
                    onNextDialogue();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOverlayHidden, canAdvance, onNextDialogue, setIsOverlayHidden]);

    return (
        <div className="overlay-container">
            <div className={`vn-overlay ${isOverlayHidden ? "hidden" : "show"}`}>
                <div className="overlay-top">
                    <div className="overlay-title"></div>
                </div>

                <div className="overlay-bottom">
                    <div className="buttons-wrapper">
                        <button className="overlay-button" onClick={(): void => setPage("title")}>
                            Return Home
                        </button>
                        <button className="overlay-button" onClick={saveFunc}>
                            Save
                        </button>
                        <button className="overlay-button" onClick={(): void => setIsOverlayHidden(true)}>
                            Hide Overlay
                        </button>
                    </div>
                </div>
            </div>

            {children}
        </div>
    );
};

export default VNOverlay;
