import type {Page, State} from "../../interfaces/interfaces.ts";
import TitleScreen from "../TitleScreen";
import CreditsPage from "../CreditsComponents/CreditsPage";
import VisualNovel from "../VisualNovelComponents/VisualNovel";

interface PageToDisplayProps {
    page: Page;
    handleChangePage: (newPage: Page) => void;
    handleContinue?: () => void;
    handleLoadSave: (state: State) => void;
    savedStateError?: string | null;
}

const PageToDisplay = ({page, handleChangePage, handleContinue, handleLoadSave, savedStateError}: PageToDisplayProps) => {
    switch (page) {
        case "title":
            return <TitleScreen handleStart={() => handleChangePage("game")} handleCredits={() => handleChangePage("credits")} handleContinue={handleContinue} handleLoadSave={handleLoadSave} savedStateError={savedStateError} />
        case "credits":
            return <CreditsPage handleChangeRoom={handleChangePage} />
        case "game":
            return <VisualNovel onChangePage={handleChangePage} />
        default:
            return null;
    }
};

export default PageToDisplay;
