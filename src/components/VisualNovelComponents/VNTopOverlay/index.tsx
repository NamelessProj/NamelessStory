import * as React from "react";

import "./style.css";

interface VNOverlayProps {
    isOverlayHidden: boolean;
}

const VNTopOverlay: React.FC<VNOverlayProps> = ({isOverlayHidden}) => {
    return (
        <div className={`vn-overlay vn-overlay-top ${isOverlayHidden ? "hidden" : "show"}`}>

        </div>
    );
};

export default VNTopOverlay;