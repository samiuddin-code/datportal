import { FC, useMemo, useState } from "react";
import { Table, message, Typography as AntdTypography } from "antd";
import Typography from "@atoms/Headings";
import { TableProps } from "@organisms/Common/common-types";
import { TransactionsPermissionsEnum } from "@modules/Transactions/permissions";
import { TransactionsType } from "@modules/Transactions/types";
import ActionComponent from "./actions";
import { ExternalIcon } from "@icons/external";
import { ColumnsType } from "antd/lib/table";
import { convertDate } from "@helpers/dateHandler";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import UserDropDown from "./assign-to";
import StatusDropdown from "./status";
import { APPLICATION_RESOURCE_BASE_URL } from "@helpers/constants";
import { DepartmentModule } from "@modules/Department";
import { useFetchData } from "hooks";
import { DepartmentType } from "@modules/Department/types";
import { formatCurrency } from "@helpers/common";

const { Paragraph } = AntdTypography;

interface TransactionsTableProps extends TableProps<TransactionsType> {
  permissions: { [key in TransactionsPermissionsEnum]: boolean };
}

type SearchedUserType = {
  data: UserTypes[];
  loading: boolean;
}

const TransactionsTable: FC<TransactionsTableProps> = (props) => {
  const {
    tableData, tableLoading, onEditIconClick, reloadTableData, permissions
  } = props;

  const userModule = useMemo(() => new UserModule(), [])
  const departmentModule = useMemo(() => new DepartmentModule(), [])

  // Get the finance department data to get the department id
  const { data } = useFetchData<DepartmentType[]>({
    method: departmentModule.getAllRecords,
    initialQuery: { slug: "finance" }
  })
  const [users, setUsers] = useState<SearchedUserType>({ data: [], loading: false });

  const getUsers = (query: { name: string }) => {
    setUsers((prev) => ({ ...prev, loading: true }));

    const finalQuery = { ...query, departmentId: data?.[0]?.id! }

    if (!finalQuery.departmentId) {
      message.error("Cannot find any user in the finance department, please try again later");
      setUsers((prev) => ({ ...prev, loading: false }));
      return;
    }

    userModule.getAllRecords(finalQuery).then((res) => {
      const data = res?.data?.data;
      setUsers({ data: data, loading: false });
    }).catch((err) => {
      message.error(err?.response?.data?.message || "Something went wrong");
      setUsers((prev) => ({ ...prev, loading: false }));
    })
  }

  const columns: ColumnsType<TransactionsType> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => index + 1,
      width: "55px",
    },
    {
      title: "Overview",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              {title}
            </Typography>
          </div>
          <Typography color="dark-main" size="sm" className="mb-1">
            {record?.Invoice?.invoiceNumber || "No Invoice Attached"}
          </Typography>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Authority:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record?.Authority?.title}
            </Typography>
          </div>

          <Typography color="dark-main" size="sm">
            {record.remarks}
          </Typography>
        </>
      ),
      width: "300px"
    },
    {
      title: "Project",
      dataIndex: "Project",
      key: "Project",
      render: (Project: TransactionsType['Project'], record) => (
        <>
          <Typography color="dark-main">
            {record.Client?.name}
          </Typography>

          {record.Client?.email && (
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              copyable={{ text: record.Client?.email }}
              className="font-size-xs color-dark-sub mb-0"
            >
              <a href={`mailto:${record.Client?.email}`} style={{ color: 'var(--color-dark-sub)' }}>
                {record.Client?.email}
              </a>
            </Paragraph>
          )}

          {record.Client?.phone && (
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              copyable={{ text: `${record.Client?.phoneCode}${record.Client?.phone}` }}
              className="font-size-xs color-dark-sub"
            >
              <a href={`tel:${record.Client?.phoneCode} ${record.Client?.phone}`} style={{ color: 'var(--color-dark-sub)' }}>
                {`${record.Client?.phoneCode}${record.Client?.phone}`}
              </a>
            </Paragraph>
          )}
          {/**Project Link */}
          {Project?.slug && (
            <a
              href={`/projects/${Project?.slug}?id=${Project?.id}`}
              target="_blank" rel="noreferrer" title="View Project"
              className="d-flex align-center mt-2"
            >
              <Typography color="dark-main" size="sm">
                {`${Project?.referenceNumber || ""} ${Project?.referenceNumber ? "|" : ""} ${Project?.title || ""}`}
              </Typography>
              <ExternalIcon />
            </a>
          )}
        </>
      ),
      width: "400px",
    },
    {
      title: "Transaction",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => (
        <>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Amount:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {formatCurrency(amount)}
            </Typography>
          </div>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Reference:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record.transactionReference}
            </Typography>
          </div>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Date:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {`${convertDate(record.transactionDate, "MM dd,yy")}`}
            </Typography>
          </div>
          {record?.receipt && (
            <a
              href={`${APPLICATION_RESOURCE_BASE_URL}${record?.receipt}`}
              target="_blank" rel="noreferrer" title=" View Receipt"
              className="d-flex align-center mt-2"
            >
              <Typography color="dark-main" size="sm">
                View Receipt
              </Typography>
              <ExternalIcon />
            </a>
          )}
        </>
      ),
      width: "200px",
    },
    {
      title: 'Status',
      dataIndex: "status",
      key: "status",
      render: (status: number, record) => (
        <StatusDropdown
          recordId={record.id} status={status}
          permissions={permissions}
          reloadTableData={reloadTableData}
        />
      ),
      width: "150px",
    },
    {
      title: 'Assigned To',
      dataIndex: "AssignedTo",
      key: "AssignedTo",
      render: (AssignedTo: TransactionsType['AssignedTo'], record) => (
        <UserDropDown
          AssignedTo={AssignedTo}
          transactionId={record.id}
          permissions={permissions}
          loading={users.loading}
          users={users.data}
          getUsers={getUsers}
          reloadTableData={reloadTableData}
        />
      ),
      width: "150px",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_actions: string, record: TransactionsType) => (
        <ActionComponent
          record={record}
          onEditIconClick={onEditIconClick}
          reloadTableData={reloadTableData}
          permissions={permissions}
        />
      ),
      width: "120px",
    }
  ];

  return (
    <Table
      sticky
      dataSource={tableData}
      columns={columns}
      pagination={false}
      scroll={{ x: 991 }}
      loading={tableLoading}
      rowKey={(record) => `transaction-${record.id}`}
    />
  );
}

export default TransactionsTable;
