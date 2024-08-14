import type { FC, ReactNode } from 'react';
import { CSVLink } from "react-csv";
import styles from "./styles.module.scss";

interface ExcelExportProps {
    fileName: string;
    data: { [key: string]: string | number | boolean }[];
    headers: {
        /** The label for the column */
        label: string,
        /** The key for the column */
        key: string
    }[];
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
}

const ExcelExport: FC<ExcelExportProps> = ({ fileName, data, headers, className, onClick, icon }) => {
    return (
        <CSVLink
            data={data}
            headers={headers}
            filename={fileName}
            className={`${styles.excelExport} ${className}`}
            onClick={onClick}
        >
            {icon ? icon : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 374 459"
                    className='mr-1'
                >
                    <path
                        fill="#42526E"
                        fillRule="evenodd"
                        d="M373.333 152.832a37.243 37.243 0 00-10.944-26.389L246.891 10.944A37.248 37.248 0 00220.501 0H58.667a58.768 58.768 0 00-41.494 17.173A58.768 58.768 0 000 58.667V400a58.767 58.767 0 0017.173 41.493 58.768 58.768 0 0041.494 17.174h256c32.405 0 58.666-26.262 58.666-58.667V152.832zm-32 0V400c0 14.72-11.946 26.667-26.666 26.667h-256a26.712 26.712 0 01-18.859-7.808A26.713 26.713 0 0132 400V58.667a26.712 26.712 0 017.808-18.859A26.712 26.712 0 0158.667 32H220.5c1.408 0 2.774.555 3.776 1.557l115.499 115.499a5.344 5.344 0 011.557 3.776z"
                        clipRule="evenodd"
                    ></path>
                    <path
                        fill="#42526E"
                        fillRule="evenodd"
                        d="M213.333 26.666v74.667c0 32.405 26.261 58.666 58.667 58.666h74.666c8.832 0 16-7.168 16-16s-7.168-16-16-16H272c-14.72 0-26.667-11.946-26.667-26.666V26.666c0-8.832-7.168-16-16-16s-16 7.168-16 16zM122.027 240.639l106.667 106.667c6.229 6.251 16.384 6.251 22.613 0 6.251-6.229 6.251-16.384 0-22.613L144.64 218.026c-6.229-6.251-16.384-6.251-22.613 0-6.251 6.229-6.251 16.384 0 22.613z"
                        clipRule="evenodd"
                    ></path>
                    <path
                        fill="#42526E"
                        fillRule="evenodd"
                        d="M144.64 347.306l106.667-106.667c6.251-6.229 6.251-16.384 0-22.613-6.229-6.251-16.384-6.251-22.613 0L122.027 324.693c-6.251 6.229-6.251 16.384 0 22.613 6.229 6.251 16.384 6.251 22.613 0z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            )}
            <span>
                Export to Excel
            </span>
        </CSVLink>
    );
}
export default ExcelExport;