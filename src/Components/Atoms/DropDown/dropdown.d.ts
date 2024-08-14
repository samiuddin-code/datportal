import { ItemType } from "antd/lib/menu/hooks/useItems";
import { CSSProperties } from "react";

export type AppProps = {
  children?: string | React.ReactNode;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "normal" | "xxl" | "xxxl";
  weight: "bolder" | "normal" | "bold" | "light" | "semi";
  color:
    | "dark-main"
    | "active"
    | "dark-sub"
    | "light-100"
    | "checked"
    | "warning";
  lineHeight: number;
  trigger: ("click" | "hover" | "contextMenu")[];
  items: ItemType[];
  type: "tag" | "normal";
  tagType: string;
  showArrow: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  overlayClassName?: string;
  style?: CSSProperties;
  disabled?: boolean;
};