import type {Credit} from "../../../interfaces/interfaces.ts";

import styles from './style.module.css';

const CreditEl = ({credit}: { credit: Credit }) => {
    return (
        <div className={`${styles.creditEl} centered column`}>
            <h3>{credit.name}</h3>
            {credit.role && <p>{credit.role}</p>}
        </div>
    );
};

export default CreditEl;