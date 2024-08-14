import { useState } from "react";
import { AccountModal } from "./modal";
import TableComponent from "./table-columns";
import { AccountType } from "@modules/Account/types";
import { PageHeader } from "@atoms/";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { Button, message } from "antd";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { AccountModule } from "@modules/Account";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { AccountPermissionsEnum } from "@modules/Account/permissions";
import { getPermissionSlugs, handleError } from "@helpers/common";
import { XeroModule } from "@modules/Xero";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: false,
    text: "Account",
  },
];

function Account() {
  const [isLoading, setIsLoading] = useState(false);
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(AccountPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in AccountPermissionsEnum]: boolean };
  const { readAccount, createAccount, updateAccount } = permissions;
  const [filters] = useState<{ page: number, perPage: number }>({
    page: 1,
    perPage: 25
  })

  const [currentEditType, setcurrentEditType] = useState<{
    editType: "new" | "edit";
    recordId: number;
    openModal: boolean;
  }>({
    editType: "new",
    recordId: 0,
    openModal: false,
  });

  const module = new AccountModule();
  const xeroModule = new XeroModule();

  const { data, onRefresh, loading, meta } = useFetchData<AccountType[]>({
    method: module.getAllRecords,
    initialQuery: { ...filters }
  });

  const onCancelClick = () => {
    if (createAccount === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
    });
  };


  const onEditIconClick = (record: AccountType) => {
    if (updateAccount === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      editType: "edit",
      recordId: record.id,
      openModal: true,
    });
  };

  const SyncWithXero = async () => {
    setIsLoading(true);
    try {
      await xeroModule.syncAccounts();
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
    <Layout
      permissionSlug={permissionSlug}>
      <PageHeader
        heading="Account"
        buttonText="Add Account"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={createAccount === true ? true : false}
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
      {readAccount === true && (
        <TableComponent
          tableData={data!}
          tableLoading={loading}
          onEditIconClick={onEditIconClick}
          reloadTableData={onRefresh}
          meta={meta}
          filters={filters}
        />
      )}
      {readAccount === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {currentEditType.openModal && (
        <AccountModal
          record={currentEditType.recordId}
          type={currentEditType.editType}
          reloadTableData={() => onRefresh()}
          onCancel={onCancelClick}
          openModal={currentEditType.openModal}
          permissions={permissions}
        />
      )}
    </Layout>
  );
}
export default Account;
