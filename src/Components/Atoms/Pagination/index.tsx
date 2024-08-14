import { Pagination as Paginator } from "antd";
import styles from "./styles.module.scss";

interface PaginationProps {
  total: number;
  current: number;
  defaultPageSize: number;
  onChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: Array<number>;
}

export const Pagination = (props: PaginationProps) => {
  const {
    total, current, defaultPageSize, onChange,
    pageSizeOptions = [10, 20, 50, 100],
  } = props;

  return (
    <div className={styles.paginationSection}>
      <Paginator
        total={total} current={current}
        defaultPageSize={defaultPageSize}
        onChange={onChange} showSizeChanger
        pageSizeOptions={pageSizeOptions}
        showTotal={(total, range) => `${range?.[0]}-${range?.[1] || 0} of  ${total ? total : 0} items`}
      />
    </div>
  );
};
