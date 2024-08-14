import { useState } from "react";
import { TaxRateModal } from "./modal";
import TableComponent from "./table-columns";
import { TaxRateType } from "../../../../Modules/TaxRate/types";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Button, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { TaxRateModule } from "../../../../Modules/TaxRate";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { TaxRatePermissionsEnum } from "@modules/TaxRate/permissions";
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
    text: "Tax Rate",
  },
];

function TaxRate() {
  const [isLoading, setIsLoading] = useState(false);
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(TaxRatePermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in TaxRatePermissionsEnum]: boolean };
  const { readTaxRate, createTaxRate, updateTaxRate } = permissions;
  const [filters, setFilters] = useState<{ page: number, perPage: number }>({
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

  const module = new TaxRateModule();
  const xeroModule = new XeroModule();

  const { data, onRefresh, setData, loading, meta } = useFetchData<TaxRateType[]>({
    method: module.getAllRecords,
    initialQuery: { ...filters }
  });

  const onCancelClick = () => {
    if (createTaxRate === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
    });
  };


  const onEditIconClick = (record: TaxRateType) => {
    if (updateTaxRate === false) {
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
      await xeroModule.syncTaxRates();
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
        heading="Tax Rate"
        buttonText="Add Tax Rate"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={createTaxRate === true ? true : false}
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
      {readTaxRate === true && (
        <TableComponent
          tableData={data!}
          tableLoading={loading}
          onEditIconClick={onEditIconClick}
          reloadTableData={onRefresh}
          meta={meta}
          filters={filters}
        />
      )}
      {readTaxRate === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {currentEditType.openModal && (
        <TaxRateModal
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
export default TaxRate;
