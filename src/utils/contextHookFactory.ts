import { useContext, type Context } from "react";

/**
 * Creates a typed custom hook for a given React context. The returned hook throws if used outside its provider, ensuring type-safe access with a helpful error message.
 * @param context {Context<T | undefined>} The React context to wrap.
 * @param hookName {string} Name of the resulting hook, used in the thrown error message.
 * @returns {() => T} A custom hook that returns the context value or throws if no provider is found.
 */
export const createContextHook = <T>(context: Context<T | undefined>, hookName: string): () => T => {
    return (): T => {
        const ctx: T | undefined = useContext(context);
        if (!ctx) throw new Error(`${hookName} must be used within a DataProvider`);
        return ctx;
    };
}
