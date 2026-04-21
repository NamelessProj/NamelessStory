import TypewriterContext, { type TypewriterContextValue } from "../context/TypewriterContext.ts";
import { createContextHook } from "../utils/contextHookFactory.ts";

/**
 * Custom hook to access the TypewriterContext. It ensures that the context is used within a DataProvider and provides type safety for the context value.
 * @returns {TypewriterContextValue} The value of the TypewriterContext, which includes the typewriter animation state and its setter.
 * @throws {Error} If the hook is used outside of a DataProvider, an error is thrown to indicate that the context is not available.
 */
export const useTypewriterContext = createContextHook<TypewriterContextValue>(TypewriterContext, "useTypewriterContext");
