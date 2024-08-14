import { Table } from "antd";
import { CreditsTransactionType } from "../../../../../helpers/commonEnums";
import { FRONT_END_URL, RESOURCE_BASE_URL } from "../../../../../helpers/constants";
import { convertDate } from "../../../../../helpers/dateHandler";
// import { any } from "../../../../../Modules/Organization/types";
import { PropertyType } from "../../../../../Modules/PropertyType/types";
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
            title: 'Property',
            dataIndex: "property",
            key: "property",
            render: (property: PropertyType, record: any) => (
                <div>
                    <a
                        href={`${FRONT_END_URL}/en/property/${property.slug}`}
                        target={'_blank'}
                        rel="noreferrer"
                        title={property.localization[0].title}
                        className="color-dark-main font-size-sm d-flex justify-center"
                    >
                        {property.localization[0].title}
                    </a>
                </div>
            )

        },
        {
            title: 'Credits Spent',
            dataIndex: "creditsSpent",
            key: "creditsSpent",
            className: 'text-center',
            render: (creditsSpent: number, record: any) => (
                <div className="color-dark-main font-size-sm d-flex justify-center">
                    <div className={`
                        ${CreditsTransactionType[record.transactionType] === "debit" ? "color-red-yp" : ""}
                       ${CreditsTransactionType[record.transactionType] === "credit" ? "color-green-yp" : ""}
                    `}>
                        {CreditsTransactionType[record.transactionType] === "debit" && "-"}
                        {CreditsTransactionType[record.transactionType] === "credit" && "+"}
                        &nbsp;
                        {`${creditsSpent}`}
                    </div>
                </div>
            ),
        },
        {
            title: 'Eligible Refund',
            dataIndex: "refundCredits",
            key: "refundCredits",
            className: 'text-center',
            render: (refundCredits: number, record: any) => (
                <div className="color-dark-main font-size-sm d-flex justify-center">
                    <div className={`
                        ${CreditsTransactionType[record.transactionType] === "debit" ? "color-red-yp" : ""}
                       ${CreditsTransactionType[record.transactionType] === "credit" ? "color-green-yp" : ""}
                    `}>
                        {CreditsTransactionType[record.transactionType] === "debit" && "-"}
                        {CreditsTransactionType[record.transactionType] === "credit" && "+"}
                        &nbsp;
                        {`${refundCredits || 0}`}
                    </div>
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
            title: 'Cancelled Date',
            dataIndex: "canceledAt",
            key: "canceledAt",
            render: (canceledAt: string, record: any) => (
                <Typography color="dark-main" size="sm">
                    {convertDate(canceledAt, "dd M,yy-t")}
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