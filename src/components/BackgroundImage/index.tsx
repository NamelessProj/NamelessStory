import {memo} from "react";
import styles from "./style.module.css";

interface BackgroundImageProps {
    fileName: string;
    id?: string;
}

const BackgroundImage = memo(({fileName, id}: BackgroundImageProps) => {
    return (
        <picture className={styles.bgImg}>
            <img
                src={`../assets/${fileName}`}
                alt="Background"
                id={id}
            />
        </picture>
    );
});

export default BackgroundImage;
