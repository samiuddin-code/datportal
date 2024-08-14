import React from "react";

export type propType = {
  children: React.ReactNode;
  table: React.ReactNode;
  filters: React.ReactNode;
  pagination: React.ReactNode;
  currentCrumb: string;
  heading: string;
  tableData: Array;
  columns: Array;
  onButtonClick: React.MouseEventHandler<HTMLButtonElement>;
  tableLoading: boolean;
  buttonLoading: boolean;
};
