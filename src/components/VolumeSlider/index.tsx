import {type ChangeEvent, useState} from "react";
import {useDataContext} from "../../hooks/useDataContext.ts";

import "./style.css";

const VolumeSlider = () => {
    const {state, setState} = useDataContext();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    // Handle volume change
    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const newVolume: number = parseFloat(e.target.value);

        // Update the audio element's volume if it exists
        if (state.currentMusic) {
            state.currentMusic.volume = newVolume;
        }

        setState({
            ...state,
            musicVolume: newVolume
        });
    };

    // Handle mute toggle - click on the icon
    const handleMuteToggle = (): void => {
        const isMuted: boolean = !state.isMusicMuted;
        if (state.currentMusic) {
            if (isMuted) {
                state.currentMusic.volume = 0;
            } else {
                state.currentMusic.volume = state.musicVolume;
            }
        }
        setState({
            ...state,
            isMusicMuted: isMuted
        });
    };

    return (
        <div
            className="volume-control"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                className="volume-icon"
                onClick={handleMuteToggle}
                type="button"
                title={state.isMusicMuted ? "Unmute" : "Mute"}
            >
                {state.isMusicMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                ) : state.musicVolume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                )}
            </button>
            {isHovered && (
                <div className="volume-slider-container">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={state.musicVolume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                        title={`Volume: ${(state.musicVolume * 100).toFixed(0)}%`}
                    />
                </div>
            )}
        </div>
    );
};

export default VolumeSlider;
