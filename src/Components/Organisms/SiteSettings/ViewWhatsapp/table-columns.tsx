import { Table, Typography as AntdTypography, Badge, Card, Button } from "antd";
import { convertDate } from "../../../../helpers/dateHandler";
import { Typography } from "../../../Atoms";
import { tableProps } from "./settings";
import { LeadsStatus } from "../../../../helpers/commonEnums";
import { FRONT_END_URL } from "../../../../helpers/constants";
import { WhatsappTypes } from "../../../../Modules/Whatsapp/types";
import { useState } from "react";
import { capitalize } from "../../../../helpers/common";
import { CalenderIcon } from "../../../Icons";

const { Paragraph } = AntdTypography;

const statusColors: { [key: number]: string } = {
    1: '#00337C',
    2: "#144272",
    3: "#1F8A70",
    4: "#AD8E70",
    5: "#EB1D36",
    6: "#EB1D36",
}

export default function TableComponent(props: tableProps) {
    const { tableData, tableLoading } = props;
    const [seeMore, setSeeMore] = useState<{ [key: number]: boolean; }>({});

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: string, _record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'Users',
            dataIndex: "from",
            key: "from",
            render: (from: string, record: WhatsappTypes) => (
                <>
                    <Paragraph
                        title={from}
                        ellipsis={{ rows: 1, expandable: false }}
                        copyable={{ text: from }}
                        className="font-size-xs color-dark-sub mb-0 mt-1"
                    >
                        From: {from}
                    </Paragraph>

                    <Paragraph
                        title={record.to}
                        ellipsis={{ rows: 1, expandable: false }}
                        copyable={{ text: record.to }}
                        className="font-size-xs color-dark-sub mb-0 mt-1"
                    >
                        To: {record.to}
                    </Paragraph>
                </>
            ),
        },
        {
            title: 'Message / Type',
            dataIndex: "message",
            key: "message",
            render: (message: string, record: WhatsappTypes) => (
                <Badge.Ribbon
                    text={capitalize(record.type)}
                    color={record.type === "incoming" ? "green" : ""}
                >
                    <Card title="Message" size="small" style={{ whiteSpace: "pre-line" }}>
                        {message.length > 100 && !seeMore[record.id] ? message.slice(0, 100) + "..." : message}
                        {message.length > 100 && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => setSeeMore({ ...seeMore, [record.id]: !seeMore[record.id] })}
                            >
                                {seeMore[record.id] ? "See Less" : "See More"}
                            </Button>
                        )}
                    </Card>
                    <div className="d-flex mt-1">
                        <CalenderIcon className="mr-2" />
                        <Typography color="dark-sub" size="sm">
                            {`${convertDate(record.addedDate, "dd M,yy-t")}` || "N/A"}
                        </Typography>
                    </div>
                </Badge.Ribbon>
            ),
            width: "20%",
        },
        {
            title: 'Property',
            dataIndex: "property",
            key: "property",
            render: (property: WhatsappTypes['property']) => (
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
            width: "15%",
        },
        {
            title: "Organization",
            dataIndex: "organization",
            key: "organization",
            render: (organization: WhatsappTypes['organization']) => (
                <>
                    <Typography color="dark-sub" size="xs" className="ml-2 my-auto">
                        {`Name: ${organization?.name}`}
                    </Typography>

                    <Typography color="dark-sub" size="xs" className="ml-2 my-auto">
                        {`ID: ${organization?.id}`}
                    </Typography>
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: "status",
            key: "status",
            render: (status: number) => (
                <Typography
                    color="dark-main" size="sm"
                    style={{
                        backgroundColor: statusColors[status],
                        color: "#fff",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        display: "flex",
                        width: "fit-content",
                        justifyContent: "space-between",
                    }}
                >
                    {`${LeadsStatus[status]}`}
                </Typography>
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
            />
        </div>
    );
}