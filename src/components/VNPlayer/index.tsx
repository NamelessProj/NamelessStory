import type {Dialogue, Page, SceneType, State, TypewriterState, VNStory} from "../../interfaces/interfaces.ts";
import {parseSaveFile} from "../../utils/saveFile.ts";
import {useEffect, useMemo, useState} from "react";
import Spinner from "../Spinner";
import PageToDisplay from "../PageToDisplay";
import DataProvider from "../../context/DataProvider.tsx";
import {getCookieName} from "../../utils/helpMethods.ts";
import {loadState} from "../../utils/saveStorage.ts";
import {VNStorySchema, formatStoryErrors} from "../../utils/storySchema.ts";

const INITIAL_TYPEWRITER_STATE: TypewriterState = { isTyping: true, skipTyping: false };

const VNPlayer = ({scriptFile}: { scriptFile: string }) => {
    const [script, setScript] = useState<VNStory | null>(null);
    const [loadErrors, setLoadErrors] = useState<string[] | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>("title");
    const [savedState, setSavedState] = useState<State | null>(null);
    const [state, setState] = useState<State>({
        currentScene: "start",
        currentDialogueIndex: 0,
        currentDialogueIndexMax: 0,
        textSpeed: 50,
        waitingOnUserInput: false,
        waitingOnOptionSelection: false,
        currentText: "",
        defaultNameColor: "#000000",
        musicVolume: 0.5,
        isMusicMuted: false,
        variables: {},
        history: [],
    });
    const [typewriterState, setTypewriterState] = useState<TypewriterState>(INITIAL_TYPEWRITER_STATE);

    useEffect(() => {
        const loadStory = async (): Promise<void> => {
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

            const raw: unknown = await res.json();
            const result = VNStorySchema.safeParse(raw);
            if (!result.success) {
                setLoadErrors(formatStoryErrors(result.error));
                return;
            }
            const data: VNStory = result.data as VNStory;
            const startScene: SceneType = data.story[data.settings.startingScene];
            const startDialogue: Dialogue = startScene?.dialogues[0];
            setState(prev => ({
                ...prev,
                currentScene: data.settings.startingScene,
                currentDialogueIndexMax: startScene.dialogues.length - 1,
                textSpeed: data.settings.textSpeed || 50,
                defaultNameColor: data.settings.defaultNameColor || "#000000",
                waitingOnUserInput: startDialogue?.input !== undefined,
                waitingOnOptionSelection: (startDialogue?.options?.length ?? 0) > 0
            }));
            setScript(data);

            const cookieName: string = getCookieName(data.settings.titlePage.title);
            const cookieData: string | null = loadState(cookieName);
            if (cookieData) {
                try {
                    setSavedState(parseSaveFile(cookieData, data.story));
                } catch {
                    // Ignore stale or malformed cookie saves
                }
            }
        };

        loadStory().catch(err => {
            console.error("Error loading story script:", err);
            setLoadErrors([err instanceof Error ? err.message : String(err)]);
        });
    }, [scriptFile]);

    /**
     * Handles changing the current page of the VNPlayer. This function is passed down to child components and can be called to update the current page being displayed (e.g., "title", "game", "settings", etc.).
     * @param newPage {Page} The new page to switch to. This should be a string that corresponds to one of the defined pages in the Page type (e.g., <code>"title"</code>, <code>"game"</code>, <code>"settings"</code>). When this function is called, it will update the currentPage state variable, which will trigger a re-render and display the appropriate page component based on the new value. 
     */
    const handleChangePage = (newPage: Page): void => setCurrentPage(newPage);

    /**
     * Handles continuing from a saved game state. If there is a saved state available (indicated by the presence of savedState), this function will update the current state with the saved state,
     * reset the typewriter state to start typing immediately without skipping, and change the current page to the game view. This allows players to seamlessly continue their progress from a previously saved state when they click the "Continue" button on the title screen.
     * If there is no saved state available, this function will be undefined, and the "Continue" button can be conditionally rendered or disabled based on the presence of a saved state.
     */
    const handleContinue: (() => void) | undefined = savedState ? (): void => {
        setState(savedState);
        setTypewriterState({ isTyping: true, skipTyping: false });
        setCurrentPage("game");
    } : undefined;

    /**
     * Handles loading a saved game state. When a save file is loaded, this function updates the current state with the loaded state,
     * resets the typewriter state to start typing immediately without skipping, and changes the current page to the game view. This allows players to resume their progress from a saved state seamlessly.
     * @param loadedState {State} The game state that has been loaded from a save file. This should include all relevant information about the player's progress, such as the current scene, dialogue index,
     * inventory, variables, and any other state variables defined in the State interface. The function will use this loaded state to update the current game state and transition back to the game view.
     */
    const handleLoadSave = (loadedState: State): void => {
        setState(loadedState);
        setTypewriterState({ isTyping: true, skipTyping: false });
        setCurrentPage("game");
    };

    const dataContextValue = useMemo(
        () => ({ state, setState, script: script as VNStory }),
        [state, setState, script]
    );

    const typewriterContextValue = useMemo(
        () => ({ typewriterState, setTypewriterState }),
        [typewriterState, setTypewriterState]
    );

    return (
        <>
            {loadErrors ? (
                <div id="vn-player" className="vn-body h-100 centered" style={{ flexDirection: "column", gap: "1rem", padding: "2rem" }}>
                    <h2 style={{ color: "#ff6b6b", margin: 0 }}>Story failed to load</h2>
                    <ul style={{ textAlign: "left", color: "#ffcdd2", fontFamily: "monospace", fontSize: "0.85rem", maxWidth: "700px", lineHeight: 1.8 }}>
                        {loadErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            ) : !script ? (
                <div id="vn-player" className="vn-body h-100 centered">
                    <Spinner />
                </div>
            ) : (
                <DataProvider value={dataContextValue} typewriterValue={typewriterContextValue}>
                    <div id="vn-player" className="vn-body">
                        <PageToDisplay page={currentPage} handleChangePage={handleChangePage} handleContinue={handleContinue} handleLoadSave={handleLoadSave} />
                    </div>
                </DataProvider>
            )}
        </>
    );
};

export default VNPlayer;
