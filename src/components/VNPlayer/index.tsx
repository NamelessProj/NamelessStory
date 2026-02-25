import * as React from "react";
import type {Page, State, VNStory} from "../../interfaces/interfaces.ts";
import {useEffect, useState} from "react";
import Spinner from "../Spinner";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";

const state: State = {
    currentScene: "start",
    currentDialogueIndex: 0,
    currentDialogueIndexMax: 1,
    textSpeed: 50,
    waitingOnUserInput: false,
    waitingOnOptionSelection: false,
    isTyping: false,
    currentText: "",
    defaultNameColor: "#000000",
    currentMusic: null,
    musicVolume: 1,
    isMusicMuted: false,
    variables: {},
    history: []
};

const VNPlayer: React.FC<{ scriptFile: string }> = ({scriptFile}) => {
    const [script, setScript] = useState<VNStory|null>(null);
    const [currentPage, setCurrentPage] = useState<Page>("title");

    useEffect(() => {
        const loadStory = async () => {
            const url = `../story/${scriptFile}.json`;
            const res = await fetch(url);

            if (!res.ok) {
                const body = await res.text().catch(() => "");
                throw new Error(`Failed to load story script: ${res.status} ${res.statusText} - ${body.slice(0, 120)}`);
            }

            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                const body = await res.text();
                throw new Error(`Expected JSON response but got ${contentType}: ${body.slice(0, 80)}`);
            }

            // TODO: Remove this delay after testing
            //await new Promise(resolve => setTimeout(resolve, 20000));

            const data: VNStory = await res.json();
            state.currentScene = data.settings.startingScene;
            state.currentDialogueIndexMax = data.story[data.settings.startingScene].dialogues.length - 1;
            state.textSpeed = data.settings.textSpeed || 50;
            state.defaultNameColor = data.settings.defaultNameColor || "#000000";
            setScript(data);
        }

        loadStory().catch(err => {
            console.error("Error loading story script:", err);
        });
    }, [scriptFile, setScript]);

    // TODO: Remove this after testing
    useEffect(() => {
        console.log("Current state:", state);
        console.log("Loaded script:", script);
    }, [script]);

    const handleChangePage = (newPage: Page): void => setCurrentPage(newPage);

    return (
        <>
            {!script ? (
                <div id="vn-player" className="vn-body h-100 centered">
                    <Spinner />
                </div>
            ) : (
                <div id="vn-player" className="vn-body">
                    {currentPage === "title" ? (
                        <TitleScreen
                            script={script}
                            handleStart={() => handleChangePage("game")}
                            handleCredits={() => handleChangePage("credits")}
                        />
                    ) : null}

                    {currentPage === "game" ? (
                        <div>Game</div>
                    ) : null}

                    {currentPage === "credits" ? (
                        <CreditsPage
                            script={script}
                            handleChangeRoom={handleChangePage}
                        />
                    ) : null}
                </div>
            )}
        </>
    );
};

export default VNPlayer;