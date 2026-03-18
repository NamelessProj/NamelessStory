import * as React from "react";
import type {Page, State, VNStory} from "../../interfaces/interfaces.ts";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";
import VisualNovel from "../VisualNovelComponents/VisualNovel";

const PageToDisplay: React.FC<{ page: Page, script: VNStory, state: State, handleChangePage: (newPage: Page) => void }> = ({page, script, state, handleChangePage}) => {
    switch (page) {
        case "title":
            return <TitleScreen script={script} handleStart={() => handleChangePage("game")} handleCredits={() => handleChangePage("credits")} />
        case "credits":
            return <CreditsPage script={script} handleChangeRoom={handleChangePage} />
        case "game":
            return <VisualNovel script={script} state={state} />
        default:
            return null;
    }
}

export default PageToDisplay;