import * as React from "react";
import type {Page} from "../../interfaces/interfaces.ts";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";
import VisualNovel from "../VisualNovelComponents/VisualNovel";

interface PageToDisplayProps {
    page: Page;
    handleChangePage: (newPage: Page) => void;
    handleContinue?: () => void;
}

const PageToDisplay: React.FC<PageToDisplayProps> = ({page, handleChangePage, handleContinue}) => {
    switch (page) {
        case "title":
            return <TitleScreen handleStart={() => handleChangePage("game")} handleCredits={() => handleChangePage("credits")} handleContinue={handleContinue} />
        case "credits":
            return <CreditsPage handleChangeRoom={handleChangePage} />
        case "game":
            return <VisualNovel onChangePage={handleChangePage} />
        default:
            return null;
    }
};

export default PageToDisplay;
