import * as React from "react";
import type {Credit, CreditGroupType} from "../../../interfaces/interfaces.ts";
import CreditEl from "../CreditEl";

const CreditGroup: React.FC<{ creditGroup: CreditGroupType }> = ({creditGroup}) => {
    return (
        <div className="credit-group centered column">
            <h2>{creditGroup.groupName}</h2>

            {creditGroup.credits.map((credit: Credit, i: number) => (
                <CreditEl credit={credit} key={i} />
            ))}
        </div>
    );
};

export default CreditGroup;