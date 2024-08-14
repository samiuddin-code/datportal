import { useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteRolesModal } from "./modal";
import TableComponent from "./table-columns";
import { RolesModule } from "../../../../Modules/Roles";
import { RoleTypes } from "../../../../Modules/Roles/types";
import { PageHeader } from "../../../Atoms";
import { RolePermissionsEnum } from "../../../../Modules/Roles/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { useFetchData } from "hooks";
import { DashboardElementsModal } from "./DashboardElements/modal";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: true,
		text: "Site Settings",
		path: "/siteSettings",
	},
	{
		isLink: false,
		text: "Roles",
	},
];

function SiteRoleSettings() {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(RolePermissionsEnum)
	// add new permission for the roles page
	permissionSlug.push("grantPrivilegesToRole", "readRolePermissions");
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in RolePermissionsEnum]: boolean };
	const { createRole, readRole, updateRole } = permissions

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const [editDashboardElements, setEditDashboardElements] = useState<{
		recordId: number;
		openModal: boolean;
		recordData?: any
	}>({
		recordId: 0,
		openModal: false,
		recordData: {}
	});

	const onEditDashboardClick = (record: RoleTypes) => {
		// if (addUserRole === false) {
		// 	message.error("You don't have permission to manage roles for this user");
		// 	return;
		// }
		setEditDashboardElements({
			...editDashboardElements,
			recordId: record.id,
			recordData: record,
			openModal: true,
		});
	};


	const module = new RolesModule();

	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<RoleTypes[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});

	const onCancelClick = () => {
		if (createRole === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: RoleTypes) => {
		if (updateRole === false) {
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


	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Roles"
				buttonText="Add New Role"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createRole === true ? true : false}
			/>
			{readRole === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
					onManageDashboardElementsClick={onEditDashboardClick}
				/>
			)}
			{readRole === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteRolesModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={onRefresh}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
			{editDashboardElements.openModal && (
				<DashboardElementsModal
					record={editDashboardElements.recordId}
					recordData={editDashboardElements.recordData}
					type={"edit"}
					reloadTableData={onRefresh}
					onCancel={() => setEditDashboardElements({ ...editDashboardElements, openModal: false })}
					openModal={editDashboardElements.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SiteRoleSettings;
