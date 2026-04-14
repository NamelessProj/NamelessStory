import * as React from "react";

import "./style.css";
import VolumeSlider from "../../VolumeSlider";

interface VNOverlayProps {
    isOverlayHidden: boolean;
}

const VNTopOverlay: React.FC<VNOverlayProps> = ({isOverlayHidden}) => {
    return (
        <div className={`vn-overlay vn-overlay-top ${isOverlayHidden ? "hidden" : "show"}`}>
            <VolumeSlider />
        </div>
    );
};

export default VNTopOverlay;
