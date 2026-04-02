import * as React from "react";
import type {Page} from "../../../interfaces/interfaces.ts";

const VNOverlay: React.FC<{ saveFunc: () => void, setPage: (page: Page) => void }> = ({saveFunc, setPage}) => {
    const [isOverlayHidden, setIsOverlayHidden] = React.useState<boolean>(false);

    React.useEffect(() => {
        const handleKeyDown = (): void => {
            if (isOverlayHidden) setIsOverlayHidden(false);
        }

        window.addEventListener("keydown", handleKeyDown);

        return (): void => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOverlayHidden, setIsOverlayHidden]);

    return (
        <div className={`vn-overlay ${isOverlayHidden ? "hidden" : "show"}`}>
            <div className="overlay-top"></div>

            <div className="overlay-bottom">
                <div className="buttons-wrapper">
                    <button className="overlay-button" onClick={(): void => setPage("title")}>
                        Return Home
                    </button>
                    <button className="overlay-button" onClick={saveFunc}>
                        Save
                    </button>
                    <button className="overlay-button" onClick={(): void => setIsOverlayHidden(true)}>
                        Hide Overlay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VNOverlay;