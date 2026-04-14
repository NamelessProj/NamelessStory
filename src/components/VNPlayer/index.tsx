import * as React from "react";
import type {Page, State, VNStory} from "../../interfaces/interfaces.ts";
import {useEffect, useState} from "react";
import Spinner from "../Spinner";
import PageToDisplay from "../PageToDisplay";
import DataProvider from "../../context/DataProvider.tsx";
import Cookies from "../../utils/cookies.ts";
import {getCookieName} from "../../utils/helpMethods.ts";

const VNPlayer: React.FC<{ scriptFile: string }> = ({scriptFile}) => {
    const [script, setScript] = useState<VNStory|null>(null);
    const [currentPage, setCurrentPage] = useState<Page>("title");
    const [savedState, setSavedState] = useState<State | null>(null);
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

            const cookieName = getCookieName(data.settings.titlePage.title);
            const cookieData = Cookies.get(cookieName);
            if (cookieData) {
                try {
                    const parsed = JSON.parse(cookieData) as State;
                    setSavedState({...parsed, currentMusic: null});
                } catch {
                    // Ignore malformed cookie data
                }
            }
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

    const handleContinue = savedState ? (): void => {
        setState(savedState);
        setCurrentPage("game");
    } : undefined;

    return (
        <>
            {!script ? (
                <div id="vn-player" className="vn-body h-100 centered">
                    <Spinner />
                </div>
            ) : (
                <DataProvider value={{state, setState, script}}>
                    <div id="vn-player" className="vn-body">
                        <PageToDisplay page={currentPage} handleChangePage={handleChangePage} handleContinue={handleContinue} />
                    </div>
                </DataProvider>
            )}
        </>
    );
};

export default VNPlayer;
