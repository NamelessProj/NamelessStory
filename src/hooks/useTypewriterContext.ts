import { useContext } from "react";
import TypewriterContext, { type TypewriterContextValue } from "../context/TypewriterContext.ts";

export const useTypewriterContext = (): TypewriterContextValue => {
    const ctx = useContext(TypewriterContext);
    if (!ctx) throw new Error("useTypewriterContext must be used within a DataProvider");
    return ctx;
};
