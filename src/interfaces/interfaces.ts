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
    text: string,
    background?: string,
    input?: string,
    options?: Option[],
    sprite?: Sprite,
    nextScene?: string
}

export interface Scene {
    background: string,
    bgmFile: string,
    dialogues: Dialogue[]
}

export interface CharacterType {
    color: string,
    sprite?: Record<string, string>
}

export interface TitleButtons {
    start?: string,
    credits?: string,
    exit?: string
}

export interface TitlePage {
    title: string,
    background: string,
    buttons?: TitleButtons
}

export interface Credit {
    name: string,
    role?: string
}

export interface CreditGroup {
    groupName: string,
    credits: Credit[]
}

export interface CreditsPage {
    title: string,
    background: string,
    creditGroups: CreditGroup[]
}

export interface Settings {
    startingScene: string,
    textSpeed?: number,
    webpImages?: boolean,
    defaultNameColor?: string,
    titlePage: TitlePage,
    creditsPage: CreditsPage
}

export interface VNStory {
    settings: Settings,
    characters: Record<string, CharacterType>,
    story: Record<string, Scene>
}

export interface State {
    currentScene: string,
    currentDialogueIndex: number,
    currentDialogueIndexMax: number,
    webImages: boolean,
    textSpeed: number,
    waitingOnUserInput: boolean,
    waitingOnOptionSelection: boolean,
    isTyping: boolean,
    currentText: string,
    defaultNameColor: string,
    currentMusic: HTMLAudioElement|null,
    musicVolume: number,
    isMusicMuted: boolean,
    variables: Record<string, string>
}