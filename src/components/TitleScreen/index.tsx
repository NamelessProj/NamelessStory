import * as React from "react";
import type {TitleButtons} from "../../interfaces/interfaces.ts";
import PrimaryButton from "../PrimaryButton";
import BackgroundImage from "../BackgroundImage";
import {useDataContext} from "../../hooks/useDataContext.ts";

const TitleScreen: React.FC<{ handleStart: () => void, handleCredits: () => void, handleContinue?: () => void }> = ({handleStart, handleCredits, handleContinue}) => {
    const {script} = useDataContext();
    const buttons: TitleButtons|undefined = script.settings.titlePage.buttons;

    return (
        <div className="vn-titlepage h-100 centered column">
            <BackgroundImage fileName={script.settings.titlePage.background} />

            <h1>{script.settings.titlePage.title}</h1>

            <div className="titlepage-buttons-wrapper">
                <PrimaryButton
                    text={buttons?.start || "Start"}
                    onClick={handleStart}
                />

                {handleContinue && (
                    <PrimaryButton
                        text={buttons?.continue || "Continue"}
                        onClick={handleContinue}
                    />
                )}

                <PrimaryButton
                    text={buttons?.credits || "Credits"}
                    onClick={handleCredits}
                />
            </div>
        </div>
    );
};

export default TitleScreen;
