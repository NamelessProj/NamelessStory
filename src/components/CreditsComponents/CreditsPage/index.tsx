import * as React from "react";
import type {CreditGroupType, CreditsPageType, Page, VNStory} from "../../../interfaces/interfaces.ts";
import CreditGroup from "../CreditGroup";
import './style.css';
import {type CSSProperties, useEffect} from "react";
import BackgroundImage from "../../BackgroundImage";

const CreditsPage: React.FC<{ script: VNStory, handleChangeRoom: (page: Page) => void }> = ({script, handleChangeRoom}) => {
    const creditsPage: CreditsPageType = script.settings.creditsPage;

    const scrollDurationInSeconds: number = creditsPage.scrollDurationInSeconds || 30;
    const style: CSSProperties = {"--credits-scroll-time": `${scrollDurationInSeconds}s`} as CSSProperties;

    useEffect((): () => void => {
        const timeInMs: number = scrollDurationInSeconds * 1000 + 2000; // Add 2 seconds to ensure the scroll finishes before changing room
        const timer: number = setTimeout((): void => handleChangeRoom("title"), timeInMs);

        return (): void => clearTimeout(timer);
    }, [handleChangeRoom, scrollDurationInSeconds]);

    return (
        <div className="h-100">
            <BackgroundImage fileName={creditsPage.background} />

            <div className="credits-page h-100 centered column" style={style}>
                <h2>{creditsPage.title}</h2>

                {creditsPage.creditGroups.map((cg: CreditGroupType, i: number) => (
                    <CreditGroup creditGroup={cg} key={i} />
                ))}
            </div>
        </div>
    );
};

export default CreditsPage;