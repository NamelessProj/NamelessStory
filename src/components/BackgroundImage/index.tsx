import "./style.css";

interface BackgroundImageProps {
    fileName: string;
    id?: string;
}

const BackgroundImage = ({fileName, id}: BackgroundImageProps) => {
    return (
        <picture className="bg-img">
            <img
                src={`../assets/${fileName}`}
                alt="Background"
                id={id}
            />
        </picture>
    );
};

export default BackgroundImage;
