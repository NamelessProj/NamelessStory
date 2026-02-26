import * as React from "react";
import type {CreditGroupType, Page, VNStory} from "../../../interfaces/interfaces.ts";
import PrimaryButton from "../../PrimaryButton";
import CreditGroup from "../CreditGroup";

const CreditsPage: React.FC<{ script: VNStory, handleChangeRoom: (page: Page) => void }> = ({script, handleChangeRoom}) => {
    const handleBackToTitle = () => handleChangeRoom("title");

    return (
        <div className="h-100 centered column">
            <h2>{script.settings.creditsPage.title}</h2>
            <PrimaryButton
                text="Back to Title"
                onClick={handleBackToTitle}
            />

            {script.settings.creditsPage.creditGroups.map((cg: CreditGroupType, i: number) => (
                <CreditGroup creditGroup={cg} key={i} />
            ))}
        </div>
    );
};

export default CreditsPage;