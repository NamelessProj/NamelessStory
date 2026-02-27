import * as React from "react";
import {useEffect} from "react";

const Dialogue: React.FC<{ text: string, textSpeed: number, setTyping: (val: boolean) => void }> = ({text, textSpeed, setTyping}) => {
    useEffect(() => {
        setTyping(true);
        const timer = setTimeout(() => {setTyping(false);}, 2000);

        return () => clearTimeout(timer);
    }, [setTyping]);

    return (
        <div className="vn-dialogue-box">
            <p className="vn-dialogue-text">{text}</p>
        </div>
    );
};

export default Index;