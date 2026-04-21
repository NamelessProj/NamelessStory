import DataContext, { type DataContextValue } from "../context/DataContext.ts";
import { createContextHook } from "../utils/contextHookFactory.ts";

/**
 * Custom hook to access the DataContext, which provides the current state of the visual novel and a function to update it. This hook ensures that it is used within a DataProvider, throwing an error if it is not.
 * @returns {DataContextValue} An object containing the current state, the setState function to update it, and the story script.
 * @throws {Error} will throw an error if the hook is used outside of a DataProvider.
 */
export const useDataContext = createContextHook<DataContextValue>(DataContext, "useDataContext");
