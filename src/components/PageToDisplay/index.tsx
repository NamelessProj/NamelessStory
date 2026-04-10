import * as React from "react";
import type {Page, State, VNStory} from "../../interfaces/interfaces.ts";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";
import VisualNovel from "../VisualNovelComponents/VisualNovel";

interface PageToDisplayProps {
    page: Page;
    script: VNStory;
    state: State;
    setState: (newState: State) => void;
    handleChangePage: (newPage: Page) => void;
}

const PageToDisplay: React.FC<PageToDisplayProps> = ({page, script, state, setState, handleChangePage}) => {
    switch (page) {
        case "title":
            return <TitleScreen script={script} handleStart={() => handleChangePage("game")} handleCredits={() => handleChangePage("credits")} />
        case "credits":
            return <CreditsPage script={script} handleChangeRoom={handleChangePage} />
        case "game":
            return <VisualNovel script={script} state={state} setState={setState} onChangePage={handleChangePage} />
        default:
            return null;
    }
};

export default PageToDisplay;
