import * as React from "react";

import "./style.css";
import type {State} from "../../../interfaces/interfaces.ts";

interface VNOverlayProps {
    isOverlayHidden: boolean;
    state: State;
    setState: (state: State) => void;
}

const VNTopOverlay: React.FC<VNOverlayProps> = ({isOverlayHidden, state, setState}) => {
    // Toggle music mute
    const toggleMute = (): void => {
        const newMutedState = !state.isMusicMuted;
        const newVolume = newMutedState ? 0 : state.musicVolume;

        if (state.currentMusic) {
            state.currentMusic.volume = newMutedState ? 0 : state.musicVolume;
        }

        setState({
            ...state,
            isMusicMuted: newMutedState,
            musicVolume: newVolume
        });
    };

    return (
        <div className={`vn-overlay vn-overlay-top ${isOverlayHidden ? "hidden" : "show"}`}>
            <button className="overlay-button" onClick={toggleMute}>
                {state.isMusicMuted ? "Unmute Music" : "Mute Music"}
            </button>
        </div>
    );
};

export default VNTopOverlay;