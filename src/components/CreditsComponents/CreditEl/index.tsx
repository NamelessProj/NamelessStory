import type {Credit} from "../../../interfaces/interfaces.ts";

import './style.css';

const CreditEl = ({credit}: { credit: Credit }) => {
    return (
        <div className="credit-el centered column">
            <h3>{credit.name}</h3>
            {credit.role && <p>{credit.role}</p>}
        </div>
    );
};

export default CreditEl;