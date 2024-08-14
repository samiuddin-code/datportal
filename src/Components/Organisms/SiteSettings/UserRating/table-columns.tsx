import { useMemo, useState } from "react";
import { Card, Dropdown, message, Popconfirm, Rate, Space, Table, Typography as AntdTypography } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
// import { UserRatingHelpType, UserRatingStatusString } from "../../../../helpers/commonEnums";
import { convertDate } from "../../../../helpers/dateHandler";
import { UserRatingTypes } from "../../../../Modules/UserRating/types";
import { UserRatingModule } from "../../../../Modules/UserRating";
import { Typography } from "../../../Atoms";
import styles from "./styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { CalenderIcon } from "../../../Icons";
import { capitalize } from "../../../../helpers/common";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { UserRatingPermissionsEnum } from "../../../../Modules/UserRating/permissions";

const { Paragraph } = AntdTypography;


interface _ActionComponentProps extends ActionComponentProps {
    record: UserRatingTypes;
    permissions: { [key in UserRatingPermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
    const { record, reloadTableData, permissions: { deleteUserRating } } = props;

    const [actionState, setActionState] = useState({
        confirmLoading: false,
        openPopConfirm: false,
    });
    const module = useMemo(() => new UserRatingModule(), []);

    const handleDelete = () => {
        setActionState({
            ...actionState,
            confirmLoading: true,
        });

        if (deleteUserRating === false) {
            message.error("You don't have permission to delete this record, please contact your administrator.");
            setActionState({
                ...actionState,
                openPopConfirm: false,
                confirmLoading: false,
            });
            return;
        }

        module.deleteRecord(record.id).then((res) => {
            setActionState({
                ...actionState,
                openPopConfirm: false,
                confirmLoading: false,
            });
            reloadTableData();
        }).catch((err) => {
            setActionState({
                ...actionState,
                confirmLoading: false,
            });
        });
    };

    const showPopconfirm = () => {
        setActionState({
            ...actionState,
            openPopConfirm: true,
        });
    };

    return (
        <div className={styles.actions}>
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

type StatusComponentProps = {
    record: UserRatingTypes;
    status: number;
    reloadTableData: (query?: any) => void;
    permissions: { [key in UserRatingPermissionsEnum]: boolean };
};

const StatusComponent = (props: StatusComponentProps) => {
    const { record, status, reloadTableData, permissions: { updateUserRating } } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const module = useMemo(() => new UserRatingModule(), []);

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

    const onStatusChange = (status: number) => {
        if (record?.id && updateUserRating === true) {
            openMessage({
                key: "update",
                type: "loading",
                content: "Updating..."
            });

            module.updateRecord({ status: status }, record?.id).then((res) => {
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
                        key={`user-status-${key}`}
                        className={styles.overlay_item}
                        onClick={() => {
                            if (status !== Number(value) && updateUserRating === true) {
                                const selectedStatus = Number(value)
                                onStatusChange(selectedStatus)
                            }
                        }}
                    >
                        <span className={(status === Number(value)) ? styles.disabledButton : ""}>
                            {capitalize(key)}
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
                trigger={updateUserRating === true ? ["click"] : []}
                open={updateUserRating === true ? visible : false}
                onOpenChange={onVisibleChange}
                className={styles.dropdown}
            >
                <div>
                    <Space
                        style={{
                            backgroundColor: "#f2f2f2",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.8rem",
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* {Object.entries(UserRatingStatusString).map(([key, value]) => {
                            return value === String(status) && capitalize(key)
                        })} */}

                        {updateUserRating === true && <DownOutlined />}
                    </Space>
                </div>
            </Dropdown >
        </div>
    );
}

export default function TableComponent(props: TableProps & { tableData: UserRatingTypes[] }) {
    const { tableData, tableLoading, emptyText, reloadTableData, onEditIconClick } = props;
    const { userPermissions } = useSelector((state: RootState) => state.usersReducer);

    const permissions = userPermissions as {
        [key in UserRatingPermissionsEnum]: boolean;
    };

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: string, _record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'Rated By',
            dataIndex: "ratedBy",
            key: "ratedBy",
            render: (_ratedBy: string, record: UserRatingTypes) => (
                <div className="d-flex">
                    <div className="my-auto">
                        <Typography color="dark-main" size="sm">
                            {`${record.name}`}
                        </Typography>

                        {record?.email && (
                            <Paragraph
                                title={record.email}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: record.email }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                {record.email}
                            </Paragraph>
                        )}

                        {record?.phone && (
                            <Paragraph
                                title={`+${record.phoneCode}${record.phone}`}
                                ellipsis={{
                                    rows: 1,
                                    expandable: false,
                                }}
                                copyable={{ text: `+${record.phoneCode}${record.phone}` }}
                                className="font-size-xs color-dark-sub mb-0 mt-1"
                            >
                                {`+${record.phoneCode}${record.phone}`}
                            </Paragraph>
                        )}

                        <div className="d-flex mt-1">
                            <CalenderIcon className="mr-2" />
                            <Typography color="dark-sub" size="sm">
                                {`${convertDate(record.addedDate, "dd MM yy")}`}
                            </Typography>
                        </div>
                    </div>
                </div>
            ),
            width: "13%",
        },
        {
            title: 'Rated To',
            dataIndex: "user",
            key: "user",
            render: (user: UserRatingTypes['user']) => (
                <div className="d-flex">
                    <div className="my-auto">
                        <Typography color="dark-main" size="sm">
                            {`Agent: ${user.firstName} ${user.lastName}`}
                        </Typography>

                        <Typography color="dark-sub" size="sm">
                            {`Org: ${user.Organization.name}`}
                        </Typography>
                        <Typography color="dark-sub" size="sm">
                            {`UserID: ${user.id}`}
                        </Typography>
                    </div>
                </div>
            ),
            width: "15%",
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
            width: "15%",
        },
        {
            title: 'Rating',
            dataIndex: "rating",
            key: "rating",
            render: (rating: number) => (
                <Rate
                    defaultValue={rating}
                    allowHalf
                    disabled
                    style={{ fontSize: "16px" }}
                />
            ),
        },
        {
            title: 'Property Link',
            dataIndex: "propertyLink",
            key: "propertyLink",
            className: "text-center",
            render: (propertyLink: string) => (
                <>
                    {/** View Property On Main Website (Users Website) */}
                    < a
                        href={propertyLink}
                        target="_blank"
                        rel="noreferrer"
                        title={"View Property On Main Website (Users Website)"}
                    >
                        View
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            height={"16px"}
                            width={"17px"}
                            className="ml-1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                        </svg>
                    </a >
                </>
            ),
        },
        {
            title: 'Reference Number',
            dataIndex: "referenceNumber",
            key: "referenceNumber",
            className: 'text-center',
            render: (referenceNumber: string) => (
                <Typography color="dark-main" size="sm">
                    {referenceNumber}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: "status",
            key: "status",
            className: 'text-center',
            render: (status: number, record: UserRatingTypes) => (
                <StatusComponent
                    status={status}
                    record={record}
                    reloadTableData={reloadTableData}
                    permissions={permissions}
                />
            ),
        },
        // {
        //     title: 'Help Type',
        //     dataIndex: "helpType",
        //     key: "helpType",
        //     className: 'text-center',
        //     render: (helpType: number) => (
        //         <Typography color="dark-main" size="sm">
        //             {UserRatingHelpType[helpType]}
        //         </Typography>
        //     ),
        // },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (text: string, record: UserRatingTypes) => (
                <ActionComponent
                    record={record}
                    onEditIconClick={onEditIconClick}
                    reloadTableData={reloadTableData}
                    permissions={permissions}
                />
            ),
        }
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
                rowKey={(record: UserRatingTypes) => `user-rating-${record.id}`}
                locale={{ emptyText: emptyText }}
            />
        </div>
    );
}