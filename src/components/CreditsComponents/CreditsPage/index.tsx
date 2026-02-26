import * as React from "react";
import type {CreditGroupType, CreditsPage, Page, VNStory} from "../../../interfaces/interfaces.ts";
import PrimaryButton from "../../PrimaryButton";
import CreditGroup from "../CreditGroup";

const CreditsPage: React.FC<{ script: VNStory, handleChangeRoom: (page: Page) => void }> = ({script, handleChangeRoom}) => {
    const creditsPage: CreditsPage = script.settings.creditsPage;
    const handleBackToTitle = (): void => handleChangeRoom("title");

    return (
        <div className="credits-page h-100 centered column">
            <h2>{creditsPage.title}</h2>
            <PrimaryButton
                text="Back to Title"
                onClick={handleBackToTitle}
            />

            {creditsPage.creditGroups.map((cg: CreditGroupType, i: number) => (
                <CreditGroup creditGroup={cg} key={i} />
            ))}
        </div>
    );
};

export default CreditsPage;