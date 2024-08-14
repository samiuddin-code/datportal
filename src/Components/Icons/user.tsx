import { SVGProps } from "react";

interface UserIconProps extends SVGProps<SVGSVGElement> {
    multiple?: boolean;
}

export const UserIcon = (props: UserIconProps) => {
    const { multiple = false } = props;

    return (
        <>
            {multiple ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24"
                    viewBox="0 0 24 24"
                    fill="none">
                    <path
                        d="M9.16 10.87c-.1-.01-.22-.01-.33 0a4.42 4.42 0 0 1-4.27-4.43C4.56 3.99 6.54 2 9 2a4.435 4.435 0 0 1 .16 8.87ZM16.41 4c1.94 0 3.5 1.57 3.5 3.5 0 1.89-1.5 3.43-3.37 3.5a1.13 1.13 0 0 0-.26 0M4.16 14.56c-2.42 1.62-2.42 4.26 0 5.87 2.75 1.84 7.26 1.84 10.01 0 2.42-1.62 2.42-4.26 0-5.87-2.74-1.83-7.25-1.83-10.01 0ZM18.34 20c.72-.15 1.4-.44 1.96-.87 1.56-1.17 1.56-3.1 0-4.27-.55-.42-1.22-.7-1.93-.86"
                        stroke={props.stroke || "#137749"} strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                    </path>
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="53"
                    height="53"
                    fill="none"
                    viewBox="0 0 53 53"
                    {...props}
                >
                    <path
                        fill={props.fill || "#137749"}
                        d="M26.5 24.607A11.357 11.357 0 1015.143 13.25 11.368 11.368 0 0026.5 24.607zm0-18.929a7.571 7.571 0 110 15.143 7.571 7.571 0 010-15.143zM47.275 41.912a22.724 22.724 0 00-41.552 0 6.544 6.544 0 002.842 8.414 6.471 6.471 0 003.098.781h29.672a6.472 6.472 0 005.444-2.953 6.545 6.545 0 00.496-6.242zm-3.668 4.177a2.663 2.663 0 01-2.272 1.232H11.663a2.663 2.663 0 01-2.271-1.232 2.737 2.737 0 01-.207-2.65 18.93 18.93 0 0134.628 0 2.736 2.736 0 01-.206 2.65z"
                    ></path>
                </svg>
            )}

        </>
    );
};