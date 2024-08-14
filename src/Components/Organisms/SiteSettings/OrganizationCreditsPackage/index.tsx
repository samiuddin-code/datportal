import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { OrgCreditPackageModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { CreditsPackageModule } from "../../../../Modules/CreditsPackage";
import { CreditsPackageTypes } from "../../../../Modules/CreditsPackage/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { CreditPackagePermissionsEnum } from "../../../../Modules/CreditsPackage/permissions";
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
		text: "Credits Packages",
	},
];

function OrgCreditPackageSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(CreditPackagePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CreditPackagePermissionsEnum]: boolean };
	const { readPackage, createPackage, updatePackage } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new CreditsPackageModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		if (createPackage === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: CreditsPackageTypes) => {
		if (updatePackage === false) {
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
		module
			.getAllRecords()
			.then((res) => {
				setModuleData(res.data);
			})
			.catch((err) => { });
	};

	useEffect(() => {
		reloadTableData();
	}, []);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Organization Credits Packages"
				buttonText="Add Credit Package"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPackage === true ? true : false}
			/>
			{readPackage === true && (
				<TableComponent
					tableData={moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{readPackage === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<OrgCreditPackageModal
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					record={currentEditType.recordId}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default OrgCreditPackageSettings;
