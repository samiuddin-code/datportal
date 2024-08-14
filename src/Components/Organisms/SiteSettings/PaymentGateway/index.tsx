import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { PaymentGateway } from "./modal";
import TableComponent from "./table-columns";
import { PaymentGatewayModule } from "../../../../Modules/PaymentGateway";
import { PaymentGatewayTypes } from "../../../../Modules/PaymentGateway/types";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PaymentGatewayPermissionsEnum } from "../../../../Modules/PaymentGateway/permissions";
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
		isLink: true,
		text: "Site Settings",
		path: "/siteSettings",
	},
	{
		isLink: false,
		text: "Payment Gateway",
	},
];

function PaymentGatewaySettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PaymentGatewayPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PaymentGatewayPermissionsEnum]: boolean };
	const { readPaymentGateway, createPaymentGateway, updatePaymentGateway } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new PaymentGatewayModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		if (createPaymentGateway === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PaymentGatewayTypes) => {
		if (updatePaymentGateway === false) {
			message.error("You don't have permission to update record");
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
			setModuleData(res.data);
		}).catch((err) => { });
	};

	useEffect(() => {
		reloadTableData();
	}, []);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Payment Gateway"
				buttonText="Add Payment Gateway"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPaymentGateway === true ? true : false}
			/>
			{readPaymentGateway === true && (
				<TableComponent
					tableData={moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{createPaymentGateway === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<PaymentGateway
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
export default PaymentGatewaySettings;
