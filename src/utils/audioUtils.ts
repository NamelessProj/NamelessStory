/**
 * Resolves the path to an audio file in the public/audio directory
 * @param filename {string} - The audio file name (e.g., <code>my_song.mp3</code>)
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
 * @param bgmFile {string?} - The bgmFile value (e.g., <code>"continue"</code>, <code>"continue[song.mp3]"</code>, <code>"reset"</code>, <code>"song.mp3"</code>, or <code>undefined</code>/<code>"none"</code> for no music)
 * @param currentMusicName {string?} - The name of the currently playing music (optional)
 * @returns An object describing the action to take and the file to use (if applicable)
 */
export const parseBGMFile = (bgmFile?: string, currentMusicName?: string): BGMAction => {
    // "none" or undefined - no music
    if (!bgmFile || bgmFile === "none" || bgmFile === "") {
        return { action: "none" };
    }

    // "continue" - keep playing current music, no change
    if (bgmFile === "continue") {
        return { action: "continue" };
    }

    // "continue[filename.mp3]" - continue only if the current song matches, otherwise play new
    const continueMatch: RegExpMatchArray | null = bgmFile.match(/^continue\[(.+)\]$/);
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
 * @param audioFile {string} - The path to the audio file
 * @param volume {number?} - Volume level (<code>0</code> to <code>1</code>, default is <code>0.5</code>)
 * @param loop {boolean?} - Whether to loop the audio
 * @returns A configured HTMLAudioElement
 */
export const createBGMPlayer = (audioFile: string, volume: number = 0.5, loop: boolean = true): HTMLAudioElement => {
    const audio = new Audio(audioFile);
    audio.loop = loop;
    // Clamp volume between 0 and 1 to prevent distortion
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.preload = "auto";
    return audio;
};
