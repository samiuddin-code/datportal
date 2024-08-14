import type { FC } from 'react';
import { Table, Typography as AntdTypography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LeadsTypes } from '../../../../../Modules/Leads/types';
import { convertDate } from '../../../../../helpers/dateHandler';
import { Typography } from '../../../../Atoms';
import { FRONT_END_URL } from '../../../../../helpers/constants';
import { CalenderIcon } from '../../../../Icons';

const { Paragraph } = AntdTypography;

interface LogsTableProps {
    data: Partial<LeadsTypes[]>
}


const LogsTable: FC<LogsTableProps> = ({ data }) => {
    const columns: ColumnsType<any> = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (text: string, record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'User',
            dataIndex: "user",
            key: "user",
            render: (user: string, record: LeadsTypes) => (
                <div className="d-flex">
                    <div className="my-auto">
                        {/* <Typography color="dark-main" size="sm">
                            {`${record.name}`}
                        </Typography> */}

                        {/* {record?.email && (
                            <Paragraph
                                title={record.email}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: record.email }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Email:  {record.email}
                            </Paragraph>
                        )} */}

                        {/* {record?.phone && (
                            <Paragraph
                                title={`+${record.phoneCode}${record.phone}`}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: `+${record.phoneCode}${record.phone}` }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Phone:   {`+${record.phoneCode}${record.phone}`}
                            </Paragraph>
                        )} */}

                        {/* {record?.slug && (
                            <Paragraph
                                title={record.slug}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: record.slug }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Slug:  {record.slug}
                            </Paragraph>
                        )}
                        {record?.source && (
                            <Typography color="dark-sub" size="xs">
                                {`Source: ${record?.source}`}
                            </Typography>
                        )} */}

                        {/* {record?.property?.slug && (
                            <div className="d-flex">
                                <Typography color="dark-main" size="sm" weight="bold">
                                    {`View Property (${record?.property?.id})`}
                                </Typography>
                                <a
                                    href={`${FRONT_END_URL}/en/property/${record.property.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={record?.property?.localization[0]?.title}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        height={"16px"}
                                        width={"17px"}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                    </svg>
                                </a>
                            </div>
                        )} */}

                        <div className="d-flex mt-4">
                            <CalenderIcon className="mr-2" />
                            <Typography color="dark-sub" size="sm">
                                {`${convertDate(record.addedDate, "dd MM yy")}`}
                            </Typography>
                        </div>
                    </div>
                </div>
            ),
            width: "18%",
        },
        {
            title: 'Message',
            dataIndex: "message",
            key: "message",
            render: (message: string) => (
                <Typography color="dark-main" size="sm">
                    {message}
                </Typography>
            ),
            width: "20%",
        },
        // {
        //     title: 'Note',
        //     dataIndex: 'note',
        //     key: 'note',
        //     render: (note: LeadsTypes['leadNotes']) => (
        //         <span>{note?.map((item) => item.note)}</span>
        //     )
        // },
    ];

    return <Table dataSource={data} columns={columns} />
}
export default LogsTable;