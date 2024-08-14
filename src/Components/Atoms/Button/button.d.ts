import { MouseEventHandler, ReactNode } from "react";

export type AppProps = {
  children?: string | ReactNode;
  size: "sm" | "md" | "lg" | "xl" | "normal" | "xs" | "w100";
  type: "primary" | "secondary" | "plain" | "danger" | "success" | "outlined" | "plain_underlined";
  htmlType: "button" | "submit";
  fontSize: "xs" | "sm" | "md" | "lg" | "xl" | "normal" | "xxl" | "xxxl";
  weight: "bolder" | "normal" | "bold" | "light" | "semi";
  onClick?: MouseEventHandler<HTMLAnchorElement> & MouseEventHandler<HTMLButtonElement>
  loading?: boolean;
  disabled?: boolean;
  ref?;
  className?: string
  style?: React.CSSProperties;
};