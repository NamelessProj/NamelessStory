import {useEffect, useRef, useCallback, type Dispatch, type SetStateAction, type RefObject} from "react";
import type { State } from "../interfaces/interfaces";
import {parseBGMFile, createBGMPlayer, resolveAudioPath, type BGMAction} from "../utils/audioUtils";
import {audioRef} from "../utils/audioRef";

interface UseBGMProps {
    bgmFile?: string;
    bgmLoop?: boolean;
    state: State;
    setState: Dispatch<SetStateAction<State>>;
    trigger: string;
}

export const useBGM = ({ bgmFile, bgmLoop, state, setState, trigger }: UseBGMProps) => {
    const currentAudio: RefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement | null>(audioRef.current);
    const currentMusicNameRef: RefObject<string | undefined> = useRef<string | undefined>(audioRef.current?.src.split("/").pop());

    // Pause and clean up audio only on final unmount (not on trigger re-runs)
    useEffect(() => {
        return () => {
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const action: BGMAction = parseBGMFile(bgmFile, currentMusicNameRef.current);

        switch (action.action) {
            case "play": {
                // Stop current music before playing new track
                if (currentAudio.current) {
                    currentAudio.current.pause();
                    currentAudio.current = null;
                }

                const audio: HTMLAudioElement = createBGMPlayer(
                    resolveAudioPath(action.file!),
                    state.isMusicMuted ? 0 : state.musicVolume,
                    bgmLoop !== false
                );
                currentAudio.current = audio;
                audioRef.current = audio;
                currentMusicNameRef.current = action.file;

                audio.play().catch((err) => {
                    console.error("Error playing BGM:", err);
                });
                break;
            }

            case "continue": {
                if (currentAudio.current) {
                    currentAudio.current.play().catch((err) => {
                        console.error("Error continuing BGM:", err);
                    });
                }
                break;
            }

            case "reset": {
                if (currentAudio.current) {
                    currentAudio.current.currentTime = 0;
                    currentAudio.current.play().catch((err) => {
                        console.error("Error resetting BGM:", err);
                    });
                }
                break;
            }

            case "none":
                break;
        }
        // No cleanup here — handled by the dedicated unmount effect above,
        // and by the "play" case stopping the old track before starting a new one.
    }, [trigger]);

    /**
     * Plays a specified audio file as background music. If there is already an active audio track, it will be paused before the new track is played. The new audio track is created using the createBGMPlayer function, which sets the appropriate volume and loop settings based on the current state. The name of the currently playing music is stored in a ref for later reference.
     * @param file {string} The name of the audio file to play (e.g., <code>"song.mp3"</code>). This should correspond to a file in the public/audio directory.
     * @param loop {boolean?} An optional boolean indicating whether the audio should loop. If set to <code>true</code>, the audio will repeat indefinitely until paused or stopped. If set to <code>false</code> or omitted, the audio will play only once.
     */
    const playMusic = useCallback((file: string, loop: boolean = true): void => {
        currentAudio.current?.pause();
        const audio: HTMLAudioElement = createBGMPlayer(resolveAudioPath(file), state.isMusicMuted ? 0 : state.musicVolume, loop);
        currentAudio.current = audio;
        audioRef.current = audio;
        currentMusicNameRef.current = file;
        audio.play().catch((err) => console.error("Error playing BGM:", err));
    }, [state.isMusicMuted, state.musicVolume]);

    /**
     * Pauses the current audio track if it exists. This function is useful for temporarily stopping background music, such as when the player navigates away from the game or when pausing the game.
     * If there is an active audio track, it will be paused, allowing for later resumption without losing the current playback position.
     */
    const pauseMusic = useCallback((): void => {
        currentAudio.current?.pause();
    }, []);

    /**
     * Resumes playback of the current audio track if it exists.
     * This function is useful for resuming background music after it has been paused, such as when the player returns to the game after being away or when unpausing the game.
     * If there is an active audio track, it will attempt to play it and log any errors that occur during playback.
     */
    const resumeMusic = useCallback((): void => {
        currentAudio.current?.play().catch((err) => console.error("Error resuming BGM:", err));
    }, []);

    /**
     * Sets the volume of the current audio track. If there is an active audio track, its volume will be updated to the specified value.
     * Additionally, the musicVolume property in the state will be updated to reflect the new volume level, allowing for consistent volume control across the application.
     * @param volume {number} A number between 0 and 1 representing the desired volume level, where 0 is completely silent and 1 is the maximum volume.
     * This value will be applied to the current audio track if it exists, and it will also update the musicVolume property in the state for future reference.
     */
    const setVolume = useCallback((volume: number): void => {
        if (currentAudio.current) {
            currentAudio.current.volume = volume;
        }
        setState(prev => ({ ...prev, musicVolume: volume }));
    }, [setState]);

    /**
     * Sets the loop property of the current audio track. If there is an active audio track, its loop property will be updated to the specified value. This allows for dynamic control over whether the background music should repeat continuously or play only once.
     * @param loop {boolean} A boolean value indicating whether the audio should loop. If set to <code>true</code>, the audio will repeat indefinitely until paused or stopped. If set to <code>false</code>, the audio will play only once and then stop.
     */
    const setLoop = useCallback((loop: boolean): void => {
        if (currentAudio.current) {
            currentAudio.current.loop = loop;
        }
    }, []);

    return { playMusic, pauseMusic, resumeMusic, setVolume, setLoop };
};
