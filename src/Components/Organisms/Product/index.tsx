import { FC, useMemo, useState } from "react";
import { PageHeader } from "@atoms/";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { Button, message } from "antd";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { ProductPermissionsEnum } from "@modules/Product/permissions";
import { ProductType } from "@modules/Product/types";
import { ProductModule } from "@modules/Product";
import Layout from "@templates/Layout";
import ProductTable from "./table-columns";
import { useFetchData } from "hooks";
import { ProductModal } from "./modal";
import { getPermissionSlugs, handleError } from "@helpers/common";
import { XeroModule } from "@modules/Xero";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Product" },
];

type ModalOpenType = {
  type: "new" | "edit"
  recordId: number;
  open: boolean;
  projectId?: number;
}

const Product: FC = () => {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(ProductPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProductPermissionsEnum]: boolean };
  const { readProduct, createProduct, updateProduct } = permissions;

  const module = useMemo(() => new ProductModule(), []);
  const xeroModule = useMemo(() => new XeroModule(), []);

  const { data, onRefresh, loading } = useFetchData<ProductType[]>({
    method: module.getAllRecords,
  })

  const [modalOpen, setModalOpen] = useState<ModalOpenType>({
    type: "new", recordId: 0, open: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const onCancelClick = () => {
    if (createProduct === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({ ...modalOpen, open: !modalOpen.open, type: "new" });
  };

  const onEditIconClick = (record: ProductType) => {
    if (updateProduct === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({
      ...modalOpen, open: !modalOpen.open, type: "edit",
      recordId: record.id
    });
  };

  const SyncWithXero = async () => {
    setIsLoading(true);
    try {
      await xeroModule.syncProducts();
      message.success("Synced successfully");
      onRefresh();
    } catch (err) {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Product" buttonText="Add Product"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={!!createProduct}
        excelExport={
          <Button
            loading={isLoading}
            style={{ marginRight: '1rem', height: '2.25rem' }}
            onClick={SyncWithXero}
          >
            Sync with Xero
          </Button>
        }
      />
      {readProduct === true && (
        <ProductTable
          tableData={data!}
          tableLoading={loading}
          onEditIconClick={onEditIconClick}
          reloadTableData={onRefresh}
          permissions={permissions}
        />
      )}

      {readProduct === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {modalOpen.open && (
        <ProductModal
          type={modalOpen.type}
          openModal={modalOpen.open}
          record={modalOpen.recordId}
          onCancel={onCancelClick}
          reloadTableData={onRefresh}
          permissions={permissions}
        />
      )}
    </Layout>
  );
}
export default Product;