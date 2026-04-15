import type {Page} from "../../../interfaces/interfaces.ts";

import './style.css';

interface VNOverlayProps {
    exportSaveFunc: () => void;
    onBack: () => void;
    hasHistory: boolean;
    setPage: (page: Page) => void;
    isOverlayHidden: boolean;
    setIsOverlayHidden: (hidden: boolean) => void;
}

const VNBottomOverlay = ({exportSaveFunc, onBack, hasHistory, setPage, isOverlayHidden, setIsOverlayHidden}: VNOverlayProps) => {
    return (
        <div className={`vn-overlay vn-overlay-bottom ${isOverlayHidden ? "hidden" : "show"}`}>
            <div className="buttons-wrapper">
                <button className="overlay-button" onClick={(): void => setPage("title")}>
                    Return Home
                </button>
                {hasHistory && (
                    <button className="overlay-button" onClick={onBack}>
                        Back
                    </button>
                )}
                <button className="overlay-button" onClick={exportSaveFunc}>
                    Export Save
                </button>
                <button className="overlay-button" onClick={(): void => setIsOverlayHidden(true)}>
                    Hide Overlay
                </button>
            </div>
        </div>
    );
};

export default VNBottomOverlay;
