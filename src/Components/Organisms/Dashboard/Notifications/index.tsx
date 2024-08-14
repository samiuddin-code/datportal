import { useState } from "react";
import { message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { NotificationModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { NotificationModule } from "@modules/Notification";
import { NotificationTypes } from "@modules/Notification/types";
import { NotificationPermissionsEnum } from "@modules/Notification/permissions";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Notifications" },
];

function Notifications() {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(NotificationPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in NotificationPermissionsEnum]: boolean };
  const { readNotification, createNotification } = permissions;

  const [currentEditType, setCurrentEditType] = useState<{
    editType: "new" | "edit";
    recordId: number;
    openModal: boolean;
  }>({
    editType: "new",
    recordId: 0,
    openModal: false,
  });

  const [filters, setFilters] = useState({ page: 1, perPage: 10 });

  const module = new NotificationModule();

  const { data, onRefresh, setData, loading, meta } = useFetchData<NotificationTypes[]>({
    method: module.getAnnouncements,
    initialQuery: { ...filters }
  });

  const onCancelClick = () => {
    if (createNotification === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setCurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
    });
  };

  return (
    <Layout
      permissionSlug={permissionSlug}>
      <PageHeader
        heading="Announcements"
        buttonText="Add Announcement"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={createNotification === true ? true : false}
      />

      {readNotification === true && (
        <TableComponent
          tableData={data!}
          tableLoading={loading}
          onEditIconClick={() => { }}
          reloadTableData={onRefresh}
          meta={meta}
          filters={filters}
        />
      )}

      {readNotification === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {currentEditType.openModal && (
        <NotificationModal
          record={currentEditType.recordId}
          type={currentEditType.editType}
          reloadTableData={onRefresh}
          onCancel={onCancelClick}
          openModal={currentEditType.openModal}
          permissions={permissions}
        />
      )}
    </Layout>
  );
}
export default Notifications;
