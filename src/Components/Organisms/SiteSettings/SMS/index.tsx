import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteSMSModal } from "./modal";
import TableComponent from "./table-columns";
import { SMSModule } from "../../../../Modules/SMS";
import { SMSTypes } from "../../../../Modules/SMS/types";
import { PageHeader } from "../../../Atoms";
import { SMSPermissionsEnum } from "../../../../Modules/SMS/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
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
		text: "SMS Configuration",
	},
];

function SMSSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(SMSPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in SMSPermissionsEnum]: boolean };
	const { readSMS, createSMS, updateSMS } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new SMSModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		if (createSMS === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: SMSTypes) => {
		if (updateSMS === false) {
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
				heading="SMS Configuration"
				buttonText="Add New SMS Config"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createSMS === true ? true : false}
			/>
			{readSMS === true && (
				<TableComponent
					tableData={moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}

			{readSMS === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<SiteSMSModal
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
export default SMSSettings;
