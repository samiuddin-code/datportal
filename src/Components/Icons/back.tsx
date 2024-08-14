import { SVGProps } from "react";

export const BackIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="14"
            fill="none"
            viewBox="0 0 20 14"
            {...props}
        >
            <path fill="#DFE1E6" d="M7 14l1.41-1.41L3.83 8H20V6H3.83l4.59-4.59L7 0 0 7l7 7z"></path>
            <path
                fill="#000"
                fillOpacity="0.2"
                d="M7 14l1.41-1.41L3.83 8H20V6H3.83l4.59-4.59L7 0 0 7l7 7z"
            ></path>
        </svg>
    );
};