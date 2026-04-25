import type {DialogueTransition, SceneTransition, TransitionPhase} from "../../../interfaces/interfaces.ts";
import styles from "./style.module.css";

interface TransitionOverlayProps {
    phase: TransitionPhase;
    type: SceneTransition | DialogueTransition;
}

const isColorOverlay = (type: SceneTransition | DialogueTransition): type is "fade-to-black" | "fade-to-white" =>
    type === "fade-to-black" || type === "fade-to-white";

const TransitionOverlay = ({phase, type}: TransitionOverlayProps) => {
    if (phase === "idle" || !isColorOverlay(type)) return null;
    return (
        <div
            className={`${styles.overlay} ${phase === "out" ? styles.fadeIn : styles.fadeOut}`}
            style={{backgroundColor: type === "fade-to-black" ? "#000" : "#fff"}}
        />
    );
};

export default TransitionOverlay;
