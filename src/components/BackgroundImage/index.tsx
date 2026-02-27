import * as React from "react";
import './style.css';

const BackgroundImage: React.FC<{ fileName: string, id?: string }> = ({fileName, id}) => {
    return (
        <picture className="bg-img">
            <img
                src={`../assets/${fileName}`}
                alt="Credits Background"
                id={id}
            />
        </picture>
    );
};

export default BackgroundImage;