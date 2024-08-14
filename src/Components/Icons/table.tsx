import { SVGProps } from "react";

export const TableIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="18" height="14" viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 12.5v-11C0 1.08.15.73.44.44.73.14 1.08 0 1.5 0h15c.42 0 .77.15 1.06.44.3.29.44.64.44 1.06v11c0 .42-.15.77-.44 1.06-.29.3-.64.44-1.06.44h-15c-.42 0-.77-.15-1.06-.44-.3-.29-.44-.64-.44-1.06zm1.5-8.32h2.65V1.5H1.5v2.67zm4.15 0H16.5V1.5H5.65v2.67zm0 4.14H16.5V5.67H5.65v2.65zm0 4.18H16.5V9.82H5.65v2.68zm-4.15 0h2.65V9.82H1.5v2.68zm0-4.18h2.65V5.67H1.5v2.65z">
      </path>
    </svg>
  );
};