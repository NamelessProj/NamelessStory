import * as React from "react";
import type {CreditGroupType, CreditsPage, Page, VNStory} from "../../../interfaces/interfaces.ts";
import CreditGroup from "../CreditGroup";
import './style.css';
import type {CSSProperties} from "react";

const CreditsPage: React.FC<{ script: VNStory, handleChangeRoom: (page: Page) => void }> = ({script, handleChangeRoom}) => {
    const creditsPage: CreditsPage = script.settings.creditsPage;
    const handleBackToTitle = (): void => handleChangeRoom("title");

    const scrollDurationInSeconds: number = creditsPage.scrollDurationInSeconds || 30;
    const style: CSSProperties = {"--credits-scroll-time": `${scrollDurationInSeconds}s`} as CSSProperties;

    return (
        <div className="credits-page h-100 centered column" style={style}>
            <h2>{creditsPage.title}</h2>

            {creditsPage.creditGroups.map((cg: CreditGroupType, i: number) => (
                <CreditGroup creditGroup={cg} key={i} />
            ))}
        </div>
    );
};

export default CreditsPage;