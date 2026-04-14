import { createContext, type Dispatch, type SetStateAction } from "react";
import type { State, VNStory } from "../interfaces/interfaces.ts";

export interface DataContextValue {
    state: State;
    setState: Dispatch<SetStateAction<State>>;
    script: VNStory;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export default DataContext;
