import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import {
	addAreaUnitDataAction,
	editAreaUnitDataAction,
	getAreaUnitData,
} from "../../../../Redux/Reducers/AreaUnitReducer/action";
import { RootState } from "../../../../Redux/store";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { AreaUnitModal } from "./areaUnitsModal";
import TableComponent from "./tableColumns";
import { AreaUnit } from "../../../../Redux/Reducers/AreaUnitReducer/types";
import { PageHeader } from "../../../Atoms";
import { AreaUnitsPermissionsEnum } from "../../../../Modules/AreaUnits/permissions";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { message } from "antd";
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
		text: "Area Units",
	},
];

function AreaUnitSettings() {
	// available permissions for this page
	const permissionSlug = getPermissionSlugs(AreaUnitsPermissionsEnum)

	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AreaUnitsPermissionsEnum]: boolean };
	const { readAreaUnit, createAreaUnit, updateAreaUnit } = permissions;

	const dispatch = useDispatch<dispatchType>();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [currentEditType, setcurrentEditType] = useState<string>("new");


	/** default selected values for editing the data */
	const defaultEditData = useMemo<AreaUnit>(() => ({
		id: 0,
		name: "",
		symbol: "",
		rate: 0,
		isPublished: false,
		isDeleted: false,
	}), []);

	const [selectedAreaUnit, setSelectedAreaUnit] = useState<AreaUnit>(defaultEditData);

	const { areaUnitData, addAreaUnitData, editAreaUnitData } = useSelector(
		(state: RootState) => state.areaUnitReducer
	);

	useEffect(() => {
		dispatch(getAreaUnitData());
	}, [dispatch]);

	const onCancelClick = useCallback(() => {
		if (createAreaUnit === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType("new");
		setOpenModal(!openModal);
		setSelectedAreaUnit(defaultEditData);
	}, [openModal, defaultEditData]);

	const onEditIconClick = useCallback(
		(record: any) => {
			setSelectedAreaUnit(record);
			setcurrentEditType("edit");
			setOpenModal(!openModal);
		},
		[openModal]
	);

	const onFinish = useCallback((obj: any) => {
		const formData = obj;

		switch (currentEditType) {
			case "edit": {
				if (updateAreaUnit === true) {
					const data = {
						...formData,
						rate: parseFloat(formData.rate),
					};

					dispatch(
						editAreaUnitDataAction(data, selectedAreaUnit, () => {
							dispatch(getAreaUnitData());
							onCancelClick();
						})
					)
				} else {
					message.error("You don't have permission to update this record");
				}
				break;
			}
			case "new": {
				if (createAreaUnit === true) {
					const data = {
						...formData,
						rate: parseFloat(formData.rate),
					};
					dispatch(
						addAreaUnitDataAction(data, () => {
							dispatch(getAreaUnitData());
							onCancelClick();
						})
					);
				} else {
					message.error("You don't have permission to create new record");
				}
				break;
			}
		}
	},
		[currentEditType, dispatch, onCancelClick, selectedAreaUnit]
	);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Area Units"
				buttonText="Add New Area Unit"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createAreaUnit === true ? true : false}
			/>

			{readAreaUnit === true && (
				<TableComponent
					tableData={areaUnitData.data}
					tableLoading={areaUnitData.loading}
					openModal={onEditIconClick}
				/>
			)}

			{readAreaUnit === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			<AreaUnitModal
				initialValues={selectedAreaUnit}
				type={currentEditType}
				onFinish={onFinish}
				onCancel={onCancelClick}
				openModal={openModal}
				buttonLoading={addAreaUnitData.loading || editAreaUnitData.loading}
			/>
		</SiteSettingsTemplate>
	);
}
export default AreaUnitSettings;
