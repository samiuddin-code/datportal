import { Table, List, Divider, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { convertDate } from "../../../../helpers/dateHandler";
import { SavedSearchesListingTypes } from "../../../../Modules/SaveSearches/types";
import { Typography } from "../../../Atoms";
import { tableProps } from "./settings";
import styles from "../../Common/styles.module.scss";
import { useMemo, useState } from "react";
import { SaveSearchesModule } from "../../../../Modules/SaveSearches";

const ActionComponent = (props: { record: SavedSearchesListingTypes } & {
    reloadTableData: () => void;
}) => {
    const { record, reloadTableData } = props;

    const [actionState, setActionState] = useState({
        confirmLoading: false,
        openPopConfirm: false,
    });
    const module = useMemo(() => new SaveSearchesModule(), []);

    const handleDelete = () => {
        setActionState({
            ...actionState,
            confirmLoading: true,
        });

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

export default function TableComponent(props: tableProps & { reloadTableData: () => void }) {
    const { tableData, tableLoading, reloadTableData } = props;

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (text: string, record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'Title',
            dataIndex: "title",
            key: "title",
            render: (title: string, record: SavedSearchesListingTypes) => (
                <Typography color="dark-main" size="sm" weight="bold">
                    {title}
                </Typography>
            ),
        },

        {
            title: 'Filters',
            dataIndex: "filters",
            key: "filters",
            render: (filters: string, record: SavedSearchesListingTypes) => (
                <div>
                    {Object.keys(record.filters).map((key: any, index) => {
                        return (
                            <div key={index}>
                                {/** 
                                 * TODO: add enums containing filter names to avoid
                                 *  using camelCase names from database
                                */}
                                <List>
                                    <List.Item>
                                        <Typography color="dark-main" size="sm" weight="bold">
                                            {key}
                                        </Typography>
                                        <Typography color="dark-main" size="sm" weight="bold" className="ml-10">
                                            {filters[key]}
                                        </Typography>
                                    </List.Item>
                                </List>
                                <Divider className="my-0" />
                            </div>
                        )
                    })}
                </div>
            ),
        },
        {
            title: 'Date Added',
            className: 'text-center',
            dataIndex: "addedDate",
            key: "addedDate",
            render: (addedDate: string, record: SavedSearchesListingTypes) => (
                <Typography color="dark-main" size="sm" weight="bold">
                    {convertDate(addedDate, "dd-mm-yy")}
                </Typography>
            ),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (text: string, record: SavedSearchesListingTypes) => (
                <ActionComponent
                    record={record}
                    reloadTableData={reloadTableData}
                />
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
                rowKey={(record: SavedSearchesListingTypes) => `saved-searches-view-${record.id}`}
            />
        </div>
    );
}