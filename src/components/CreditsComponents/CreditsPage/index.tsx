import type {CreditGroupType, CreditsPageType, Page} from "../../../interfaces/interfaces.ts";
import CreditGroup from "../CreditGroup";
import {type CSSProperties, useEffect, useRef, useState} from "react";
import BackgroundImage from "../../BackgroundImage";
import {useDataContext} from "../../../hooks/useDataContext.ts";

import styles from './style.module.css';

const DEFAULT_SCROLL_SPEED = 100; // px/s

const CreditsPage = ({handleChangeRoom}: { handleChangeRoom: (page: Page) => void }) => {
    const {script} = useDataContext();
    const creditsPage: CreditsPageType = script.settings.creditsPage;
    const scrollSpeed: number = creditsPage.scrollSpeedInPixelsPerSecond || DEFAULT_SCROLL_SPEED;

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollDuration, setScrollDuration] = useState<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const height = containerRef.current.getBoundingClientRect().height;
        setScrollDuration((2 * height) / scrollSpeed);
    }, [scrollSpeed]);

    useEffect((): () => void => {
        if (scrollDuration === null) return () => undefined;
        const timeInMs: number = scrollDuration * 1000 + 2000;
        const timer: number = setTimeout((): void => handleChangeRoom("title"), timeInMs);
        return (): void => clearTimeout(timer);
    }, [handleChangeRoom, scrollDuration]);

    const style: CSSProperties = scrollDuration !== null
        ? {"--credits-scroll-time": `${scrollDuration}s`} as CSSProperties
        : {};

    return (
        <div className="h-100">
            <BackgroundImage fileName={creditsPage.background} />

            <div
                ref={containerRef}
                className={`${styles.creditsPage} ${scrollDuration !== null ? styles.animating : ''} h-100 centered column`}
                style={style}
            >
                <h2>{creditsPage.title}</h2>

                {creditsPage.creditGroups.map((cg: CreditGroupType, i: number) => (
                    <CreditGroup creditGroup={cg} key={i} />
                ))}
            </div>
        </div>
    );
};

export default CreditsPage;
