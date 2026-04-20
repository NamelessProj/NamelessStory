import {type ButtonHTMLAttributes, type DetailedHTMLProps, memo} from "react";
import type {Page} from "../../../interfaces/interfaces.ts";

import styles from './style.module.css';

interface VNOverlayProps {
    exportSaveFunc: () => void;
    onBack: () => void;
    hasHistory: boolean;
    setPage: (page: Page) => void;
    isOverlayHidden: boolean;
    setIsOverlayHidden: (hidden: boolean) => void;
}

const defaultButtonProps: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> = {
    className: styles.overlayButton,
    type: 'button'
}

const VNBottomOverlay = memo(({exportSaveFunc, onBack, hasHistory, setPage, isOverlayHidden, setIsOverlayHidden}: VNOverlayProps) => {
    return (
        <div className={`${styles.overlay} ${styles.overlayBottom} ${isOverlayHidden ? styles.hidden : ""}`}>
            <div className={styles.buttonsWrapper}>
                <button {...defaultButtonProps} onClick={(): void => setPage("title")}>
                    Return Home
                </button>
                {hasHistory && (
                    <button {...defaultButtonProps} onClick={onBack}>
                        Back
                    </button>
                )}
                <button {...defaultButtonProps} onClick={exportSaveFunc}>
                    Export Save
                </button>
                <button {...defaultButtonProps} onClick={(): void => setIsOverlayHidden(true)}>
                    Hide Overlay
                </button>
            </div>
        </div>
    );
});

export default VNBottomOverlay;
