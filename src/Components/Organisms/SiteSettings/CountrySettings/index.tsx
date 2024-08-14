import { message } from "antd";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CountryPermissionsEnum } from "../../../../Modules/Country/permissions";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import {
	addCountryDataAction,
	editCountryDataAction,
	getCountryData,
} from "../../../../Redux/Reducers/countryReducer/action";
import { RootState } from "../../../../Redux/store";
import { PageHeader } from "../../../Atoms";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { CountryModal } from "./countryModal";
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
		text: "Country Settings",
	},
];

function CountrySettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(CountryPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CountryPermissionsEnum]: boolean };
	const { readCountry, createCountry, updateCountry } = permissions;

	const dispatch = useDispatch<dispatchType>();
	const [openModal, setOpenModal] = useState(false);
	const [currentEditType, setcurrentEditType] = useState("new");
	const [selectedCountry, setSelectedCountry] = useState<{ id: string }>({ id: "" });
	const { countryData, addCountryData, editCountryData } = useSelector(
		(state: RootState) => state.countryReducer
	);
	useEffect(() => {
		dispatch(getCountryData());
	}, [dispatch]);

	const onCancelClick = useCallback(() => {
		if (createCountry === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType("new");
		setOpenModal(!openModal);
		setSelectedCountry({ id: "" });
	}, [openModal]);

	const onEditIconClick = useCallback((record: SetStateAction<any>) => {
		if (updateCountry === false) {
			message.error("You don't have permission to edit record");
			return;
		}
		setSelectedCountry(record);
		setcurrentEditType("edit");
		setOpenModal(!openModal);
	}, [openModal]);

	const onFinish = useCallback((obj: any) => {

		switch (currentEditType) {
			case "new": {
				if (createCountry === true) {
					dispatch(
						addCountryDataAction(obj, () => {
							dispatch(getCountryData());
							onCancelClick();
						})
					);
				} else {
					message.error("You don't have permission to create new record");
				}
				break;
			}
			case "edit": {
				if (updateCountry === true) {
					dispatch(
						editCountryDataAction(obj, selectedCountry, () => {
							dispatch(getCountryData());
							onCancelClick();
						})
					)
				} else {
					message.error("You don't have permission to edit record");
				}
				break;
			}
		}
	},
		[currentEditType, dispatch, onCancelClick, selectedCountry]
	);
	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Countries"
				buttonText="Add New Country"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createCountry === true ? true : false}
			/>
			{readCountry === true && (
				<TableComponent
					tableData={countryData.data}
					tableLoading={countryData.loading}
					openModal={onEditIconClick}
				/>
			)}
			{readCountry === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			<CountryModal
				initialValues={selectedCountry}
				type={currentEditType}
				onFinish={onFinish}
				onCancel={onCancelClick}
				openModal={openModal}
				buttonLoading={addCountryData.loading || editCountryData.loading}
			/>
		</SiteSettingsTemplate>
	);
}
export default CountrySettings;
