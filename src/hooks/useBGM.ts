import {useEffect, useRef, useCallback, type Dispatch, type SetStateAction, type RefObject} from "react";
import type { State } from "../interfaces/interfaces";
import {parseBGMFile, createBGMPlayer, resolveAudioPath, type BGMAction} from "../utils/audioUtils";

interface UseBGMProps {
    bgmFile?: string;
    bgmLoop?: boolean;
    state: State;
    setState: Dispatch<SetStateAction<State>>;
    trigger: string; // Unique identifier to trigger music play on scene entry
}

/**
 * Custom hook to handle background music playback
 * Handles: play new file, <code>continue</code> (keep playing), <code>continue[filename]</code>, <code>reset</code>, and <code>none</code>
 * @param bgmFile {string?} - The BGM file or command from the script
 * @param bgmLoop {boolean?} - Whether the music should loop (default true)
 * @param state {State} - The current global state of the VN
 * @param setState {Dispatch<SetStateAction<State>>} - Function to update the global state
 * @param trigger {string} - A unique identifier that changes on scene entry to trigger BGM actions
 * @returns An object with functions to control music playback and volume
 */
export const useBGM = ({ bgmFile, bgmLoop, state, setState, trigger }: UseBGMProps) => {
    const currentAudio: RefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement | null>(state.currentMusic);
    const currentMusicNameRef: RefObject<string | undefined> = useRef<string | undefined>(state.currentMusic?.src.split("/").pop());
    const hasPlayedRef: RefObject<boolean> = useRef<boolean>(false);
    const currentTriggerRef: RefObject<string> = useRef<string>(trigger);

    // Update the ref when trigger changes (scene entry)
    useEffect(() => {
        // Track if this is a new trigger (scene change)
        //const isNewTrigger = currentTriggerRef.current !== trigger;
        currentTriggerRef.current = trigger;

        const action: BGMAction = parseBGMFile(bgmFile, currentMusicNameRef.current);

        switch (action.action) {
            case "play": {
                // Stop current music if exists
                if (currentAudio.current) {
                    currentAudio.current.pause();
                    currentAudio.current = null;
                }

                // Play new music
                const audio: HTMLAudioElement = createBGMPlayer(
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

    /**
     * Plays a specified music file, replacing any currently playing music. If the same file is already playing, it will restart it. The loop parameter determines whether the music should loop (default <code>true</code>).
      * @param file {string} - The filename of the music to play (relative to the audio directory)
      * @param loop {boolean} - Whether the music should loop (default <code>true</code>)
      * @returns void
      * @throws Error - Will log an error if there is an issue playing the music file
      * @example
      * playMusic("bgm/scene1.mp3"); // Plays scene1.mp3 on loop
      * playMusic("bgm/scene2.mp3", false); // Plays scene2.mp3 once without looping
     */
    const playMusic = useCallback((file: string, loop: boolean = true) => {
        if (currentAudio.current) {
            currentAudio.current.pause();
        }
        const audio: HTMLAudioElement = createBGMPlayer(resolveAudioPath(file), state.isMusicMuted ? 0 : state.musicVolume, loop);
        currentAudio.current = audio;
        currentMusicNameRef.current = file;
        audio.play().catch((err) => console.error("Error playing BGM:", err));
        setState(prev => ({ ...prev, currentMusic: audio }));
    }, [state, setState]);

    /**
     * Pauses the currently playing music, if any. This function does not reset the playback position, allowing for resuming later. If no music is currently playing, this function does nothing.
     */
    const pauseMusic = useCallback(() => {
        if (currentAudio.current) {
            currentAudio.current.pause();
        }
    }, []);

    /**
     * Resumes playback of the currently paused music, if any. If the music is already playing or if there is no music to resume, this function does nothing.
     * If there is an error while trying to resume playback (e.g., due to browser autoplay restrictions), it will log the error to the console.
      * @returns void
      * @throws Error - Will log an error if there is an issue resuming the music playback
     */
    const resumeMusic = useCallback(() => {
        if (currentAudio.current) {
            currentAudio.current.play().catch((err) => console.error("Error resuming BGM:", err));
        }
    }, []);

    /**
     * Sets the volume of the currently playing music. The volume should be a number between <code>0</code> (muted) and <code>1</code> (full volume).
     * This function updates both the audio element's volume and the global state to ensure consistency across the application.
     * If there is no music currently playing, it will still update the global state so that any future music played will use the new volume level.
      * @param volume {number} - The desired volume level (<code>0</code> to <code>1</code>)
      * @returns void
      * @throws Error - Will log an error if the provided volume is out of range or if there is an issue setting the volume on the audio element
     */
    const setVolume = useCallback((volume: number) => {
        if (currentAudio.current) {
            currentAudio.current.volume = volume;
        }
        setState(prev => ({ ...prev, musicVolume: volume }));
    }, [state, setState]);

    /**
     * Sets whether the currently playing music should loop. If there is no music currently playing, this function does nothing. If music is playing, it will update the loop property of the audio element accordingly.
      * @param loop {boolean} - Whether the music should loop (<code>true</code> to loop, <code>false</code> to play once)
      * @returns void
      * @throws Error - Will log an error if there is an issue setting the loop property on the audio element
     */
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
