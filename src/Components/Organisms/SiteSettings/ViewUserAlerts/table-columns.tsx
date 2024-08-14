import { Table, List, Divider, Avatar } from "antd";
import { capitalize } from "../../../../helpers/common";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { convertDate } from "../../../../helpers/dateHandler";
import { UserAlertsTypes } from "../../../../Modules/UserAlerts/types";
import { Typography } from "../../../Atoms";
import { tableProps } from "./settings";

export default function TableComponent(props: tableProps) {
    const { tableData, tableLoading } = props;

    const columns = [
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
            render: (user: UserAlertsTypes['user']) => (
                <div
                    className="d-flex"
                >
                    <Avatar
                        src={user?.profile
                            ? `${RESOURCE_BASE_URL}${user?.profile}`
                            : "/images/user.svg"
                        }
                        size="small"
                        className="my-auto"
                    />
                    <div>
                        <Typography
                            color="dark-sub"
                            size="sm"
                            className="my-auto ml-1"
                        >
                            {`${user?.firstName} ${user?.lastName}`}
                        </Typography>
                        <Typography
                            color="dark-sub"
                            size="sm"
                            className="my-auto ml-1"
                        >
                            {`ID: ${user?.id}`}
                        </Typography>
                    </div>
                </div>
            ),
        },
        {
            title: 'Country',
            dataIndex: "country",
            key: "country",
            render: (country: UserAlertsTypes['country']) => (
                <Typography color="dark-main" size="sm" >
                    {`${country?.name}`}
                </Typography>
            ),
        },
        {
            title: 'Filters',
            dataIndex: "filters",
            key: "filters",
            render: (filters: string, record: UserAlertsTypes) => (
                <div>
                    {Object.keys(record?.filters).map((key: any, index) => {
                        return (
                            <div key={`filter-${index}`}>
                                <List>
                                    <List.Item>
                                        {filters[key]?.length > 0 || typeof filters[key] === 'number' ? (
                                            <Typography color="dark-main" size="sm" >
                                                {capitalize(key)}
                                            </Typography>
                                        ) : null}

                                        {!filters[key] ? null : (
                                            <div className="color-dark-main font-size-sm ml-10 mb-0">
                                                {Array.isArray(filters[key]) && filters[key].length > 0 ? (
                                                    <List
                                                        dataSource={filters[key] as any}
                                                        renderItem={(item: any) => (
                                                            <List.Item>
                                                                <Typography color="dark-main" size="sm">
                                                                    {item}
                                                                </Typography>
                                                            </List.Item>
                                                        )}
                                                        locale={{
                                                            emptyText: `No ${key} selected`
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography color="dark-main" size="sm">
                                                        {filters[key]}
                                                    </Typography>
                                                )}
                                            </div>
                                        )}
                                    </List.Item>
                                    {filters[key]?.length > 0 && index !== Object.keys(filters).length - 1 ? <Divider className="my-0" /> : null}
                                </List>
                            </div>
                        )
                    })}
                </div>
            ),
            width: "30%",
        },
        {
            title: 'Date Added',
            className: 'text-center',
            dataIndex: "addedDate",
            key: "addedDate",
            render: (addedDate: string, record: UserAlertsTypes) => (
                <Typography color="dark-main" size="sm" >
                    {convertDate(addedDate, "dd-mm-yy")}
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
                rowKey={(record) => `user-alerts-view-${record.id}`}
            />
        </div>
    );
}