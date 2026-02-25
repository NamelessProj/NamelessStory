import * as React from "react";
import type {Page, VNStory} from "../../../interfaces/interfaces.ts";
import PrimaryButton from "../../PrimaryButton";

const Index: React.FC<{ script: VNStory, handleChangeRoom: (page: Page) => void }> = ({script, handleChangeRoom}) => {
    const handleBackToTitle = () => handleChangeRoom("title");

    return (
        <div className="h-100 centered column">
            <h2>{script.settings.creditsPage.title}</h2>
            <PrimaryButton
                text="Back to Title"
                onClick={handleBackToTitle}
            />
        </div>
    );
};

export default Index;