import { Table, Tag } from "antd";
import { CreditsTransactionType } from "../../../../../helpers/commonEnums";
import { RESOURCE_BASE_URL } from "../../../../../helpers/constants";
import { convertDate } from "../../../../../helpers/dateHandler";
import { Typography } from "../../../../Atoms";
import { tableProps } from "./settings";

export default function TableComponent(props: tableProps) {
    const { tableData, tableLoading, emptyText } = props;

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (text: string, record: {}, index: number) => index + 1,
            width: "60px",
        },
        {
            title: 'Agent',
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record: any) => (
                <div className="d-flex">
                    <img
                        src={`${RESOURCE_BASE_URL}${record.user?.profile}`}
                        alt="profile"
                        style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "100%",
                            objectFit: "cover",
                        }}
                    />

                    <div className="ml-2 my-auto">
                        <Typography color="dark-sub" size="xs">
                            {`${record.user?.firstName} ${record.user?.lastName}`}
                        </Typography>
                    </div>
                </div>
            ),
        },
        {
            title: 'Credits',
            dataIndex: "creditsUsed",
            key: "creditsUsed",
            className: 'text-center',
            render: (creditsUsed: number, record: any) => (
                <div className="color-dark-main font-size-sm d-flex justify-center">
                    <div className={`
                        ${CreditsTransactionType[record.transactionType] === "debit" ? "color-red-yp" : ""}
                       ${CreditsTransactionType[record.transactionType] === "credit" ? "color-green-yp" : ""}
                    `}>
                        {CreditsTransactionType[record.transactionType] === "debit" && "-"}
                        {CreditsTransactionType[record.transactionType] === "credit" && "+"}
                        &nbsp;
                        {`${creditsUsed}`}
                    </div>
                </div>
            ),
        },
        {
            title: 'Credits Balance',
            dataIndex: "currentBalance",
            key: "currentBalance",
            className: 'text-center',
            render: (currentBalance: number, record: any) => (
                <Typography color="dark-main" size="sm">
                    {`${currentBalance}`}
                </Typography>
            ),
        },
        {
            title: 'Transaction Type',
            dataIndex: "transactionType",
            key: "transactionType",
            className: 'text-center',
            render: (transactionType: number, record: any) => (
                <div>
                    {CreditsTransactionType[transactionType] === "debit" && (
                        <Tag color="#f5222d">
                            {CreditsTransactionType[transactionType]}
                        </Tag>
                    )}

                    {CreditsTransactionType[transactionType] === "hold" && (
                        <Tag color="#fadb14">
                            {CreditsTransactionType[transactionType]}
                        </Tag>
                    )}

                    {CreditsTransactionType[transactionType] === "upgrade" && (
                        <Tag color="#497174">
                            {CreditsTransactionType[transactionType]}
                        </Tag>
                    )}

                    {CreditsTransactionType[transactionType] === "refund" && (
                        <Tag color="#f5222d">
                            {CreditsTransactionType[transactionType]}
                        </Tag>
                    )}

                    {CreditsTransactionType[transactionType] === "credit" && (
                        <Tag color="#52c41a">
                            {CreditsTransactionType[transactionType]}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Transaction Date',
            dataIndex: "transactionDate",
            key: "transactionDate",
            render: (transactionDate: string, record: any) => (
                <Typography color="dark-main" size="sm">
                    {convertDate(transactionDate, "dd M,yy-t")}
                </Typography>
            ),
        },
        {
            title: 'Description',
            dataIndex: "transactionMessage",
            key: "transactionMessage",
            render: (transactionMessage: string, record: any) => (
                <Typography color="dark-main" size="sm">
                    {transactionMessage}
                </Typography>
            ),
        },
        {
            title: 'Reference ID',
            dataIndex: "referenceId",
            key: "referenceId",
            className: 'text-center',
            render: (referenceId: number, record: any) => (
                <Typography color="dark-main" size="sm">
                    {`${referenceId === null ? "" : referenceId}`}
                </Typography>
            ),
        },
        {
            title: 'Refunded',
            dataIndex: "refunded",
            key: "refunded",
            className: 'text-center',
            render: (refunded: boolean, record: any) => (
                <Typography color="dark-main" size="sm">
                    {`${refunded === true ? "Yes" : "No"}`}
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
                rowKey={(record: any) => `saved-searches-view-${record.id}`}
                locale={{ emptyText: emptyText }}
            />
        </div>
    );
}