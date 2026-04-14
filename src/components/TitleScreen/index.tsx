import * as React from "react";
import type {State, TitleButtons} from "../../interfaces/interfaces.ts";
import PrimaryButton from "../PrimaryButton";
import BackgroundImage from "../BackgroundImage";
import {useDataContext} from "../../hooks/useDataContext.ts";
import {parseSaveFile} from "../../utils/saveFile.ts";

const TitleScreen: React.FC<{ handleStart: () => void, handleCredits: () => void, handleContinue?: () => void, handleLoadSave: (state: State) => void }> = ({handleStart, handleCredits, handleContinue, handleLoadSave}) => {
    const {script} = useDataContext();
    const buttons: TitleButtons|undefined = script.settings.titlePage.buttons;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event): void => {
            try {
                const loadedState = parseSaveFile(event.target?.result as string);
                handleLoadSave(loadedState);
            } catch {
                console.error("Failed to load save file: invalid or corrupted file.");
            }
        };
        reader.readAsText(file);

        // Reset so the same file can be re-selected if needed
        e.target.value = "";
    };

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
                    text={buttons?.load || "Load Save File"}
                    onClick={() => fileInputRef.current?.click()}
                />

                <PrimaryButton
                    text={buttons?.credits || "Credits"}
                    onClick={handleCredits}
                />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{display: "none"}}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default TitleScreen;
