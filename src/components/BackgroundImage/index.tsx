import styles from "./style.module.css";

interface BackgroundImageProps {
    fileName: string;
    id?: string;
}

const BackgroundImage = ({fileName, id}: BackgroundImageProps) => {
    return (
        <picture className={styles.bgImg}>
            <img
                src={`../assets/${fileName}`}
                alt="Background"
                id={id}
            />
        </picture>
    );
};

export default BackgroundImage;
