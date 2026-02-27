import * as React from "react";
import type {Page, VNStory} from "../../interfaces/interfaces.ts";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";

const PageToDisplay: React.FC<{ page: Page, script: VNStory, handleChangePage: (newPage: Page) => void }> = ({page, script, handleChangePage}) => {
    switch (page) {
        case "title":
            return <TitleScreen script={script} handleStart={() => handleChangePage("game")} handleCredits={() => handleChangePage("credits")} />
        case "credits":
            return <CreditsPage script={script} handleChangeRoom={handleChangePage} />
        case "game":
            return <div>Game</div>
        default:
            return null;
    }
}

export default PageToDisplay;