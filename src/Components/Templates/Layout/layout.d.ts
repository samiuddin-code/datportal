import { ReactNode } from "react";

export type LayoutProps = {
  children?: ReactNode;
  withHeader?: boolean;
  title?: string;
  showAddProject?: boolean;
  adminNav?: boolean;
  className?: string;
  profileNav?: boolean;
  permissionSlug?: string[]
};