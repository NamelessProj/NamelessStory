import * as React from "react";
import "./style.css";

interface BackgroundImageProps {
    fileName: string;
    id?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({fileName, id}) => {
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
