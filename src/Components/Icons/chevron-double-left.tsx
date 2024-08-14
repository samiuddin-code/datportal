import { SVGProps } from "react";

export const ChevronDoubleLeft = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#137749"
            viewBox="0 0 448 512"
            strokeWidth={1.5}
            stroke="currentColor"
            width={20}
            height={20}
            {...props}
        >
            <path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z" />
            <path style={{ opacity: 0.4 }} d="M416 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L269.3 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C432.4 476.9 424.2 480 416 480z" />
        </svg>
    );
};