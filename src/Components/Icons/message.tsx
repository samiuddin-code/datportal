import { SVGProps } from "react";

export const MessageIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32" height="32"
      viewBox="0 0 24 24" fill="none"
      {...props}
    >
      <path
        d="M8.5 19H8c-4 0-6-1-6-6V8c0-4 2-6 6-6h8c4 0 6 2 6 6v5c0 4-2 6-6 6h-.5c-.31 0-.61.15-.8.4l-1.5 2c-.66.88-1.74.88-2.4 0l-1.5-2c-.16-.22-.53-.4-.8-.4Z"
        stroke={props.stroke || "#FF8A65"}
        strokeWidth="1.5" strokeMiterlimit="10"
        strokeLinecap="round" strokeLinejoin="round"
      ></path>
      <path
        d="M7 8h10M7 13h6" stroke={props.stroke || "#FF8A65"}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      ></path>
    </svg>
  );
};