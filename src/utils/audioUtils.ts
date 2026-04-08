/**
 * Resolves the path to an audio file in the public/audio directory
 * @param filename - The audio file name (e.g., "my_song.mp3")
 * @returns The absolute path to the audio file
 */
export const resolveAudioPath = (filename: string): string => {
    return `/audio/${filename}`;
};


export type BGMAction = {
    action: "play" | "continue" | "reset" | "none";
    file?: string;
};

/**
 * Parses the bgmFile directive and returns action details
 * @param bgmFile - The bgmFile value (e.g., "continue", "continue[song.mp3]", "reset", "song.mp3")
 * @param currentMusicName - The name of the currently playing music (optional)
 * @returns An object describing the action to take and the file to use (if applicable)
 */
export const parseBGMFile = (bgmFile: string, currentMusicName?: string): BGMAction => {
    // "continue" - keep playing current music, no change
    if (bgmFile === "continue") {
        return { action: "continue" };
    }

    // "continue[filename.mp3]" - continue only if the current song matches, otherwise play new
    const continueMatch = bgmFile.match(/^continue\[(.+)\]$/);
    if (continueMatch) {
        const targetFile = continueMatch[1];
        if (currentMusicName && currentMusicName === targetFile) {
            return { action: "continue", file: targetFile };
        }
        return { action: "play", file: targetFile };
    }

    // "reset" - restart the current song from the beginning
    if (bgmFile === "reset") {
        return { action: "reset", file: currentMusicName };
    }

    // Otherwise, it's a filename - play this song
    return { action: "play", file: bgmFile };
};

/**
 * Creates an HTMLAudioElement for BGM with loop and volume settings
 * @param audioFile - The path to the audio file
 * @param volume - Volume level (0-1)
 * @param loop - Whether to loop the audio
 * @returns A configured HTMLAudioElement
 */
export const createBGMPlayer = (audioFile: string, volume: number = 1, loop: boolean = true): HTMLAudioElement => {
    const audio = new Audio(audioFile);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    return audio;
};
