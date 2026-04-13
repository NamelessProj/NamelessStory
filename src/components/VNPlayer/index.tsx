import * as React from "react";
import type {Page, State, VNStory} from "../../interfaces/interfaces.ts";
import {useEffect, useState} from "react";
import Spinner from "../Spinner";
import PageToDisplay from "../PageToDisplay";

const VNPlayer: React.FC<{ scriptFile: string }> = ({scriptFile}) => {
    const [script, setScript] = useState<VNStory|null>(null);
    const [currentPage, setCurrentPage] = useState<Page>("title");
    const [state, setState] = useState<State>({
        currentScene: "start",
        currentDialogueIndex: 0,
        currentDialogueIndexMax: 0,
        textSpeed: 50,
        waitingOnUserInput: false,
        waitingOnOptionSelection: false,
        isTyping: true,
        currentText: "",
        defaultNameColor: "#000000",
        currentMusic: null,
        musicVolume: 0.5,
        isMusicMuted: false,
        variables: {},
        history: [],
        skipTyping: false
    });

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

            const data: VNStory = await res.json();
            const startScene = data.story[data.settings.startingScene];
            const startDialogue = startScene?.dialogues[0];
            setState(prev => ({
                ...prev,
                currentScene: data.settings.startingScene,
                currentDialogueIndexMax: startScene.dialogues.length - 1,
                textSpeed: data.settings.textSpeed || 50,
                defaultNameColor: data.settings.defaultNameColor || "#000000",
                waitingOnUserInput: startDialogue?.input !== undefined
            }));
            setScript(data);
        };

        loadStory().catch(err => {
            console.error("Error loading story script:", err);
        });
    }, [scriptFile]);

    // TODO: Remove this after testing
    useEffect(() => {
        console.log("Current state:", state);
        console.log("Loaded script:", script);
    }, [script, state]);

    const handleChangePage = (newPage: Page): void => setCurrentPage(newPage);

    return (
        <>
            {!script ? (
                <div id="vn-player" className="vn-body h-100 centered">
                    <Spinner />
                </div>
            ) : (
                <div id="vn-player" className="vn-body">
                    <PageToDisplay page={currentPage} script={script} state={state} setState={setState} handleChangePage={handleChangePage} />
                </div>
            )}
        </>
    );
};

export default VNPlayer;
