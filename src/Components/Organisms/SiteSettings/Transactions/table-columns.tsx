import { Table, Typography as AntdTypography, Tag, Empty } from "antd";
// import { RecordType, TransactionStatus } from "../../../../helpers/commonEnums";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { convertDate } from "../../../../helpers/dateHandler";
// import { TransactionsListingTypes } from "../../../../Modules/Transactions/types";
import { Typography } from "../../../Atoms";
import { tableProps } from "./settings";
import { formatCurrency } from "@helpers/common";
const { Paragraph } = AntdTypography;

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
            title: "Organization",
            dataIndex: "organization",
            key: "organization",
            render: (organization: any) => (
                <div>
                    <div className="d-flex">
                        <img
                            src={`${RESOURCE_BASE_URL}${organization?.logo}`}
                            alt="organization"
                            style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "100%",
                                objectFit: "cover",
                            }}
                        />

                        <div className="ml-2 my-auto">
                            <Typography color="dark-sub" size="xs">
                                {`${organization?.name}`}
                            </Typography>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record: any) => (
                <Typography color="dark-main" size="sm">
                    {`${record.currencyCode ? record.currencyCode : 'AED'} ${formatCurrency(amount)}`}
                </Typography>
            ),
        },
        // {
        //     title: 'Status',
        //     dataIndex: "status",
        //     key: "status",
        //     render: (status: number, record: TransactionsListingTypes) => (
        //         <div>
        //             {TransactionStatus[status] === "initiated" && (
        //                 <Tag color="#fadb14">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "expired" && (
        //                 <Tag color="#f5222d">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "canceled" && (
        //                 <Tag color="#f5222d">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "rejected" && (
        //                 <Tag color="#f5222d">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "declined" && (
        //                 <Tag color="#f5222d">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "unknown" && (
        //                 <Tag color="#f5222d">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}

        //             {TransactionStatus[status] === "completed" && (
        //                 <Tag color="#52c41a">
        //                     {TransactionStatus[status]}
        //                 </Tag>
        //             )}
        //         </div>
        //     ),
        // },
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
            title: 'Message',
            dataIndex: "transactionMessage",
            key: "transactionMessage",
            render: (transactionMessage: string, record: any) => (
                <Typography color="dark-main" size="sm">
                    {transactionMessage}
                </Typography>
            ),
        },
        {
            title: 'Cart ID',
            dataIndex: "cartId",
            key: "cartId",
            render: (cartId: string, record: any) => (
                <Typography color="dark-main" size="sm">
                    {cartId}
                </Typography>
            ),
        },
        {
            title: 'Reference',
            dataIndex: "transactionReference",
            key: "transactionReference",
            className: 'text-center',
            render: (transactionReference: string, record: any) => (
                <div>
                    <Paragraph
                        title={transactionReference}
                        ellipsis={{
                            rows: 1,
                            expandable: false,
                        }}
                        copyable={{ text: transactionReference }}
                        className="font-size-sm color-dark-sub"
                    >
                        {transactionReference}
                    </Paragraph>
                </div>
            ),
        },
        // {
        //     title: 'Type',
        //     dataIndex: "recordType",
        //     key: "recordType",
        //     className: 'text-center',
        //     render: (recordType: number, record: any) => (
        //         <Typography color="dark-main" size="sm">
        //             {RecordType[recordType]}
        //         </Typography>
        //     ),
        // },
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
                rowKey={(record: any) => `payment-view-${record.id}`}
                locale={{
                    emptyText: (
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            imageStyle={{
                                height: 150,
                            }}
                            description={
                                <span>
                                    No transactions found
                                </span>
                            }
                        />
                    ),
                }}
            />
        </div>
    );
}