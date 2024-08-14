import { ReactNode } from "react";

export type filtersType = {
  title: string;
  status: string;
  id: string;
  categoryId: number[];
  __bathrooms: string[];
  __bedrooms: string[];
  furnishingStatus: string;
  featured: string;
  typeIds: number[];
  minArea: string;
  maxArea: string;
  maxPrice: string;
  minPrice: string;
  rentalPeriod: string;
  slug: string;
  location: number[];
  state: number[];
  agentIds: number[];
  completionStatus: string;
  reference: string;
  agencyId: string;
  toDate: string;
  fromDate: string;
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
  },
  [x: string]: any
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
  types?;
  [x: string]: any
};