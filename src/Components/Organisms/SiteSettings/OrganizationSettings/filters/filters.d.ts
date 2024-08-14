import { ReactNode } from "react";

export type filtersType = {
  name: string;
  isPublished: string;
  email: string;
  phone: string;
  status: string;
  fromDate?: any;
  toDate?: any;
  sortOrder?: string;
  sortByField?: string;
};
export type moreFilterProps = {
  values: string[];
  setValues: Dispatch<SetStateAction<string[]>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  visible: boolean;
  moreItems: { label: string, value: string }[];
};
export type multiSelectFilterProps = {
  value;
  onChange;
  data;
  filters;
  type;
  label;
  onFilter;
  show;
  filterType?: "multi" | "single" | "input" | "search";
  getChild?: boolean;
  showFooter?: boolean;
  searchProps?: {
    onSearch;
  }
};
export type multiInputFilterProps = {
  values;
  onChange;
  filters;
  labels;
  label;
  onFilter;
  show;
  subTypes;
  type;
  showFooter: boolean;
  children?: ReactNode;
};