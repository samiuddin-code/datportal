import { ReactNode, CSSProperties } from "react";

export type selectProps = {
  options: {
    value: any
    label: any;
  }[]
  placeholder: string | ReactNode;
  label: string;
  mode: "multiple" | "tags" | undefined;
  asterisk: boolean;
  onSearch?: (val: string) => void;
  onSelect?: (item) => void;
  onDropdownVisibleChange?: (item) => void;
  value?: string;
  defaultValue?: any
  onChange?: (value: string,
    option:
      | {
        value: any;
        label: any;
      }
      | {
        value: any;
        label: any;
      }[]
  ) => void;
  dropdownMatchSelectWidth?: boolean | number;
  maxTagCount?: number;
  disabled?: boolean;
  helperText?: string;
  bordered?: boolean;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  clearIcon?: ReactNode;
  className?: string;
};
