import { useEffect, useState } from "react";
import Layout from "../../../Templates/Layout";
import { AgentRolesModal } from "./modal";
import TableComponent from "./table-columns";
import { RolesModule } from "../../../../Modules/Roles";
import { RoleTypes } from "../../../../Modules/Roles/types";
import { PageHeader } from "../../../Atoms";
import { RolePermissionsEnum } from "../../../../Modules/Roles/permissions";
import { RootState } from "../../../../Redux/store";
import { useSelector } from "react-redux";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Roles",
	},
];

function AgentRoles() {
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

	const module = new RolesModule();

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
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

	const reloadTableData = () => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords().then((res) => {
			setModuleData({ ...res.data });
		}).catch((err) => { });
	};

	useEffect(() => {
		reloadTableData();
	}, []);

	return (
		<Layout permissionSlug={permissionSlug}>
			<div>
				<PageHeader
					heading="Roles"
					buttonText="Add New Role"
					onButtonClick={onCancelClick}
					breadCrumbData={breadCrumbsData}
					showAdd={createRole === true ? true : false}
				/>
				{readRole === true && (
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
					/>
				)}
				{readRole === false && (
					<ErrorCode403
						mainMessage="You don't have permission to view this data"
					/>
				)}
				{currentEditType.openModal && (
					<AgentRolesModal
						record={currentEditType.recordId}
						type={currentEditType.editType}
						reloadTableData={reloadTableData}
						onCancel={onCancelClick}
						openModal={currentEditType.openModal}
						permissions={permissions}
					/>
				)}
			</div>
		</Layout>
	);
}
export default AgentRoles;
