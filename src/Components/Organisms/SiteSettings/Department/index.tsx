import { useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { DepartmentModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { DepartmentPermissionsEnum } from "../../../../Modules/Department/permissions";
import { DepartmentModule } from "../../../../Modules/Department";
import { DepartmentType } from "../../../../Modules/Department/types";
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
		text: "Department",
	},
];

function Department() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(DepartmentPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in DepartmentPermissionsEnum]: boolean };
	const { readDepartment, createDepartment, updateDepartment } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new DepartmentModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const onCancelClick = () => {
		if (createDepartment === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: DepartmentType) => {
		if (updateDepartment === false) {
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
	const { data, onRefresh, setData, loading, meta } = useFetchData<DepartmentType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Department"
				buttonText="Add Department"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createDepartment === true ? true : false}
			/>
			{readDepartment === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readDepartment === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<DepartmentModal
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
export default Department;
