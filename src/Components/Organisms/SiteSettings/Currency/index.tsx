import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteCurrencyModal } from "./modal";
import TableComponent from "./table-columns";
import { CurrencyModule } from "../../../../Modules/Currency";
import { CurrencyTypes } from "../../../../Modules/Currency/types";
import { PageHeader } from "../../../Atoms";
import { CurrencyPermissionsEnum } from "../../../../Modules/Currency/permissions";
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
		text: "Currency",
	},
];

function CurrencySettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(CurrencyPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CurrencyPermissionsEnum]: boolean };
	const { readCurrency, createCurrency, updateCurrency } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new CurrencyModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		if (createCurrency === false) {
			message.error("You don't have permission to update this record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: CurrencyTypes) => {
		if (updateCurrency === false) {
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
				heading="Currency"
				buttonText="Add New Currency"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createCurrency === true ? true : false}
			/>
			{readCurrency === true && (
				<TableComponent
					tableData={moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{readCurrency === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteCurrencyModal
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
export default CurrencySettings;
