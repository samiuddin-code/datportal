import { SVGProps } from "react";

export const PrevArrowIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
            {...props}
        >
            <ellipse
                cx="10"
                cy="10"
                fill="#DFE1E6"
                rx="10"
                ry="10"
                transform="rotate(180 10 10)"
            ></ellipse>
            <path
                stroke="#137749"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6l-4 4 4 4"
            ></path>
        </svg>
    );
};