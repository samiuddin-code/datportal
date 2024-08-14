import { Table, Input } from "antd";
import { convertDate } from "../../../../helpers/dateHandler";
import { MailLogsTypes } from "../../../../Modules/Default/mail-types";
import { SystemLogsTypes } from "../../../../Modules/Default/system-logs-types";
import { Typography } from "../../../Atoms";
import { tableProps } from "./settings";

const { TextArea } = Input;

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
            title: 'Table',
            dataIndex: "table",
            key: "table",
            render: (table: string, record: SystemLogsTypes) => (
                <>
                    <Typography color="dark-main" size="sm">
                        {`Name: ${table}`}
                    </Typography>

                    <Typography color="dark-main" size="sm">
                        {`Column Key: ${record.tableColumnKey}`}
                    </Typography>

                    <Typography color="dark-main" size="sm">
                        {`Column Value: ${record.tableColumnValue}`}
                    </Typography>
                </>
            ),
        },
        {
            title: 'User Meta',
            dataIndex: "addedById",
            key: "addedById",
            render: (addedById: number, record: SystemLogsTypes) => (
                <>
                    <Typography color="dark-main" size="sm">
                        {`User ID: ${addedById}`}
                    </Typography>

                    <Typography color="dark-main" size="sm">
                        {`Organization ID: ${record.organizationId || "N/A"}`}
                    </Typography>

                    <Typography color="dark-main" size="sm">
                        {`Country ID: ${record.countryId || "N/A"}`}
                    </Typography>
                </>
            ),
        },
        {
            title: 'Controller Name',
            dataIndex: "controllerName",
            key: "controllerName",
            render: (controllerName: string) => (
                <Typography color="dark-main" size="sm" >
                    {controllerName}
                </Typography>
            ),
        },
        {
            title: 'Action',
            dataIndex: "actionType",
            key: "actionType",
            render: (actionType: string, record: SystemLogsTypes) => (
                <>
                    <Typography color="dark-main" size="sm" >
                        {`Type: ${actionType}`}
                    </Typography>

                    <Typography color="dark-main" size="sm" >
                        {`Message: ${record.message}`}
                    </Typography>

                    <Typography color="dark-main" size="sm" >
                        {`Endpoint: ${record.endPoint}`}
                    </Typography>
                </>
            ),
        },
        {
            title: 'Date Added',
            className: 'text-center',
            dataIndex: "addedDate",
            key: "addedDate",
            render: (addedDate: string) => (
                <Typography color="dark-main" size="sm" >
                    {convertDate(addedDate, "dd M,yy-t")}
                </Typography>
            ),
        },
        {
            title: 'Data',
            dataIndex: "data",
            key: "data",
            render: (data: MailLogsTypes['data']) => (
                <TextArea
                    rows={4}
                    value={JSON.stringify(data, null, 2)}
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
            />
        </div>
    );
}