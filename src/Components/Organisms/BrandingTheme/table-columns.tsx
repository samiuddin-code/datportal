import { FC } from "react";
import { Table } from "antd";
import Typography from "@atoms/Headings";
import { TableProps } from "@organisms/Common/common-types";
import { BrandingThemePermissionsEnum } from "@modules/BrandingTheme/permissions";
import { BrandingThemeType } from "@modules/BrandingTheme/types";
import ActionComponent from "./actions";
import { ColumnsType } from "antd/lib/table";

interface BrandingThemeTableProps extends TableProps<BrandingThemeType> {
  permissions: { [key in BrandingThemePermissionsEnum]: boolean };
}

const BrandingThemeTable: FC<BrandingThemeTableProps> = (props) => {
  const {
    tableData, tableLoading, onEditIconClick, reloadTableData, permissions
  } = props;

  const columns: ColumnsType<BrandingThemeType> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => index + 1,
      // width: "6%",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Typography color="dark-main" size="sm">
          {title}
        </Typography>
      ),
    },
    {
      title: "Payment Terms",
      dataIndex: "paymentTerms",
      key: "paymentTerms",
      render: (paymentTerms: string) => (
        <Typography color="dark-main" size="sm">
          {paymentTerms}
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
      rowKey={(record) => `branding-theme-${record.id}`}
    />
  );
}

export default BrandingThemeTable;
