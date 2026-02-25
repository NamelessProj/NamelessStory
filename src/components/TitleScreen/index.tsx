import * as React from "react";
import type {TitleButtons, VNStory} from "../../interfaces/interfaces.ts";
import PrimaryButton from "../PrimaryButton";

const TitleScreen: React.FC<{ script: VNStory, handleStart: () => void, handleCredits: () => void }> = ({script, handleStart, handleCredits}) => {
    const buttons: TitleButtons|undefined = script.settings.titlePage.buttons;

    return (
        <div className="vn-titlepage h-100 centered column">
            <picture className="bg-img">
                <img
                    src={`../assets/${script.settings.titlePage.background}`}
                    alt="Title Background"
                />
            </picture>

            <h1>{script.settings.titlePage.title}</h1>

            <div className="titlepage-buttons-wrapper">
                <PrimaryButton
                    text={buttons?.start || "Start"}
                    onClick={handleStart}
                />

                <PrimaryButton
                    text={buttons?.credits || "Credits"}
                    onClick={handleCredits}
                />
            </div>
        </div>
    );
};

export default TitleScreen;