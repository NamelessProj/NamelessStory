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

    const playMusic = useCallback((file: string, loop: boolean = true) => {
        currentAudio.current?.pause();
        const audio: HTMLAudioElement = createBGMPlayer(resolveAudioPath(file), state.isMusicMuted ? 0 : state.musicVolume, loop);
        currentAudio.current = audio;
        audioRef.current = audio;
        currentMusicNameRef.current = file;
        audio.play().catch((err) => console.error("Error playing BGM:", err));
    }, [state.isMusicMuted, state.musicVolume]);

    const pauseMusic = useCallback(() => {
        currentAudio.current?.pause();
    }, []);

    const resumeMusic = useCallback(() => {
        currentAudio.current?.play().catch((err) => console.error("Error resuming BGM:", err));
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (currentAudio.current) {
            currentAudio.current.volume = volume;
        }
        setState(prev => ({ ...prev, musicVolume: volume }));
    }, [setState]);

    const setLoop = useCallback((loop: boolean) => {
        if (currentAudio.current) {
            currentAudio.current.loop = loop;
        }
    }, []);

    return { playMusic, pauseMusic, resumeMusic, setVolume, setLoop };
};
