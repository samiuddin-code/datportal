import { Table, Input } from "antd";
import { convertDate } from "../../../../helpers/dateHandler";
import { MailLogsTypes } from "../../../../Modules/Default/mail-types";
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
            title: 'Subject',
            dataIndex: "subject",
            key: "subject",
            render: (subject: string) => (
                <Typography color="dark-main" size="sm">
                    {subject}
                </Typography>
            ),
        },
        {
            title: 'Email',
            dataIndex: "email",
            key: "email",
            render: (email: string) => (
                <Typography color="dark-main" size="sm">
                    {email}
                </Typography>
            ),
        },
        {
            title: 'Calle Function',
            dataIndex: "calleFunction",
            key: "calleFunction",
            render: (calleFunction: string) => (
                <Typography color="dark-main" size="sm" >
                    {calleFunction}
                </Typography>
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
            title: 'Template',
            dataIndex: "template",
            key: "template",
            render: (template: string) => (
                <Typography color="dark-main" size="sm" >
                    {template}
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