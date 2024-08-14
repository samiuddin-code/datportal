export type propsTrype = {
  openModal: boolean;
  buttonLoading: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onFinish: (e: React.MouseEvent<HTMLElement>) => void;
  initialValues;
  type:string;
};
export type tableProps = {
  tableData;
  tableLoading;
  openModal:(e: React.MouseEvent<HTMLElement>) => void;
};