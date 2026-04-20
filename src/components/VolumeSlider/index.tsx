import {memo, type ChangeEvent, useState} from "react";
import {useDataContext} from "../../hooks/useDataContext.ts";
import {audioRef} from "../../utils/audioRef.ts";

import styles from "./style.module.css";

const VolumeSlider = memo(() => {
    const {state, setState} = useDataContext();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const newVolume: number = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.volume = newVolume;
        setState(prev => ({ ...prev, musicVolume: newVolume }));
    };

    const handleMuteToggle = (): void => {
        const isMuted: boolean = !state.isMusicMuted;
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : state.musicVolume;
        }
        setState(prev => ({ ...prev, isMusicMuted: isMuted }));
    };

    return (
        <div
            className={styles.volumeControl}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                className={styles.volumeIcon}
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
                <div className={styles.volumeSliderContainer}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={state.musicVolume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                        title={`Volume: ${(state.musicVolume * 100).toFixed(0)}%`}
                    />
                </div>
            )}
        </div>
    );
});

export default VolumeSlider;
