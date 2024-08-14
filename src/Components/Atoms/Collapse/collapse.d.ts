export type propsType = {
  accordian: boolean;
  header: string;
  children?: React.ReactNode;
  expandIconPosition: "start" | "end";
  withPanel: boolean;
  className: string;
  defaultActiveKey: number;
};