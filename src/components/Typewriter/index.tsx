import {memo} from "react";
import {DEFAULT_PAUSE_MAP} from "../../utils/constants.ts";
import type {Token, TypewriterProps} from "../../interfaces/interfaces.ts";
import {type RefObject, useEffect, useMemo, useRef, useState} from "react";
import TypewriterUtils from "../../utils/typewriterUtils.ts";
import {parseMarkup} from "../../utils/markupParser.ts";
import {useDataContext} from "../../hooks/useDataContext.ts";
import {useTypewriterContext} from "../../hooks/useTypewriterContext.ts";

const Typewriter = memo(({text, speed = 50, pauseMap = DEFAULT_PAUSE_MAP, className, onComplete}: TypewriterProps) => {
    const {script, state} = useDataContext();
    const {typewriterState} = useTypewriterContext();

    const tokens: Token[] = useMemo(
        () => TypewriterUtils.tokenizeHtmlWithPauses(
            parseMarkup(TypewriterUtils.getTextWithCharacters(
                text,
                script.characters,
                state.variables,
                script.settings.defaultNameDisplay)),
            pauseMap),
        [text, script.characters, script.settings.defaultNameDisplay, state.variables, pauseMap]
    );

    // Single O(n) precomputation; O(1) per tick for HTML and delay lookups
    const precomputed = useMemo(
        () => TypewriterUtils.precomputeSteps(tokens, speed),
        [tokens, speed]
    );

    const totalSteps: number = precomputed.htmlSnapshots.length - 1;

    const [currentStep, setCurrentStep] = useState<number>(0);
    const completedRef: RefObject<boolean> = useRef(false);

    // Reset when text changes
    useEffect(() => {
        const timeout: number = setTimeout(() => {
            completedRef.current = false;
            setCurrentStep(0);
        }, 0);
        return () => clearTimeout(timeout);
    }, [text, pauseMap]);

    // Skip to end when requested
    useEffect(() => {
        if (typewriterState.skipTyping && currentStep < totalSteps) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentStep(totalSteps);
        }
    }, [typewriterState.skipTyping, currentStep, totalSteps]);

    // Advance one step at a time using precomputed delays
    useEffect(() => {
        if (currentStep >= totalSteps) {
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete?.();
            }
            return;
        }

        const delay: number = precomputed.delays[currentStep] ?? speed;
        const timeout: number = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, delay);

        return () => clearTimeout(timeout);
    }, [currentStep, totalSteps, precomputed, speed, onComplete]);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: precomputed.htmlSnapshots[currentStep] ?? "" }}
        />
    );
});

export default Typewriter;
