import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
// import { PayrollCycleModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PayrollCyclePermissionsEnum } from "../../../../Modules/PayrollCycle/permissions";
import { PayrollCycleModule } from "../../../../Modules/PayrollCycle";
import { PayrollCycleType } from "../../../../Modules/PayrollCycle/types";
import { useFetchData } from "hooks";
import Layout from "@templates/Layout";
import { getPermissionSlugs } from "@helpers/common";
import { PayrollCycleModal } from "./modal";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Payroll Cycle",
	},
];

function PayrollCycle() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PayrollCyclePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PayrollCyclePermissionsEnum]: boolean };
	const { readPayrollCycle, createPayrollCycle, updatePayrollCycle } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new PayrollCycleModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<PayrollCycleType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	const onCancelClick = () => {
		if (createPayrollCycle === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PayrollCycleType) => {
		if (updatePayrollCycle === false) {
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
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="Payroll Cycle"
				buttonText="Add Payroll Cycle"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPayrollCycle === true ? true : false}
			/>
			{readPayrollCycle === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readPayrollCycle === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<PayrollCycleModal
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
export default PayrollCycle;
