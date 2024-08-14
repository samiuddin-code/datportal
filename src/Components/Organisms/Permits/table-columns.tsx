import { FC, useState } from "react";
import { Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Typography from "@atoms/Headings";
import { TableProps } from "@organisms/Common/common-types";
import { PermitsPermissionsEnum } from "@modules/Permits/permissions";
import { PermitsType } from "@modules/Permits/types";
import ActionComponent from "./actions";
import { ColumnsType } from "antd/lib/table";
import { convertDate } from "@helpers/dateHandler";
import { ExternalIcon } from "@icons/external";
import { isDateExpiringSoon, isDateGreaterThan } from "@helpers/common";
import StatusDropdown from "./status";
import ViewPermitFiles from "./view-files";

interface PermitsTableProps extends TableProps<PermitsType> {
  permissions: { [key in PermitsPermissionsEnum]: boolean };
}

const PermitsTable: FC<PermitsTableProps> = (props) => {
  const {
    tableData, tableLoading, onEditIconClick, reloadTableData, permissions
  } = props;

  const [permitFiles, setPermitFiles] = useState<{ open: boolean; id: number; }>();

  const columns: ColumnsType<PermitsType> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => index + 1,
      width: "6%",
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
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Authority:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record.Authority.title}
            </Typography>
          </div>
          <div className="d-flex justify-between">
            <Typography color="dark-main" size="sm" weight="bold">
              Remarks:
            </Typography>
            <Typography color="dark-main" size="sm" className="ml-1">
              {record.remarks}
            </Typography>
          </div>


          <div className="d-flex align-center mt-1">
            <Typography color="dark-sub" size="sm" className="cursor-pointer">
              {`${record?._count?.Resources > 0 ? `${record?._count?.Resources} files Attached` : "No Attachments"} `}
            </Typography>
            {record?._count?.Resources > 0 && (
              <Tooltip title="View Attachments">
                <EyeOutlined
                  className="ml-2 cursor-pointer"
                  onClick={() => setPermitFiles({ open: true, id: record.id })}
                />
              </Tooltip>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Project",
      dataIndex: "Project",
      key: "Project",
      render: (Project: PermitsType['Project']) => (
        <a
          href={`/projects/${Project?.slug}?id=${Project?.id}`}
          target="_blank" rel="noreferrer" title="View Project"
          className="d-flex align-center"
        >
          <Typography color="dark-main" size="sm">
            {Project?.title}
          </Typography>
          <ExternalIcon />
        </a>
      ),
    },
    {
      title: "Date/Status",
      dataIndex: "date",
      key: "date",
      render: (_date: string, record) => {
        const isExpired = isDateGreaterThan(record?.expiryDate, new Date().toISOString());

        // check if it is expiring
        const isExpiring = isDateExpiringSoon(record?.expiryDate, 30);

        return (
          <>
            <div className="d-flex justify-between">
              <Typography color="dark-main" size="sm" weight="bold">
                Approved:
              </Typography>
              <Typography color="dark-main" size="sm" className="ml-1">
                {convertDate(record.approvedDate, "MM dd,yy")}
              </Typography>
            </div>

            <div className="d-flex justify-between">
              <Typography color="dark-main" size="sm" weight="bold">
                Expiry:
              </Typography>
              <Typography color="dark-main" size="sm" className="ml-1">
                {convertDate(record.expiryDate, "MM dd,yy")}
              </Typography>
            </div>

            <div className="d-flex justify-between mt-2">
              <Typography color="dark-main" size="sm" weight="bold">
                Status:
              </Typography>
              <Typography
                size="sm"
                className={`ml-1 ${isExpired ? 'color-red-yp' : 'color-primary-main'}`}
              >
                {`${isExpired ? 'Expired' : 'Active'} ${(!isExpired && isExpiring) ? '(Expiring Soon)' : ''}`}
              </Typography>
            </div>
          </>
        )
      },
      width: "250px",
    },
    {
      title: "Finance Status",
      dataIndex: "financeStatus",
      key: "financeStatus",
      render: (financeStatus: PermitsType['financeStatus'], record) => (
        <StatusDropdown
          type="finance" recordId={record.id}
          permissions={permissions} status={financeStatus}
          reloadTableData={reloadTableData}
        />
      ),
      width: "150px",
    },
    {
      title: "Client Status",
      dataIndex: "clientStatus",
      key: "clientStatus",
      render: (clientStatus: PermitsType['clientStatus'], record) => (
        <StatusDropdown
          type="client" recordId={record.id}
          permissions={permissions} status={clientStatus}
          reloadTableData={reloadTableData}
        />
      ),
      width: "150px",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_actions: string, record) => (
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
    <>
      <Table
        sticky
        dataSource={tableData}
        columns={columns}
        pagination={false}
        scroll={{ x: 991 }}
        loading={tableLoading}
        rowKey={(record) => `permit-${record.id}`}
      />

      {permitFiles?.open && (
        <ViewPermitFiles
          id={permitFiles.id}
          open={permitFiles.open}
          onClose={() => setPermitFiles({ open: false, id: 0 })}
        />
      )}
    </>
  );
}

export default PermitsTable;
