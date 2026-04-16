import {type ChangeEvent, useRef} from "react";
import type {State, TitleButtons} from "../../interfaces/interfaces.ts";
import PrimaryButton from "../PrimaryButton";
import BackgroundImage from "../BackgroundImage";
import {useDataContext} from "../../hooks/useDataContext.ts";
import {parseSaveFile} from "../../utils/saveFile.ts";
import type {RefObject} from "react";

interface TitleScreenProps {
    handleStart: () => void;
    handleCredits: () => void;
    handleContinue?: () => void;
    handleLoadSave: (state: State) => void;
}

const TitleScreen = ({handleStart, handleCredits, handleContinue, handleLoadSave}: TitleScreenProps) => {
    const {script} = useDataContext();
    const buttons: TitleButtons|undefined = script.settings.titlePage.buttons;
    const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

    /**
     * Handles the file input change event when a user selects a save file. It reads the file, parses it, and calls the handleLoadSave callback with the loaded state.
     * @param e - The change event from the file input element.
     */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event): void => {
            try {
                const loadedState: State = parseSaveFile(event.target?.result as string);
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
