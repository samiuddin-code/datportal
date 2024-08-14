import { Table } from "antd";
import { TokenTypes } from "../../../../helpers/commonEnums";
import { convertDate } from "../../../../helpers/dateHandler";
import { ActiveUserTypes } from "../../../../Modules/User/types";
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
            render: (user: ActiveUserTypes['user']) => (
                <>
                    {user?.firstName && (
                        <Typography color="dark-main" size="sm" >
                            {`Name: ${user.firstName} ${user.lastName}`}
                        </Typography>
                    )}

                    {user?.Organization && (
                        <Typography color="dark-sub" size="sm" >
                            {`ORG: ${user.Organization.name}`}
                        </Typography>
                    )}
                </>
            ),
        },
        {
            title: 'User Agent',
            dataIndex: "userAgent",
            key: "userAgent",
            render: (userAgent: string) => (
                <Typography color="dark-main" size="sm" >
                    {userAgent}
                </Typography>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: "userIP",
            key: "userIP",
            render: (userIP: string) => (
                <Typography color="dark-main" size="sm" >
                    {userIP}
                </Typography>
            ),
        },
        {
            title: 'Token Type',
            dataIndex: "tokenType",
            key: "tokenType",
            render: (tokenType: keyof typeof TokenTypes) => (
                <Typography color="dark-main" size="sm" >
                    {TokenTypes[tokenType]}
                </Typography>
            ),
        },
        {
            title: 'Added Date',
            dataIndex: "addedDate",
            key: "addedDate",
            render: (addedDate: string) => (
                <>
                    {addedDate ? (
                        <Typography color="dark-main" size="sm" >
                            {convertDate(addedDate, "dd M,yy-t")}
                        </Typography>
                    ) : null}
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
            />
        </div>
    );
}