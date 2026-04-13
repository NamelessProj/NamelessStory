import {DEFAULT_PAUSE_MAP} from "../../utils/constants.ts";
import type {Token, TypewriterProps} from "../../interfaces/interfaces.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import TypewriterUtils from "../../utils/typewriterUtils.ts";

const Typewriter = ({text, speed = 50, pauseMap = DEFAULT_PAUSE_MAP, script, state, className, onComplete}: TypewriterProps) => {
    const tokens: Token[] = useMemo(
        () => TypewriterUtils.tokenizeHtmlWithPauses(
            TypewriterUtils.getTextWithCharacters(
                text,
                script.characters,
                state.variables,
                script.settings.defaultNameDisplay),
            pauseMap),
        [text, script.characters, script.settings.defaultNameDisplay, state.variables, pauseMap]
    );

    const totalSteps: number = useMemo(() => TypewriterUtils.countSteps(tokens), [tokens]);

    const [currentStep, setCurrentStep] = useState<number>(0);
    const completedRef = useRef(false);

    useEffect(() => {
        const timeout: number = setTimeout(() => {
            completedRef.current = false;
            setCurrentStep(0);
        }, 0);
        return () => clearTimeout(timeout);
    }, [text, pauseMap]);

    // Skip to end when requested
    useEffect(() => {
        if (state.skipTyping && currentStep < totalSteps) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentStep(totalSteps);
        }
    }, [state.skipTyping, currentStep, totalSteps]);

    useEffect(() => {
        if (currentStep >= totalSteps) {
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete?.();
            }
            return;
        }

        const delay: number = TypewriterUtils.getDelayForStep(tokens, currentStep, speed);

        const timeout: number = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, delay);

        return () => clearTimeout(timeout);
    }, [currentStep, totalSteps, tokens, speed, onComplete]);

    const renderedHtml: string = useMemo(() => {
        return TypewriterUtils.buildHtmlUntilStep(tokens, currentStep);
    }, [tokens, currentStep]);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
    );
};

export default Typewriter;