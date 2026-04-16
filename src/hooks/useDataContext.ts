import { useContext } from "react";
import DataContext, { type DataContextValue } from "../context/DataContext.ts";

/**
 * Custom hook to access the DataContext, which provides the current state of the visual novel and a function to update it.
 * This hook ensures that it is used within a DataProvider, throwing an error if it is not.
 * @returns An object containing the current state and the setState function to update it.
 * @throws Error - will throw an error if the hook is used outside of a DataProvider.
 */
export const useDataContext = (): DataContextValue => {
    const ctx: DataContextValue | undefined = useContext(DataContext);
    if (!ctx) throw new Error("useDataContext must be used within a DataProvider");
    return ctx;
};
