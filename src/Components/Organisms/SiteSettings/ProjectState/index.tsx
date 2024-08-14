import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { ProjectStateModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { ProjectStatePermissionsEnum } from "../../../../Modules/ProjectState/permissions";
import { ProjectStateModule } from "../../../../Modules/ProjectState";
import { ProjectStateType } from "../../../../Modules/ProjectState/types";
import { useFetchData } from "hooks";
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
		text: "Project State",
	},
];

function ProjectState() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(ProjectStatePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in ProjectStatePermissionsEnum]: boolean };
	const { readProjectState, createProjectState, updateProjectState } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new ProjectStateModule();

	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<ProjectStateType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});

	const onCancelClick = () => {
		if (createProjectState === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: ProjectStateType) => {
		if (updateProjectState === false) {
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
				heading="Project States"
				buttonText="Add Project State"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createProjectState === true ? true : false}
			/>
			{readProjectState === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readProjectState === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<ProjectStateModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={onRefresh}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default ProjectState;
