import * as React from "react";
import './style.css';

const BackgroundImage: React.FC<{ fileName: string }> = ({fileName}) => {
    return (
        <picture className="bg-img">
            <img
                src={`../assets/${fileName}`}
                alt="Credits Background"
            />
        </picture>
    );
};

export default BackgroundImage;