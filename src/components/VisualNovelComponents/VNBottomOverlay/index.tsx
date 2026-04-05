import * as React from "react";
import type {Page} from "../../../interfaces/interfaces.ts";

import './style.css';

interface VNOverlayProps {
    saveFunc: () => void;
    setPage: (page: Page) => void;
    isOverlayHidden: boolean;
    setIsOverlayHidden: (hidden: boolean) => void;
}

const VNBottomOverlay: React.FC<VNOverlayProps> = ({saveFunc, setPage, isOverlayHidden, setIsOverlayHidden}) => {
    return (
        <div className={`vn-overlay vn-overlay-bottom ${isOverlayHidden ? "hidden" : "show"}`}>
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
    );
};

export default VNBottomOverlay;