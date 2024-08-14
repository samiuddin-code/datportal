import { Table } from "antd";
import { capitalize } from "../../../../helpers/common";
import { convertDate } from "../../../../helpers/dateHandler";
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
            title: 'Gateway',
            dataIndex: "gateway",
            key: "gateway",
            render: (gateway: string) => (
                <Typography color="dark-main" size="sm" >
                    {gateway}
                </Typography>
            ),
        },
        {
            title: 'Message',
            dataIndex: "message",
            key: "message",
            render: (message: string) => (
                <Typography color="dark-main" size="sm" >
                    {message}
                </Typography>
            ),
        },
        {
            title: 'Mobile Number',
            dataIndex: "number",
            key: "number",
            render: (number: string) => (
                <Typography color="dark-main" size="sm" >
                    {number}
                </Typography>
            ),
        },
        {
            title: 'Sent Date',
            className: 'text-center',
            dataIndex: "sentDate",
            key: "sentDate",
            render: (sentDate: string) => (
                <Typography color="dark-main" size="sm" >
                    {convertDate(sentDate, "dd M,yy-t")}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Typography color="dark-main" size="sm" >
                    {`${capitalize(status)}`}
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
            // rowKey={(record) => `sms-logs-${record.id!}`}
            />
        </div>
    );
}