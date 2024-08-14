import { Rate, Table, } from "antd";
// import { UserRatingHelpType, UserRatingStatus } from "../../../../helpers/commonEnums";
import { convertDate } from "../../../../helpers/dateHandler";
import { UserRatingTypes } from "../../../../Modules/UserRating/types";
import { Typography } from "../../../Atoms";
import { TableProps } from "../../Common/common-types";
import { CalenderIcon } from "../../../Icons";

export default function TableComponent(props: TableProps & { tableData: UserRatingTypes[] }) {
    const { tableData, tableLoading, emptyText } = props;

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
        // {
        //     title: 'Status',
        //     dataIndex: "status",
        //     key: "status",
        //     className: 'text-center',
        //     render: (status: number) => (
        //         <Typography color="dark-main" size="sm">
        //             {UserRatingStatus[status]}
        //         </Typography>
        //     ),
        // },
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