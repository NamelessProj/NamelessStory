import type {Credit, CreditGroupType} from "../../../interfaces/interfaces.ts";
import CreditEl from "../CreditEl";

import styles from './style.module.css';

const CreditGroup = ({creditGroup}: { creditGroup: CreditGroupType }) => {
    return (
        <div className={`${styles.creditGroup} centered column`}>
            <h2>{creditGroup.groupName}</h2>

            {creditGroup.credits.map((credit: Credit, i: number) => (
                <CreditEl credit={credit} key={i} />
            ))}
        </div>
    );
};

export default CreditGroup;