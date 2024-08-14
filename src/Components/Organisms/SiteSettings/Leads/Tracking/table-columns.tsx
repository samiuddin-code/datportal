import { Table, Typography as AntdTypography } from "antd";
// import { LeadsSource, PropertyCategories } from "../../../../../helpers/commonEnums";
import { convertDate } from "../../../../../helpers/dateHandler";
import { LeadsTrackingTypes } from "../../../../../Modules/Leads/types";
import { Typography } from "../../../../Atoms";
import { TableProps } from "../../../Common/common-types";
import { FRONT_END_URL } from "../../../../../helpers/constants";

const { Paragraph } = AntdTypography;

export default function TableComponent(props: TableProps & { tableData: LeadsTrackingTypes[] }) {
    const { tableData, tableLoading, emptyText } = props;

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: string, _record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'Slug',
            dataIndex: "slug",
            key: "slug",
            render: (_slug: string, record: LeadsTrackingTypes) => (
                <div className="d-flex">
                    <div className="my-auto">
                        {record?.slug && (
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

                        <Typography color="dark-sub" size="xs">
                            {`Added: ${convertDate(record?.addedDate, "dd M,yy-t")}`}
                        </Typography>

                        {record?.modifiedDate && (
                            <Typography color="dark-sub" size="xs">
                                {`Modified: ${convertDate(record?.modifiedDate, "dd M,yy-t")}`}
                            </Typography>
                        )}
                    </div>
                </div>
            ),
        },
        // {
        //     title: 'Source',
        //     dataIndex: "source",
        //     key: "source",
        //     className: 'text-center',
        //     render: (source: keyof typeof LeadsSource) => (
        //         <Typography color="dark-main" size="sm">
        //             {LeadsSource[source]}
        //         </Typography>
        //     ),
        //     width: "100px",
        // },
        {
            title: 'Message',
            dataIndex: "message",
            key: "message",
            render: (message: string) => (
                <Typography color="dark-main" size="sm">
                    {message}
                </Typography>
            ),
        },
        {
            title: 'Agent',
            dataIndex: "agent",
            key: "agent",
            render: (_agent: string, record: LeadsTrackingTypes) => (
                <>
                    {record?.property?.assignedTo && (
                        <>
                            <Paragraph
                                title={`${record.property.assignedTo?.firstName} ${record.property.assignedTo?.lastName}`}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{
                                    text: `${record.property.assignedTo?.firstName} ${record.property.assignedTo?.lastName}`,
                                }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Name: {`${record.property.assignedTo?.firstName} ${record.property.assignedTo?.lastName}`}
                            </Paragraph>
                            <Paragraph
                                title={record.property.assignedTo?.email}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: record.property.assignedTo?.email }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Email: {record.property.assignedTo?.email}
                            </Paragraph>
                            <Paragraph
                                title={`${record.property.assignedTo?.phoneCode}${record.property.assignedTo?.phone}`}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: `${record.property.assignedTo?.phoneCode}${record.property.assignedTo?.phone}` }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                Phone: {`${record.property.assignedTo?.phoneCode}${record.property.assignedTo?.phone}`}
                            </Paragraph>
                            <Paragraph
                                title={`${record.property.assignedTo?.id}`}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: `${record.property.assignedTo?.id}` }}
                                className="font-size-sm color-dark-main mb-0 mt-1"
                            >
                                {`ID: ${record.property.assignedTo?.id}`}
                            </Paragraph>
                        </>
                    )}
                </>
            ),
        },
        {
            title: 'Property',
            dataIndex: "property",
            key: "property",
            render: (property: LeadsTrackingTypes['property']) => (
                <>
                    {property?.id && (
                        <Typography color="dark-main" size="sm">
                            {`ID: ${property?.id}`}
                        </Typography>
                    )}

                    {property?.localization && (
                        <Paragraph
                            title={property.localization[0]?.title}
                            ellipsis={{
                                rows: 1,
                                expandable: false,
                            }}
                            copyable={{ text: property.localization[0]?.title }}
                            className="font-size-xs color-dark-sub mb-0 mt-1"
                        >
                            Name: {property.localization[0]?.title}
                        </Paragraph>
                    )}

                    {property?.category?.slug && (
                        <Typography color="dark-sub" size="xs">
                            ""
                            {/* {`Category: ${PropertyCategories[property.category.slug]}`} */}
                        </Typography>
                    )}

                    {/** View Property On Main Website (Users Website) */}
                    {property?.slug && (
                        <div className="d-flex">
                            <Typography color="dark-main" size="sm" weight="bold">
                                View Property:
                            </Typography>
                            <a
                                href={`${FRONT_END_URL}/en/property/${property.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title={property.localization[0]?.title}
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
                    )}
                </>
            ),
        },
        {
            title: 'User',
            dataIndex: "userAgent",
            key: "userAgent",
            render: (_userAgent: number, record: LeadsTrackingTypes) => (
                <>
                    {record?.userIP && (
                        <Paragraph
                            title={record.userIP}
                            ellipsis={{
                                rows: 1,
                                expandable: false,
                            }}
                            copyable={{ text: record.userIP }}
                            className="font-size-xs color-dark-sub mb-0 mt-1"
                        >
                            IP: {record.userIP}
                        </Paragraph>
                    )}

                    {record?.userAgent && (
                        <Paragraph
                            title={record.userAgent}
                            copyable={{ text: record.userAgent }}
                            className="font-size-xs color-dark-sub mb-0 mt-1"
                        >
                            User Agent: {record.userAgent}
                        </Paragraph>
                    )}
                </>
            ),
        },
        {
            title: 'Organisation',
            dataIndex: "agency",
            key: "agency",
            render: (_agency: string, record: LeadsTrackingTypes) => (
                <>
                    {record?.property?.agency && (
                        <Paragraph
                            title={record?.property?.agency?.name}
                            ellipsis={{
                                rows: 1,
                                expandable: false,
                            }}
                            copyable={{ text: record?.property?.agency?.name }}
                            className="font-size-xs color-dark-sub mb-0 mt-1"
                        >
                            Name: {record?.property?.agency?.name}
                        </Paragraph>
                    )}
                    {record?.property && (
                        <Typography color="dark-main" size="sm">
                            {`ID: ${record?.property?.agency.id}`}
                        </Typography>
                    )}
                </>
            ),
        },
    ];

    return (
        <div>
            <Table
                sticky
                dataSource={tableData}
                columns={columns}
                pagination={false}
                scroll={{ x: 991 }}
                loading={tableLoading}
                rowKey={(record: LeadsTrackingTypes) => `leads-tracking-${record.id}`}
                locale={{ emptyText: emptyText }}
            />
        </div>
    );
}