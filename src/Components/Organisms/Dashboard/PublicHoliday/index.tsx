import { useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { PublicHolidayModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PublicHolidayModule } from "../../../../Modules/PublicHoliday";
import { PublicHolidayType } from "../../../../Modules/PublicHoliday/types";
import { useFetchData } from "hooks";
import { getPermissionSlugs } from "@helpers/common";
import { PublicHolidayPermissionSet } from "@modules/PublicHoliday/permissions";
import Layout from "@templates/Layout";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Public Holiday",
	},
];

function PublicHoliday() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PublicHolidayPermissionSet)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PublicHolidayPermissionSet]: boolean };
	const { readPublicHoliday, createPublicHoliday, updatePublicHoliday } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new PublicHolidayModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const onCancelClick = () => {
		if (createPublicHoliday === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PublicHolidayType) => {
		if (updatePublicHoliday === false) {
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
	const { data, onRefresh, setData, loading, meta } = useFetchData<PublicHolidayType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	return (
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="Public Holiday"
				buttonText="Add Public Holiday"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPublicHoliday === true ? true : false}
			/>
			{readPublicHoliday === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readPublicHoliday === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<PublicHolidayModal
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
export default PublicHoliday;
