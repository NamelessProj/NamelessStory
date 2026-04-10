import type {PauseMap} from "../interfaces/interfaces.ts";

export const DEFAULT_PAUSE_MAP: PauseMap = {
    ".": 1000,
    ",": 500,
};

export const PAUSE_SYMBOL: string = "\\";

export const VARIABLE_REGEX: RegExp = /{{([vcC]!)?([a-zA-Z0-9]+)}}/g;