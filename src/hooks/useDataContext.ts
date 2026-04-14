import { useContext } from "react";
import DataContext, { type DataContextValue } from "../context/DataContext.ts";

export const useDataContext = (): DataContextValue => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useDataContext must be used within a DataProvider");
    return ctx;
};
