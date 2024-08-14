import { useState, useCallback, useMemo } from "react";
import Layout from "@templates/Layout";
import { EmployeeModal } from "./modal";
import TableComponent from "./table-columns";
import { UserModule } from "@modules/User";
import { UserQueryTypes, UserStatus, UserTypes } from "@modules/User/types";
import { PageHeader, Pagination } from "@atoms/";
import Filters from "./filters";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { UserRoleModal } from "./Roles/modal";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { message } from "antd";
import { UserPermissionsEnum } from "@modules/User/permissions";
import { TypeFromEnumValues, getPermissionSlugs } from "@helpers/common";
import { useFetchData } from "hooks";
import { QueryType } from "@modules/Common/common.interface";
import { convertDate } from "@helpers/dateHandler";
import { SelectedFiltersTypes } from "./filters/types";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/", },
  { isLink: false, text: "Employees" },
];

const EmployeesSettings = () => {
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(UserPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in UserPermissionsEnum]: boolean };
  const { readUser, createUser, updateUser, addUserRole } = permissions;

  const [currentEditType, setcurrentEditType] = useState<{
    editType: "new" | "edit";
    recordId: number;
    openModal: boolean;
    form: string;
  }>({
    editType: "new",
    recordId: 0,
    openModal: false,
    form: '1'
  });

  const [editUserRoles, setEditUserRoles] = useState<{
    recordId: number;
    openModal: boolean;
    recordData?: any
  }>({ recordId: 0, openModal: false, recordData: {} });

  const module = useMemo(() => new UserModule(), []);

  const { data, meta, onRefresh, loading } = useFetchData<UserTypes[]>({
    method: module.getAllRecords,
  })

  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
    dateRange: [],
  });

  const onCancelClick = () => {
    if (createUser === false) {
      message.error("You don't have permission to create new user");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
      recordId: 0,
      form: '1'
    });
  };

  const onEditIconClick = (record: UserTypes, currentForm?: string) => {
    if (updateUser === false) {
      message.error("You don't have permission to update this user");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      editType: "edit",
      recordId: record.id,
      openModal: true,
      form: currentForm ? currentForm : '1'
    });
  };

  const onManageRolesClick = (record: UserTypes) => {
    if (addUserRole === false) {
      message.error("You don't have permission to manage roles for this user");
      return;
    }
    setEditUserRoles({
      ...editUserRoles,
      recordId: record.id,
      recordData: record,
      openModal: true,
    });
  };

  const onUpdate = useCallback((query?: QueryType<UserQueryTypes>) => {
    const fromDateString = selectedFilters.dateRange?.[0] || "";
    const toDateString = selectedFilters.dateRange?.[1] || "";
    const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
    const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

    const params: QueryType<UserQueryTypes> = {
      fromDate: fromDate,
      toDate: toDate,
      status: selectedFilters.status || undefined,
      name: selectedFilters.name || undefined,
      organizationId: selectedFilters.organizationId || undefined,
      departmentId: selectedFilters.departmentId || undefined,
      userType: selectedFilters.userType || undefined,
      ids: selectedFilters.ids || undefined,
      roleIds: selectedFilters.roleIds || undefined,
      roleSlugs: selectedFilters.roleSlugs || undefined,
      departmentSlug: selectedFilters.departmentSlug || undefined,
      email: selectedFilters.email || undefined,
      phone: selectedFilters.phone || undefined,
      perPage: selectedFilters.perPage || undefined,
      page: selectedFilters.page || undefined,
      ...query
    }

    onRefresh<QueryType<UserQueryTypes>>(params);
  }, [selectedFilters, onRefresh]);

  // Pagination change
  const onPaginationChange = (page: number, pageSize: number) => {
    onUpdate({ page, perPage: pageSize });
    setSelectedFilters((prev) => ({ ...prev, page, perPage: pageSize }));
  };

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Employees"
        buttonText="Add New Employee"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={!!createUser}
        filters={readUser === true ? (
          <Filters
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            onUpdate={onUpdate}
          />
        ) : null}
      />
      {readUser === true && (
        <>
          <TableComponent
            tableData={data || []}
            tableLoading={loading}
            onEditIconClick={onEditIconClick}
            reloadTableData={onUpdate}
            onManageRolesClick={onManageRolesClick}
            meta={meta}
          />
          <Pagination
            total={meta?.total || 0}
            current={meta?.page || 1}
            defaultPageSize={meta?.perPage ? meta?.perPage : 10}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </>
      )}
      {readUser === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}
      {currentEditType.openModal && (
        <EmployeeModal
          record={currentEditType.recordId}
          type={currentEditType.editType}
          reloadTableData={onUpdate}
          onCancel={onCancelClick}
          openModal={currentEditType.openModal}
          permissions={permissions}
          currentForm={currentEditType.form}
        />
      )}

      {editUserRoles.openModal && (
        <UserRoleModal
          record={editUserRoles.recordId}
          recordData={editUserRoles.recordData}
          type={"edit"}
          reloadTableData={onUpdate}
          onCancel={() => setEditUserRoles({ ...editUserRoles, openModal: false })}
          openModal={editUserRoles.openModal}
          permissions={permissions}
        />
      )}
    </Layout >
  );
}

export default EmployeesSettings;
