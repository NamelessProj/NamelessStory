import { type ReactNode } from "react";
import DataContext, { type DataContextValue } from "./DataContext.ts";
import TypewriterContext, { type TypewriterContextValue } from "./TypewriterContext.ts";

interface DataProviderProps {
    children: ReactNode;
    value: DataContextValue;
    typewriterValue: TypewriterContextValue;
}

const DataProvider = ({ children, value, typewriterValue }: DataProviderProps) => (
    <DataContext.Provider value={value}>
        <TypewriterContext.Provider value={typewriterValue}>
            {children}
        </TypewriterContext.Provider>
    </DataContext.Provider>
);

export default DataProvider;
