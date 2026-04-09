import * as React from "react";

import "./style.css";
import type {State} from "../../../interfaces/interfaces.ts";
import VolumeSlider from "../../VolumeSlider";

interface VNOverlayProps {
    isOverlayHidden: boolean;
    state: State;
    setState: (state: State) => void;
}

const VNTopOverlay: React.FC<VNOverlayProps> = ({isOverlayHidden, state, setState}) => {
    return (
        <div className={`vn-overlay vn-overlay-top ${isOverlayHidden ? "hidden" : "show"}`}>
            <VolumeSlider state={state} setState={setState} />
        </div>
    );
};

export default VNTopOverlay;