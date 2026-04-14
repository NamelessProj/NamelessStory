import { type ReactNode } from "react";
import DataContext, { type DataContextValue } from "./DataContext.ts";

interface DataProviderProps {
    children: ReactNode;
    value: DataContextValue;
}

const DataProvider = ({ children, value }: DataProviderProps) => (
    <DataContext.Provider value={value}>
        {children}
    </DataContext.Provider>
);

export default DataProvider;
