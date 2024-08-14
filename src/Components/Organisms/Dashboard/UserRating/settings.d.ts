import { LeadsTypes_QUERY_TYPES } from "../../../../Modules/Leads/types";

export type propsType = {
  openModal: boolean;
  buttonLoading: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onFinish: (e: React.MouseEvent<HTMLElement>) => void;
  initialValues;
  type: string;
};
export type tableProps = {
  tableData;
  tableLoading;
  openModal?: (e: React.MouseEvent<HTMLElement>) => void;
  emptyText?: React.ReactNode;
  reloadTableData: (query?: LeadsTypes_QUERY_TYPES) => void;
};