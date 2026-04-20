import { createContext, type Dispatch, type SetStateAction } from "react";
import type { TypewriterState } from "../interfaces/interfaces.ts";

export interface TypewriterContextValue {
    typewriterState: TypewriterState;
    setTypewriterState: Dispatch<SetStateAction<TypewriterState>>;
}

const TypewriterContext = createContext<TypewriterContextValue | undefined>(undefined);

export default TypewriterContext;
