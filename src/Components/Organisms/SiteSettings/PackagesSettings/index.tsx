import { message } from "antd";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PackagePermissionsEnum } from "../../../../Modules/Package/permissions";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import {
	addPackageDataAction,
	editPackageDataAction,
	getPackageData,
} from "../../../../Redux/Reducers/PackagesReducer/action";
import { RootState } from "../../../../Redux/store";
import { PageHeader } from "../../../Atoms";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { PackageModal } from "./packageModal";
import TableComponent from "./tableColumns";
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
		text: "Package Settings",
	},
];

function PackageSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PackagePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PackagePermissionsEnum]: boolean };
	const { readPackage, createPackage, updatePackage } = permissions;

	const dispatch = useDispatch<dispatchType>();
	const [openModal, setOpenModal] = useState(false);
	const [currentEditType, setcurrentEditType] = useState("new");
	const [selectedPackage, setSelectedPackage] = useState({});
	const { packageData, addPackageData, editPackageData } = useSelector(
		(state: RootState) => state.packageReducer
	);

	useEffect(() => {
		dispatch(getPackageData());
	}, [dispatch]);

	const onCancelClick = useCallback(() => {
		if (createPackage === false) {
			message.error("You don't have permission to create new package");
			return;
		}
		setcurrentEditType("new");
		setOpenModal(!openModal);
		setSelectedPackage({});
	}, [openModal]);

	const onEditIconClick = useCallback((record: SetStateAction<{}>) => {
		if (updatePackage === false) {
			message.error("You don't have permission to update this package");
			return;
		}
		setSelectedPackage(record);
		setcurrentEditType("edit");
		setOpenModal(!openModal);
	}, [openModal]);

	const onFinish = useCallback((obj: any) => {
		const formData = new FormData();
		const excludeFields = ["icon", "translations"];
		Object.entries(obj).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				formData.append(ele[0], ele[1]);
			}
		});

		if (
			obj["icon"] &&
			typeof obj["icon"] !== "string" &&
			obj["icon"]["fileList"].length > 0
		) {
			formData.append("icon", obj["icon"]["fileList"][0]["originFileObj"]);
		}

		if (obj.translations) {
			obj.translations.forEach(
				(item: { language: string; title: string, description: string }, index: number) => {
					formData.append(`translations[${index + 1}][language]`, item.language);
					formData.append(`translations[${index + 1}][title]`, item.title);
					formData.append(`translations[${index + 1}][description]`, item.description);
				}
			);
		}

		switch (currentEditType) {
			case "new": {
				if (createPackage === true) {
					dispatch(
						addPackageDataAction(formData, () => {
							dispatch(getPackageData());
							onCancelClick();
						})
					);
				} else {
					message.error("You don't have permission to create new package");
				}
				break;
			}
			case "edit": {
				if (updatePackage === true) {
					dispatch(
						editPackageDataAction(formData, selectedPackage, () => {
							dispatch(getPackageData());
							onCancelClick();
						})
					)
				} else {
					message.error("You don't have permission to update this package");
				}
				break;
			}
		}
	},
		[currentEditType, dispatch, onCancelClick, selectedPackage]
	);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Package Settings"
				buttonText="Add New Package"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPackage === true ? true : false}
			/>
			{readPackage === true && (
				<TableComponent
					tableData={packageData.data}
					tableLoading={packageData.loading}
					openModal={onEditIconClick}
				/>
			)}
			{readPackage === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			<PackageModal
				initialValues={selectedPackage}
				type={currentEditType}
				onFinish={onFinish}
				onCancel={onCancelClick}
				openModal={openModal}
				buttonLoading={addPackageData.loading || editPackageData.loading}
			/>
		</SiteSettingsTemplate>
	);
}
export default PackageSettings;
