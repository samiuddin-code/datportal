import { SVGProps } from "react";

export const AddShortcutIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            fill="none"
            viewBox="0 0 21 21"
            {...props}
        >
            <path
                fill="#000"
                fillRule="evenodd"
                d="M2.5 2.5A1.5 1.5 0 001 4v14a1.5 1.5 0 001.5 1.5h14A1.5 1.5 0 0018 18V8.5h1V18a2.5 2.5 0 01-2.5 2.5h-14A2.5 2.5 0 010 18V4a2.5 2.5 0 012.5-2.5H12v1H2.5zM20.5 3.5h-6v-1h6v1z"
                clipRule="evenodd"
            ></path>
            <path
                fill="#000"
                fillRule="evenodd"
                d="M18 0v6h-1V0h1z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
};