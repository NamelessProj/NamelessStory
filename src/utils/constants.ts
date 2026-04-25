import type {PauseMap} from "../interfaces/interfaces.ts";

export const DEFAULT_PAUSE_MAP: PauseMap = {
    ".": 1000,
    ",": 500,
};

export const PAUSE_SYMBOL: string = "\\";

export const VARIABLE_REGEX: RegExp = /{{([vcC]!)?([a-zA-Z0-9]+)}}/g;
export const VARIABLE_REGEX_SINGLE: RegExp = /{{([vcC]!)?([a-zA-Z0-9]+)}}/;

// Minimum ms to wait after typing completes before the player can advance
export const ADVANCE_THRESHOLD_MS: number = 150;

// The string that tells when the story ends
export const END_STORY_TOKEN: string = "__end__";

// Default and bounds for the history limit setting
export const DEFAULT_HISTORY_LIMIT: number = 15;
export const MIN_HISTORY_LIMIT: number = 0;
export const MAX_HISTORY_LIMIT: number = 200;

// Default total duration (ms) for scene/dialogue transitions
export const DEFAULT_TRANSITION_DURATION_MS: number = 400;