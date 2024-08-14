import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { ProjectComponentsModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { ProjectComponentsPermissionsEnum } from "../../../../Modules/ProjectComponents/permissions";
import { ProjectComponentsModule } from "../../../../Modules/ProjectComponents";
import { ProjectComponentsType } from "../../../../Modules/ProjectComponents/types";
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
		text: "Project Components",
	},
];

function ProjectComponents() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(ProjectComponentsPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in ProjectComponentsPermissionsEnum]: boolean };
	const { readProjectComponent, createProjectComponent, updateProjectComponent } = permissions;
	const [isLoading, setIsLoading] = useState(false);
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new ProjectComponentsModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		if (createProjectComponent === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: ProjectComponentsType) => {
		if (updateProjectComponent === false) {
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
		setIsLoading(true)
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords().then((res) => {
			console.log(res.data, 'sads')
			setModuleData(res);
			setIsLoading(false);
		}).catch((err) => {
			setIsLoading(false);
			return
		});
	};

	useEffect(() => {
		reloadTableData();
	}, []);


	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Project Components"
				buttonText="Add Component"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createProjectComponent === true ? true : false}
			/>
			{readProjectComponent === true && (
				<TableComponent
					tableData={moduleData.data.data}
					tableLoading={isLoading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{readProjectComponent === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<ProjectComponentsModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default ProjectComponents;
