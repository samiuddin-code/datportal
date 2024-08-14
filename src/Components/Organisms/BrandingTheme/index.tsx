import { FC, useMemo, useState } from "react";
import { PageHeader } from "@atoms/";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { BrandingThemePermissionsEnum } from "@modules/BrandingTheme/permissions";
import { BrandingThemeType } from "@modules/BrandingTheme/types";
import { BrandingThemeModule } from "@modules/BrandingTheme";
import Layout from "@templates/Layout";
import BrandingThemeTable from "./table-columns";
import { useFetchData } from "hooks";
import { BrandingThemeModal } from "./modal";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Branding Theme" },
];

type ModalOpenType = {
  type: "new" | "edit"
  recordId: number;
  open: boolean;
  projectId?: number;
}

const BrandingTheme: FC = () => {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(BrandingThemePermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in BrandingThemePermissionsEnum]: boolean };
  const { readBrandingTheme, createBrandingTheme, updateBrandingTheme } = permissions;

  const module = useMemo(() => new BrandingThemeModule(), []);

  const { data, onRefresh, loading } = useFetchData<BrandingThemeType[]>({
    method: module.getAllRecords,
  })

  const [modalOpen, setModalOpen] = useState<ModalOpenType>({ type: "new", recordId: 0, open: false });

  const onCancelClick = () => {
    if (createBrandingTheme === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({ ...modalOpen, open: !modalOpen.open, type: "new" });
  };

  const onEditIconClick = (record: BrandingThemeType) => {
    if (updateBrandingTheme === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setModalOpen({
      ...modalOpen, open: !modalOpen.open, type: "edit",
      recordId: record.id
    });
  };

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Branding Theme" buttonText="Add Branding Theme"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={!!createBrandingTheme}
      />
      {readBrandingTheme === true && (
        <BrandingThemeTable
          tableData={data!}
          tableLoading={loading}
          onEditIconClick={onEditIconClick}
          reloadTableData={onRefresh}
          permissions={permissions}
        />
      )}

      {readBrandingTheme === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {modalOpen.open && (
        <BrandingThemeModal
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
export default BrandingTheme;