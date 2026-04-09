import { useEffect, useRef, useCallback } from "react";
import type { State } from "../interfaces/interfaces";
import { parseBGMFile, createBGMPlayer, resolveAudioPath } from "../utils/audioUtils";

interface UseBGMProps {
    bgmFile?: string;
    bgmLoop?: boolean;
    state: State;
    setState: (state: State) => void;
}

/**
 * Custom hook to handle background music playback
 * Handles: play new file, continue (keep playing), continue[filename], reset
 */
export const useBGM = ({ bgmFile, bgmLoop, state, setState }: UseBGMProps) => {
    const currentAudio = useRef<HTMLAudioElement | null>(state.currentMusic);
    const currentMusicNameRef = useRef<string | undefined>(state.currentMusic?.src.split("/").pop());

    // Update the ref when bgmFile changes
    useEffect(() => {
        const action = parseBGMFile(bgmFile, currentMusicNameRef.current);

        switch (action.action) {
            case "play": {
                // Stop current music if exists
                if (currentAudio.current) {
                    currentAudio.current.pause();
                    currentAudio.current = null;
                }

                // Play new music
                const audio = createBGMPlayer(
                    resolveAudioPath(action.file!),
                    state.musicVolume,
                    bgmLoop !== false
                );
                currentAudio.current = audio;

                audio.play().catch((err) => {
                    console.error("Error playing BGM:", err);
                });

                // Update state with current music
                setState({
                    ...state,
                    currentMusic: audio
                });
                break;
            }

            case "continue":
                // Do nothing - keep playing current music
                break;

            case "reset": {
                if (currentAudio.current) {
                    currentAudio.current.currentTime = 0;
                    // Ensure it's playing
                    currentAudio.current.play().catch((err) => {
                        console.error("Error resetting BGM:", err);
                    });
                }
                break;
            }

            case "none":
                // Do nothing
                break;
        }

        // Cleanup function - pause music when scene changes
        return () => {
            if (currentAudio.current) {
                // Don't pause - music should continue when scene changes
                // Just break the reference
                currentAudio.current = null;
            }
        };
    }, [bgmFile, bgmLoop, setState, state]);

    // Expose functions to control music
    const playMusic = useCallback((file: string, loop: boolean = true) => {
        if (currentAudio.current) {
            currentAudio.current.pause();
        }
        const audio = createBGMPlayer(resolveAudioPath(file), state.musicVolume, loop);
        currentAudio.current = audio;
        audio.play().catch((err) => console.error("Error playing BGM:", err));
        setState({ ...state, currentMusic: audio });
    }, [state, setState]);

    const pauseMusic = useCallback(() => {
        if (currentAudio.current) {
            currentAudio.current.pause();
        }
    }, []);

    const resumeMusic = useCallback(() => {
        if (currentAudio.current) {
            currentAudio.current.play().catch((err) => console.error("Error resuming BGM:", err));
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (currentAudio.current) {
            currentAudio.current.volume = volume;
        }
        setState({ ...state, musicVolume: volume });
    }, [state, setState]);

    const setLoop = useCallback((loop: boolean) => {
        if (currentAudio.current) {
            currentAudio.current.loop = loop;
        }
    }, []);

    // Return null for currentMusic since we can't expose RefObject
    // Use state.currentMusic instead
    return {
        currentMusic: null,
        playMusic,
        pauseMusic,
        resumeMusic,
        setVolume,
        setLoop
    };
};
