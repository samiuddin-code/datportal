import { FC, useState } from "react";
import { Input, Table } from "antd";
import Typography from "@atoms/Headings";
import { TableProps } from "@organisms/Common/common-types";
import { ProductPermissionsEnum } from "@modules/Product/permissions";
import { ProductType } from "@modules/Product/types";
import ActionComponent from "./actions";
import { ColumnsType } from "antd/lib/table";

interface ProductTableProps extends TableProps<ProductType> {
  permissions: { [key in ProductPermissionsEnum]: boolean };
}

const ProductTable: FC<ProductTableProps> = (props) => {
  const {
    tableData, tableLoading, onEditIconClick, reloadTableData, permissions
  } = props;
  const [searchTerm, setSearchTerm] = useState("");

  const columns: ColumnsType<ProductType> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => index + 1,
      width: "6%",
    },
    {
      title: "Product Code",
      dataIndex: "productCode",
      key: "productCode",
      render: (productCode: string) => (
        <Typography color="dark-main" size="sm">
          {productCode}
        </Typography>
      ),
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <Typography color="dark-main" size="sm">
          {description}
        </Typography>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Typography color="dark-main" size="sm">
          {quantity}
        </Typography>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (unitPrice: number) => (
        <Typography color="dark-main" size="sm">
          {unitPrice}
        </Typography>
      ),
    },
    {
      title: "Account",
      dataIndex: "Account",
      key: "Account",
      render: (Account: ProductType["Account"]) => (
        <Typography color="dark-main" size="sm">
          {Account ?
          `${Account?.accountCode} - ${Account?.title}`
          : "" }
        </Typography>
      ),
    },
    {
      title: "Tax Rate",
      dataIndex: "TaxRate",
      key: "TaxRate",
      render: (TaxRate: ProductType["TaxRate"]) => (
        <Typography color="dark-main" size="sm">
          {TaxRate ?
          `${TaxRate?.taxType} - ${TaxRate?.title} (${TaxRate?.rate}%)`
          : ""}
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
    <div>
      <Input
        type="input"
        placeholder="Search by title"
        onChange={(event) => {
          setSearchTerm(event.target.value);
        }}
        allowClear
        style={{
          border: '1.5px solid var(--color-border)',
          borderRadius: '0.25rem',
          width: '25%',
          marginBottom: '1rem'
        }}
        prefix={<img style={{ padding: '0rem 0.5rem' }} src="/images/searchIcon.svg" alt="" />}
      />
      <Table
        sticky
        dataSource={tableData?.filter((item: ProductType) => 
					item?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || item?.productCode?.toLowerCase()?.includes(searchTerm.toLowerCase()))}
        columns={columns}
        pagination={false}
        scroll={{ x: 991 }}
        loading={tableLoading}
        rowKey={(record) => `product-${record.id}`}
      />
    </div>
  );
}

export default ProductTable;
