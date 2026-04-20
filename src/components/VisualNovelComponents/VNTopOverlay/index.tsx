import {memo} from "react";
import VolumeSlider from "../../VolumeSlider";

import styles from "./style.module.css";

interface VNOverlayProps {
    isOverlayHidden: boolean;
}

const VNTopOverlay = memo(({isOverlayHidden}: VNOverlayProps) => {
    return (
        <div className={`${styles.overlay} ${styles.overlayTop} ${isOverlayHidden ? styles.hidden : ""}`}>
            <VolumeSlider />
        </div>
    );
});

export default VNTopOverlay;
