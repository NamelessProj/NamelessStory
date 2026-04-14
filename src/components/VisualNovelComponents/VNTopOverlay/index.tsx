import VolumeSlider from "../../VolumeSlider";

import "./style.css";

interface VNOverlayProps {
    isOverlayHidden: boolean;
}

const VNTopOverlay = ({isOverlayHidden}: VNOverlayProps) => {
    return (
        <div className={`vn-overlay vn-overlay-top ${isOverlayHidden ? "hidden" : "show"}`}>
            <VolumeSlider />
        </div>
    );
};

export default VNTopOverlay;
