import React, { useEffect, useRef, useCallback } from "react";
import type { State } from "../interfaces/interfaces";
import { parseBGMFile, createBGMPlayer, resolveAudioPath } from "../utils/audioUtils";

interface UseBGMProps {
    bgmFile?: string;
    bgmLoop?: boolean;
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    trigger: string; // Unique identifier to trigger music play on scene entry
}

/**
 * Custom hook to handle background music playback
 * Handles: play new file, continue (keep playing), continue[filename], reset
 */
export const useBGM = ({ bgmFile, bgmLoop, state, setState, trigger }: UseBGMProps) => {
    const currentAudio = useRef<HTMLAudioElement | null>(state.currentMusic);
    const currentMusicNameRef = useRef<string | undefined>(state.currentMusic?.src.split("/").pop());
    const hasPlayedRef = useRef<boolean>(false);
    const currentTriggerRef = useRef<string>(trigger);

    // Update the ref when trigger changes (scene entry)
    useEffect(() => {
        // Track if this is a new trigger (scene change)
        //const isNewTrigger = currentTriggerRef.current !== trigger;
        currentTriggerRef.current = trigger;

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
                    state.isMusicMuted ? 0 : state.musicVolume,
                    bgmLoop !== false
                );
                currentAudio.current = audio;
                currentMusicNameRef.current = action.file;
                hasPlayedRef.current = true;

                audio.play().catch((err) => {
                    console.error("Error playing BGM:", err);
                });

                // Update state with current music
                setState(prev => ({
                    ...prev,
                    currentMusic: audio
                }));
                break;
            }

            case "continue": {
                // Do nothing - keep playing current music
                if (currentAudio.current && !hasPlayedRef.current) {
                    // Resume if it was paused
                    currentAudio.current.play().catch((err) => {
                        console.error("Error continuing BGM:", err);
                    });
                }
                hasPlayedRef.current = true;
                break;
            }

            case "reset": {
                if (currentAudio.current) {
                    currentAudio.current.currentTime = 0;
                    // Ensure it's playing
                    currentAudio.current.play().catch((err) => {
                        console.error("Error resetting BGM:", err);
                    });
                    hasPlayedRef.current = true;
                }
                break;
            }

            case "none":
                hasPlayedRef.current = false;
                break;
        }

        // Cleanup function - pause and nullify audio on unmount
        return () => {
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }
        };
    }, [trigger]);

    // Expose functions to control music
    const playMusic = useCallback((file: string, loop: boolean = true) => {
        if (currentAudio.current) {
            currentAudio.current.pause();
        }
        const audio = createBGMPlayer(resolveAudioPath(file), state.isMusicMuted ? 0 : state.musicVolume, loop);
        currentAudio.current = audio;
        currentMusicNameRef.current = file;
        audio.play().catch((err) => console.error("Error playing BGM:", err));
        setState(prev => ({ ...prev, currentMusic: audio }));
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
        setState(prev => ({ ...prev, musicVolume: volume }));
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
