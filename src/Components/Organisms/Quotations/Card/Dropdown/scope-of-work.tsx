import type { FC } from 'react';
import { QuotationTypes } from '@modules/Quotation/types';
import styles from '../styles.module.scss';

interface ScopeOfWorkProps {
  item: QuotationTypes
}

const ScopeOfWork: FC<ScopeOfWorkProps> = ({ item }) => {
  return (
    <div
      className={`mx-2 color-dark-sub ${styles.accordianItem}`}
      dangerouslySetInnerHTML={{ __html: item?.scopeOfWork }}
    ></div>
  );
}
export default ScopeOfWork;