import {DEFAULT_PAUSE_MAP} from "../../utils/pauseMap.ts";
import type {Token, TypewriterProps} from "../../interfaces/interfaces.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {buildHtmlUntilStep, countSteps, getDelayForStep, tokenizeHtmlWithPauses} from "../../utils/helpMethods.ts";

const Typewriter = ({text, speed = 50, pauseMap = DEFAULT_PAUSE_MAP, className, onComplete}: TypewriterProps) => {
    const tokens: Token[] = useMemo(
        () => tokenizeHtmlWithPauses(text, pauseMap),
        [text, pauseMap]
    );

    const totalSteps: number = useMemo(() => countSteps(tokens), [tokens]);

    const [currentStep, setCurrentStep] = useState(0);
    const completedRef = useRef(false);

    useEffect(() => {
        setCurrentStep(0);
        completedRef.current = false;
    }, [text, pauseMap]);

    useEffect(() => {
        if (currentStep >= totalSteps) {
            if (!completedRef.current) {
                completedRef.current = true;
                onComplete?.();
            }
            return;
        }

        const delay: number = getDelayForStep(tokens, currentStep, speed);

        const timeout: number = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, delay);

        return () => clearTimeout(timeout);
    }, [currentStep, totalSteps, tokens, speed, onComplete]);

    const renderedHtml: string = useMemo(() => {
        return buildHtmlUntilStep(tokens, currentStep);
    }, [tokens, currentStep]);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
    );
};

export default Typewriter;