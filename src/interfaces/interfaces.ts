export type Page = "title" | "credits" | "game";

export type NameDisplay = "short" | "full";

export type DialoguePosition = "bottom" | "top" | "center";

export type DialogueTransition = "none" | "fade" | "fade-to-black" | "fade-to-white";

export type SceneTransition = "none" | "fade" | "fade-to-black" | "fade-to-white" | "slide-left" | "slide-right" | "slide-top" | "slide-bottom";

export type TransitionPhase = "idle" | "out" | "in";

export interface TransitionInfo {
    phase: TransitionPhase;
    type: SceneTransition | DialogueTransition;
    target: "scene" | "dialogue";
}

export interface SpritePosition {
    name?: "right"|"left"|"center",
    x?: number,
    y?: number
}

export interface Sprite {
    name: string,
    position?: SpritePosition,
    inDialogueBox?: boolean,
    mirror?: boolean,
}

export interface Option {
    text: string,
    next: string
}

export interface Dialogue {
    name: string,
    nameDisplay?: NameDisplay,
    text: string,
    textSpeed?: number,
    background?: string,
    input?: VariableType,
    options?: Option[],
    sprite?: Sprite,
    next?: string,
    dialoguePosition?: DialoguePosition,
    transition?: DialogueTransition,
}

export interface SceneType {
    background: string,
    bgmFile?: string,
    bgmLoop?: boolean,
    dialogues: Dialogue[],
    transition?: SceneTransition,
}

export interface CharacterType {
    name: string,
    fullName?: string,
    color: string,
    sprite?: Record<string, string>
}

export interface TitleButtons {
    start?: string,
    continue?: string,
    load?: string,
    credits?: string,
    exit?: string
}

export interface TitlePage {
    title: string,
    background: string,
    logo?: string,
    showTitle?: boolean,
    buttons?: TitleButtons
}

export interface Credit {
    name: string,
    role?: string
}

export interface CreditGroupType {
    groupName: string,
    credits: Credit[]
}

export interface CreditsPageType {
    title: string,
    background: string,
    scrollDurationInSeconds?: number,
    creditGroups: CreditGroupType[]
}

export interface Settings {
    startingScene: string,
    textSpeed?: number,
    defaultNameColor?: string,
    defaultNameDisplay?: NameDisplay,
    defaultDialoguePosition?: DialoguePosition,
    historyLimit?: number,
    defaultSceneTransition?: SceneTransition,
    defaultDialogueTransition?: DialogueTransition,
    transitionDuration?: number,
    titlePage: TitlePage,
    creditsPage: CreditsPageType
}

type CharacterId = string;

export interface VNStory {
    settings: Settings,
    characters: Record<CharacterId, CharacterType>,
    story: Record<string, SceneType>
}

export type VariableType = {
    value: string,
    color?: string
}

export interface HistoryEntry {
    sceneId: string,
    dialogueIndex: number
}

export interface State {
    currentScene: string,
    currentDialogueIndex: number,
    currentDialogueIndexMax: number,
    textSpeed: number,
    waitingOnUserInput: boolean,
    waitingOnOptionSelection: boolean,
    currentText: string,
    defaultNameColor: string,
    musicVolume: number,
    isMusicMuted: boolean,
    variables: Record<string, VariableType>,
    history: HistoryEntry[],
}

export interface TypewriterState {
    isTyping: boolean,
    skipTyping: boolean,
}


export type PauseMap = Record<string, number>;

export type TypewriterProps = {
    text: string;
    speed?: number;
    pauseMap?: PauseMap;
    className?: string;
    onComplete?: () => void;
};

export type Token =
    | { type: "openTag"; value: string }
    | { type: "closeTag"; value: string }
    | { type: "selfClosingTag"; value: string }
    | { type: "text"; value: string }
    | { type: "pause"; duration: number };