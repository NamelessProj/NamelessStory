import { useContext } from "react";
import TypewriterContext, { type TypewriterContextValue } from "../context/TypewriterContext.ts";

/**
 * Custom hook to access the TypewriterContext. It ensures that the context is used within a DataProvider and provides type safety for the context value.
 * @returns {TypewriterContextValue} The value of the TypewriterContext, which includes all the state and methods related to the typewriter effect and game state management.
 * @throws {Error} If the hook is used outside of a DataProvider, an error is thrown to indicate that the context is not available.
 */
export const useTypewriterContext = (): TypewriterContextValue => {
    const ctx: TypewriterContextValue | undefined = useContext(TypewriterContext);
    if (!ctx) throw new Error("useTypewriterContext must be used within a DataProvider");
    return ctx;
};
