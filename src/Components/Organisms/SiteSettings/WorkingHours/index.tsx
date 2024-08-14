import { useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { WorkingHourModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { WorkingHourPermissionSet } from "../../../../Modules/WorkingHours/permissions";
import { WorkingHoursModule } from "../../../../Modules/WorkingHours";
import { WorkingHourType } from "../../../../Modules/WorkingHours/types";
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
		text: "Working Hours",
	},
];

function WorkingHours() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(WorkingHourPermissionSet)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in WorkingHourPermissionSet]: boolean };
	const { readWorkingHour, createWorkingHour, updateWorkingHour } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new WorkingHoursModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const onCancelClick = () => {
		if (createWorkingHour === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: WorkingHourType) => {
		if (updateWorkingHour === false) {
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
	const { data, onRefresh, setData, loading, meta } = useFetchData<WorkingHourType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Working Hours"
				buttonText="Add Working Hour"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createWorkingHour === true ? true : false}
			/>
			{readWorkingHour === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readWorkingHour === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<WorkingHourModal
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
export default WorkingHours;
