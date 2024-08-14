import { Key, useMemo, useState } from "react";
import { Card, Dropdown, message, Space, Table, Popconfirm } from "antd";
import { DownOutlined, DeleteOutlined } from "@ant-design/icons";
import { convertDate } from "@helpers/dateHandler";
import { LeadsTypes, LeadsParamTypes } from "@modules/Leads/types";
import { LeadsModule } from "@modules/Leads";
import { Typography } from "@atoms/";
import styles from "./styles.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { ActionComponentProps, TableProps } from "@organisms/Common/common-types";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { QueryType } from "@modules/Common/common.interface";

interface _ActionComponentProps extends ActionComponentProps {
    record: LeadsTypes;
    onAddNoteClick: (record: LeadsTypes) => void;
    permissions: { [key in LeadsPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
    const {
        record, onEditIconClick, onAddNoteClick,
        reloadTableData, permissions: { deleteLeads }
    } = props;

    const module = useMemo(() => new LeadsModule(), []);

    const [actionState, setActionState] = useState({
        confirmLoading: false,
        openPopConfirm: false,
    });

    const showPopconfirm = () => {
        setActionState({
            ...actionState,
            openPopConfirm: true,
        });
    };

    const handleDelete = () => {
        setActionState({
            ...actionState,
            confirmLoading: true,
        });

        if (deleteLeads === false) {
            message.error("You don't have permission to delete this record, please contact your admin.");
            setActionState({
                ...actionState,
                openPopConfirm: false,
            });
            return;
        }

        module.deleteRecord(record.id).then(() => {
            setActionState({
                ...actionState,
                openPopConfirm: false,
                confirmLoading: false,
            });
            reloadTableData();
        }).catch((err) => {
            const errorMessage = err?.response?.data?.message
            message.error(errorMessage || "Something went wrong, please try again later.");
            setActionState({
                ...actionState,
                confirmLoading: false,
            });
        });
    };

    return (
        <div className={styles.actions}>
            <span onClick={() => onEditIconClick(record)}>
                <img src="/images/editicon.svg" alt="Edit Icon" />
            </span>
            <span onClick={() => onAddNoteClick(record)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#fff"
                    width={19}
                    height={19}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                </svg>
            </span>
            <Popconfirm
                open={actionState.openPopConfirm}
                placement="top"
                title="Are you sure?"
                onConfirm={handleDelete}
                onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
                okButtonProps={{ loading: actionState.confirmLoading }}
                okText="Yes"
                cancelText="No"
                onOpenChange={(visible) => {
                    if (!visible) {
                        setActionState({ ...actionState, openPopConfirm: false });
                    }
                }}
            >
                <DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
            </Popconfirm>
        </div>
    );
};

type StatusDropdownProps = {
    status: number;
    recordId: Key;
    reloadTableData: (query?: QueryType<LeadsParamTypes>) => void;
    changeStatus?: boolean;
}

const statusColors: { [key: number]: string } = {
    1: '#00337C',
    2: "#144272",
    3: "#1F8A70",
    4: "#AD8E70",
    5: "#EB1D36",
    6: "#EB1D36",
}

/** Status Dropdown */
const StatusDropdown = (props: StatusDropdownProps) => {
    const {
        status, recordId, reloadTableData,
        changeStatus
    } = props

    const [messageApi, contextHolder] = message.useMessage();

    const module = useMemo(() => new LeadsModule(), []);

    const openMessage = (data: {
        key: string;
        type: "success" | "error" | "info" | "warning" | "loading";
        content: string
    }) => {
        messageApi.open({
            key: data.key,
            type: data.type,
            content: data.content,
            duration: data.type === "loading" ? 0 : 2,
        });
    };

    // controls the dropdown visibility
    const [visible, setVisible] = useState<boolean>(false);

    // handle dropdown menu visibility change event
    const onVisibleChange = (flag: boolean) => {
        setVisible(flag);
    };

    const onStatusChange = (_status: number) => {
        if (recordId && changeStatus === true) {
            openMessage({
                key: "update",
                type: "loading",
                content: "Updating..."
            });

            module.changeStatus(Number(recordId), _status).then((res) => {
                if (res?.data?.data) {
                    openMessage({
                        key: "update",
                        type: "success",
                        content: res?.data?.message
                    });
                    setVisible(!visible)

                    reloadTableData()
                }
            }).catch((err) => {
                openMessage({
                    key: "update",
                    type: "error",
                    content: err?.response?.data?.message
                });
            });
        } else {
            openMessage({
                key: "update",
                type: "error",
                content: "You don't have permission to change status"
            });
        }
    }

    const overlay = (
        <Card className={`${styles.overlay} pa-2`}>
            {contextHolder}
            {Object.entries([]).map(([key, value]) => {
                return (
                    <div
                        key={`leads-status-${key}`}
                        className={styles.overlay_item}
                        onClick={() => {
                            if (status !== Number(value)) {
                                const selectedStatus = Number(value)
                                onStatusChange(selectedStatus)
                            }
                        }}
                    >
                        <span className={(status === Number(value)) ? styles.disabledButton : ""}>
                            {key}
                        </span>
                    </div>
                )
            })}
        </Card>
    )

    return (
        <div>
            <Dropdown
                dropdownRender={() => overlay}
                trigger={changeStatus === true ? ["click"] : []}
                open={changeStatus === true ? visible : false}
                onOpenChange={onVisibleChange}
                className={styles.dropdown}
            >
                <div>
                    <Space
                        style={{
                            backgroundColor: statusColors[status],
                            color: "#fff",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.8rem",
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        {Object.entries([]).map(([key, value]) => {
                            return value === String(status) && key
                        })}

                        {changeStatus === true && <DownOutlined />}
                    </Space>
                </div>
            </Dropdown>
        </div>
    );
}

export default function TableComponent(props: TableProps & {
    tableData: LeadsTypes[];
    onAddNoteClick: (record: LeadsTypes) => void;
}) {
    const {
        tableData, tableLoading, emptyText, reloadTableData,
        onEditIconClick, onAddNoteClick
    } = props;
    const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
    const permissions = userPermissions as { [key in LeadsPermissionsEnum]: boolean };
    const { updateLeadsStatus, updateLeads } = permissions

    /**
     * Get the redirect url for whatsapp leads
     * @param record leads record
     */
    // const getWhatsappRedirectUrl = async (record: LeadsTypes) => {
    //     if (record.source === "whatsapp") {
    //         const uuid = record?.uuid
    //         const leadId = record?.id

    //         const ID = `${uuid}--${leadId}`

    //         const apiURL = `${BASE_URL}leads/get-redirect-link/${ID}`

    //         const res = await fetch(apiURL)

    //         const response = await res.json()

    //         const { data } = response

    //         if (data) {
    //             // open a new tab with the redirect url
    //             window.open(data?.redirectUrl, "_blank")
    //         }
    //     }
    // }

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: string, _record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'User',
            dataIndex: "user",
            key: "user",
            render: (_user: string, record: LeadsTypes) => (
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
                        )} */}

                        <Typography color="dark-sub" size="xs">
                            {`Added: ${convertDate(record?.addedDate, "dd M,yy-t")}`}
                        </Typography>

                        {record?.modifiedDate && (
                            <Typography color="dark-sub" size="xs">
                                {`Modified: ${convertDate(record?.modifiedDate, "dd M,yy-t")}`}
                            </Typography>
                        )}

                        {/* {record.source === "whatsapp" && (
                            <>
                                {record.hasReplied === true ? (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            width={18}
                                            height={18}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                stroke="#00875A"
                                                strokeLinejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p className="mb-0 ml-1 font-size-xs" style={{ color: "#37d67a" }}>
                                            Replied on WhatsApp
                                        </p>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            width={18}
                                            height={18}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                stroke="#FFB809"
                                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                            />
                                        </svg>
                                        <p className="mb-0 ml-1 font-size-xs" style={{ color: "#F59E0B" }}>
                                            Not Replied Yet
                                        </p>
                                    </div>
                                )}
                            </>
                        )} */}
                    </div>
                </div>
            ),
            width: "15%",
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
            render: (message: string, record: LeadsTypes) => (
                <>
                    <Typography
                        color="dark-main" size="sm"
                        className={styles.message}
                    >
                        {message}
                    </Typography>


                    {/* {record.source === "whatsapp" && (
                        <p
                            onClick={() => getWhatsappRedirectUrl(record)}
                            className="mt-1 mb-0 font-size-sm color-dark-sub cursor-pointer"
                            style={{ textDecoration: "underline" }}
                        >
                            Reply on WhatsApp
                        </p>
                    )} */}
                </>
            ),
            width: "200px",
        },
        // {
        //     title: 'Property',
        //     dataIndex: "property",
        //     key: "property",
        //     render: (property: LeadsTypes['property'], record: LeadsTypes) => (
        //         <>
        //             {property?.id && (
        //                 <Typography color="dark-main" size="sm">
        //                     {`ID: ${property?.id}`}
        //                 </Typography>
        //             )}

        //             {property?.localization && (
        //                 <Paragraph
        //                     title={property.localization[0]?.title}
        //                     ellipsis={{
        //                         rows: 1,
        //                         expandable: false,
        //                     }}
        //                     copyable={{ text: property.localization[0]?.title }}
        //                     className="font-size-xs color-dark-sub mb-0 mt-1"
        //                 >
        //                     Name: {property.localization[0]?.title}
        //                 </Paragraph>
        //             )}

        //             {property?.category?.slug && (
        //                 <Typography color="dark-sub" size="xs">
        //                     ""
        //                     {/* {`Category: ${PropertyCategories[property.category.slug]}`} */}
        //                 </Typography>
        //             )}

        //             {/** View Property On Main Website (Users Website) */}
        //             {property?.slug && (
        //                 <div className="d-flex">
        //                     <Typography color="dark-main" size="sm" weight="bold">
        //                         View Property:
        //                     </Typography>
        //                     <a
        //                         href={`${FRONT_END_URL}/en/property/${property.slug}`}
        //                         target="_blank"
        //                         rel="noreferrer"
        //                         title={property.localization[0]?.title}
        //                     >
        //                         <svg
        //                             xmlns="http://www.w3.org/2000/svg"
        //                             fill="none"
        //                             viewBox="0 0 24 24"
        //                             strokeWidth={1.5}
        //                             stroke="currentColor"
        //                             height={"16px"}
        //                             width={"17px"}
        //                         >
        //                             <path
        //                                 strokeLinecap="round"
        //                                 strokeLinejoin="round"
        //                                 d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        //                             />
        //                         </svg>
        //                     </a>
        //                 </div>
        //             )}

        //             {record.reference && (
        //                 <Typography color="dark-sub" size="xs">
        //                     {`Reference: ${record.reference}`}
        //                 </Typography>
        //             )}
        //         </>
        //     ),
        //     width: "15%",
        // },
        // {
        //     title: 'Organization/Agent',
        //     dataIndex: "organization",
        //     key: "organization",
        //     render: (organization: LeadsTypes['organization'], record: LeadsTypes) => (
        //         <>
        //             {organization && (
        //                 <>
        //                     <Paragraph
        //                         title={organization?.name}
        //                         ellipsis={{
        //                             rows: 1,
        //                             expandable: false,
        //                         }}
        //                         copyable={{ text: organization?.name }}
        //                         className="font-size-sm color-dark-main mb-0 mt-1"
        //                     >
        //                         Org Name: {organization?.name}
        //                     </Paragraph>

        //                     <Typography color="dark-sub" size="xs">
        //                         {`Org ID: ${organization?.id}`}
        //                     </Typography>
        //                 </>
        //             )}

        //             {record.assignedTo && (
        //                 <>
        //                     <Typography color="dark-sub" size="xs">
        //                         {`Agent ID: ${record.assignedTo?.id}`}
        //                     </Typography>

        //                     <Typography color="dark-sub" size="xs">
        //                         {`Agent Name: ${record.assignedTo?.firstName} ${record.assignedTo?.lastName}`}
        //                     </Typography>
        //                 </>
        //             )}
        //         </>
        //     ),
        //     width: "12%",
        // },
    ];

    if (updateLeadsStatus === true) {
        columns.push({
            title: 'Status',
            dataIndex: "status",
            key: "status",
            render: (status: string, record: LeadsTypes) => (
                <StatusDropdown
                    recordId={record.id}
                    status={Number(status)}
                    reloadTableData={reloadTableData}
                    changeStatus={updateLeadsStatus}
                />
            ),
            width: "10%",
        })
    }

    if (updateLeads === true) {
        columns.push({
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (_text: string, record: LeadsTypes) => (
                <ActionComponent
                    record={record}
                    onEditIconClick={onEditIconClick}
                    reloadTableData={reloadTableData}
                    onAddNoteClick={onAddNoteClick}
                    permissions={permissions}
                />
            ),
            width: "8%",
        })
    }

    return (
        <div>
            <Table
                sticky
                dataSource={tableData}
                columns={columns}
                pagination={false}
                scroll={{ x: 991 }}
                loading={tableLoading}
                rowKey={(record: LeadsTypes) => `leads-${record.id}`}
                locale={{ emptyText: emptyText }}
            />
        </div>
    );
}