import * as React from "react";
import type {Credit} from "../../../interfaces/interfaces.ts";

const CreditEl: React.FC<{ credit: Credit }> = ({credit}) => {
    return (
        <div className="credit-el centered column">
            <h3>{credit.name}</h3>
            <p>{credit.role}</p>
        </div>
    );
};

export default CreditEl;