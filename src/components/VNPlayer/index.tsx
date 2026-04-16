import type {Dialogue, Page, SceneType, State, VNStory} from "../../interfaces/interfaces.ts";
import {useEffect, useState} from "react";
import Spinner from "../Spinner";
import PageToDisplay from "../PageToDisplay";
import DataProvider from "../../context/DataProvider.tsx";
import Cookies from "../../utils/cookies.ts";
import {getCookieName} from "../../utils/helpMethods.ts";

const VNPlayer = ({scriptFile}: { scriptFile: string }) => {
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
            const url: string = `../story/${scriptFile}.json`;
            const res: Response = await fetch(url);

            if (!res.ok) {
                const body: string = await res.text().catch(() => "");
                throw new Error(`Failed to load story script: ${res.status} ${res.statusText} - ${body.slice(0, 120)}`);
            }

            const contentType: string = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                const body: string = await res.text();
                throw new Error(`Expected JSON response but got ${contentType}: ${body.slice(0, 80)}`);
            }

            const data: VNStory = await res.json();
            const startScene: SceneType = data.story[data.settings.startingScene];
            const startDialogue: Dialogue = startScene?.dialogues[0];
            setState(prev => ({
                ...prev,
                currentScene: data.settings.startingScene,
                currentDialogueIndexMax: startScene.dialogues.length - 1,
                textSpeed: data.settings.textSpeed || 50,
                defaultNameColor: data.settings.defaultNameColor || "#000000",
                waitingOnUserInput: startDialogue?.input !== undefined
            }));
            setScript(data);

            const cookieName: string = getCookieName(data.settings.titlePage.title);
            const cookieData: string | null = Cookies.get(cookieName);
            if (cookieData) {
                try {
                    const parsed: State = JSON.parse(cookieData) as State;
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

    /**
     * Handles page changes by updating the currentPage state variable. This function is passed down to child components that need to trigger page changes, such as the title screen or credits page.
     * When called, it updates the currentPage state, which in turn determines which component is rendered on the screen.
     * @param newPage {Page} - The new page to navigate to, which can be <code>title</code>, <code>game</code>, or <code>credits</code>. This value is used to conditionally render the appropriate component in the PageToDisplay component.
     */
    const handleChangePage = (newPage: Page): void => setCurrentPage(newPage);

    /**
     * Handles the "Continue" action on the title screen. If a saved state was successfully loaded from cookies, this function will set the global state to the saved state and navigate to the game page.
     * If no saved state is available, this function will be undefined, and the "Continue" button will not be rendered on the title screen.
     */
    const handleContinue = savedState ? (): void => {
        setState(savedState);
        setCurrentPage("game");
    } : undefined;

    /**
     * Handles loading a saved game state from a save file. This function is passed down to the title screen component, which allows the user to select a save file to load.
     * When a valid save file is loaded, this function updates the global state with the loaded state and navigates to the game page.
     * @param loadedState {State} - The game state that was loaded from the save file. This state should match the structure of the State interface defined in the application's types, and it will be used to restore the game to the point where it was saved.
     */
    const handleLoadSave = (loadedState: State): void => {
        setState(loadedState);
        setCurrentPage("game");
    };

    return (
        <>
            {!script ? (
                <div id="vn-player" className="vn-body h-100 centered">
                    <Spinner />
                </div>
            ) : (
                <DataProvider value={{state, setState, script}}>
                    <div id="vn-player" className="vn-body">
                        <PageToDisplay page={currentPage} handleChangePage={handleChangePage} handleContinue={handleContinue} handleLoadSave={handleLoadSave} />
                    </div>
                </DataProvider>
            )}
        </>
    );
};

export default VNPlayer;
