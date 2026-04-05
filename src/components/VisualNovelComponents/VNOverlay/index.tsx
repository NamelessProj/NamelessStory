import './style.css';
import * as React from "react";
import type {Page} from "../../../interfaces/interfaces.ts";

interface VNOverlayProps {
    saveFunc: () => void;
    setPage: (page: Page) => void;
    onNextDialogue: () => void;
    canAdvance: boolean;
    isOverlayHidden: boolean;
    setIsOverlayHidden: (hidden: boolean) => void;
}

const VNOverlay: React.FC<VNOverlayProps> = ({
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
            // Escape to toggle overlay
            else if (event.key === "Escape") {
                setIsOverlayHidden(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOverlayHidden, canAdvance, onNextDialogue, setIsOverlayHidden]);

    if (isOverlayHidden) {
        return (
            <div className="vn-overlay-toggle" onClick={() => setIsOverlayHidden(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12h22M1 12l5-5m-5 5l5 5" />
                </svg>
            </div>
        );
    }

    return (
        <div className="vn-overlay show">
            <div className="overlay-top">
                <div className="overlay-title">Visual Novel</div>
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
    );
};

export default VNOverlay;
