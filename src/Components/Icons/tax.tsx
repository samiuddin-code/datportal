import { SVGProps } from "react";

export const TaxIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="15"
            fill="none"
            viewBox="0 0 14 15"
            {...props}
        >
            <path
                fill="#6B778C"
                d="M13.855 3.645l-3-3A.5.5 0 0010.5.5h-6A1.5 1.5 0 003 2v3a.5.5 0 001 0V2a.5.5 0 01.5-.5H10V3a1.5 1.5 0 001.5 1.5H13V13a.5.5 0 01-.5.5h-4a.5.5 0 000 1h4A1.5 1.5 0 0014 13V4a.5.5 0 00-.145-.355zM11 3v-.795L12.295 3.5H11.5A.5.5 0 0111 3z"
            ></path>
            <path
                fill="#6B778C"
                d="M4 6.5a4 4 0 100 8 4 4 0 000-8zm0 7a3 3 0 110-6 3 3 0 010 6z"
            ></path>
            <path
                fill="#6B778C"
                d="M4.646 9.145l-2 2a.5.5 0 00.355.858.5.5 0 00.355-.148l2-2a.502.502 0 10-.71-.71zM3 10a.5.5 0 100-1 .5.5 0 000 1zM5 12a.5.5 0 100-1 .5.5 0 000 1zM8.5 3.5h-3a.5.5 0 100 1h3a.5.5 0 100-1zM11.5 6h-3a.5.5 0 100 1h3a.5.5 0 000-1zM11.5 8.5h-2a.5.5 0 100 1h2a.5.5 0 000-1zM11.5 11h-2a.5.5 0 000 1h2a.5.5 0 000-1z"
            ></path>
        </svg>
    );
};