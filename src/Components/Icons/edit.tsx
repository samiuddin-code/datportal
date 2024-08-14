import { SVGProps } from "react"

interface EditIconProps extends SVGProps<SVGSVGElement> {
    onClick: (data: any) => void;
}

export const EditIcon = (props: EditIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="656"
            height="656"
            fill="none"
            viewBox="0 0 656 656"
            {...props}
        >
            <path
                fill="#42526E"
                d="M405.115 109.525L44.175 470.492a14.385 14.385 0 00-3.752 6.592L.417 637.663a14.274 14.274 0 003.751 13.502 14.22 14.22 0 0010.027 4.147c1.14 0 2.305-.14 3.439-.427l160.579-40.012a14.191 14.191 0 006.592-3.746l360.972-360.94-140.662-140.662zM635.197 60.309L595.018 20.13c-26.853-26.853-73.655-26.827-100.477 0l-49.217 49.217L585.98 210.003l49.217-49.217c13.413-13.408 20.802-31.255 20.802-50.236 0-18.98-7.389-36.828-20.802-50.241z"
            ></path>
        </svg>
    )
}