import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { PropertyCategoryModal } from "./modal";
import TableComponent from "./table-columns";
import { ProjectTypeType } from "../../../../Modules/ProjectType/types";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { ProjectTypePermissionsEnum } from "../../../../Modules/ProjectType/permissions";
import { ProjectTypeModule } from "../../../../Modules/ProjectType";
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
		text: "Project Type",
	},
];

function ProjectType() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(ProjectTypePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in ProjectTypePermissionsEnum]: boolean };
	const { readProjectType, createProjectType, updateProjectType } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new ProjectTypeModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<ProjectTypeType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	const onCancelClick = () => {
		if (createProjectType === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: ProjectTypeType) => {
		if (updateProjectType === false) {
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
				heading="Project Type"
				buttonText="Add Project Type"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createProjectType === true ? true : false}
			/>
			{readProjectType === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readProjectType === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<PropertyCategoryModal
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
export default ProjectType;
