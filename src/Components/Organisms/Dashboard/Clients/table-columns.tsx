import { Table } from "antd";
import Typography from "@atoms/Headings";
import styles from "@organisms/Common/styles.module.scss";
import { TableProps } from "@organisms/Common/common-types";
import { ClientType } from "@modules/Client/types";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { ClientPermissionsEnum } from "@modules/Client/permissions";
import { APIResponseObject } from "@modules/Common/common.interface";
import ActionComponent from "./actions";
import { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";

export default function TableComponent(props: TableProps & { tableData: ClientType[], meta: APIResponseObject["meta"], filters: any }) {
  const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ClientPermissionsEnum]: boolean };

  const columns: ColumnsType<ClientType> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record, index: number) => index + 1,
      width: "5%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <Link
          to={`/clients/${record?.uuid}?id=${record?.id}`}
        // className={styles.name}
        >
          <Typography color="dark-main" size="sm">
            {name}
          </Typography>
        </Link>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string, record) => (
        <Typography color="dark-main" size="sm">
          {(!["0", "undefined", null].includes(phone)) ? (record.phoneCode + phone) : "-"}
        </Typography>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <Typography color="dark-main" size="sm">
          {email}
        </Typography>
      ),
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
    },
  ];

  return (
    <div className={styles.antdTableWrapper}>
      <Table
        sticky
        dataSource={tableData}
        columns={columns}
        scroll={{ x: 991 }}
        loading={tableLoading}
        rowKey={(record) => `client-${record.id}`}
        pagination={{
          current: meta?.page,
          total: meta?.total,
          hideOnSinglePage: true,
          pageSize: meta?.perPage,
          onChange(page, pageSize) {
            reloadTableData({ ...filters, page: page, perPage: pageSize })
          },
        }}
      />
    </div>
  );
}
