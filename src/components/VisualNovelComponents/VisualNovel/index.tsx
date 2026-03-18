import * as React from "react";
import type {State, VNStory} from "../../../interfaces/interfaces.ts";
import BackgroundImage from "../../BackgroundImage";
import Typewriter from "../../Typewriter";
import {getTextWithCharacters} from "../../../utils/helpMethods.ts";

const backgroundId: string = "vn-background";

const VisualNovel: React.FC<{ script: VNStory, state: State }> = ({script, state}) => {

    const handleMusic = (newMusic: string, loop: boolean = true): void => {
        if (newMusic === "Continue") return;
        if (state.currentMusic || newMusic === "Reset") {
            state.currentMusic?.pause();
            //state.currentMusic?.currentTime = 0;
        }

        if (newMusic === "Reset") {
            state.currentMusic = null;
            return;
        }

        state.currentMusic = new Audio(`../audio/${newMusic}`);
        state.currentMusic.volume = state.isMusicMuted ? 0 : state.musicVolume;
        state.currentMusic.loop = loop;
        state.currentMusic.play().then();
    }

    const setNewScene = (index?: string = state.currentScene): void => {
        const backgroundPicture: string = script.story[index].background;
        const newBg: HTMLImageElement = new Image();
        const src: string = `../assets/${backgroundPicture}`;
        newBg.src = src;
        newBg.onload = (): void => {
            const bgElement: HTMLDivElement|null = document.getElementById(backgroundId) as HTMLDivElement|null;
            if (bgElement) bgElement.style.backgroundImage = `url(${src})`;
        }

        if (script.story[index].bgmFile && script.story[index].bgmFile !== "") {
            handleMusic(script.story[index].bgmFile);
        }
    }

    const speed: number = script.story[state.currentScene].dialogues[state.currentDialogueIndex].textSpeed || script.settings.textSpeed || 50;

    return (
        <div id="vn-game-wrapper" className="h-100">
            <BackgroundImage
                fileName={script.story[state.currentScene].background}
                id={backgroundId}
            />

            <Typewriter
                text={getTextWithCharacters(script.story[state.currentScene].dialogues[state.currentDialogueIndex].text, script.characters, script.settings.defaultNameDisplay)}
                speed={speed}
            />
        </div>
    );
};

export default VisualNovel;