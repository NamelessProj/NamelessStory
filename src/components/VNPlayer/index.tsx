import type {Dialogue, Page, SceneType, State, TypewriterState, VNStory} from "../../interfaces/interfaces.ts";
import {useEffect, useMemo, useState} from "react";
import Spinner from "../Spinner";
import PageToDisplay from "../PageToDisplay";
import DataProvider from "../../context/DataProvider.tsx";
import Cookies from "../../utils/cookies.ts";
import {getCookieName} from "../../utils/helpMethods.ts";

const INITIAL_TYPEWRITER_STATE: TypewriterState = { isTyping: true, skipTyping: false };

const VNPlayer = ({scriptFile}: { scriptFile: string }) => {
    const [script, setScript] = useState<VNStory | null>(null);
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
                    const parsed = JSON.parse(cookieData) as State;
                    setSavedState(parsed);
                } catch {
                    // Ignore malformed cookie data
                }
            }
        };

        loadStory().catch(err => {
            console.error("Error loading story script:", err);
        });
    }, [scriptFile]);

    const handleChangePage = (newPage: Page): void => setCurrentPage(newPage);

    const handleContinue: (() => void) | undefined = savedState ? (): void => {
        setState(savedState);
        setTypewriterState({ isTyping: true, skipTyping: false });
        setCurrentPage("game");
    } : undefined;

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
            {!script ? (
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
