import { SVGProps } from "react";

export const PasswordUnlock = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            <path stroke="none" d="M0 0h24v24H0z"></path>
            <rect width="14" height="10" x="5" y="11" rx="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M8 11V6a4 4 0 018 0"></path>
        </svg>
    );
};