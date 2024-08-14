import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import {
	addSystemModuleDataAction,
	editSystemModuleDataAction,
	getSystemModulesData,
} from "../../../../Redux/Reducers/SystemModulesReducer/action";
import { RootState } from "../../../../Redux/store";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SystemModulesModal } from "./modal";
import TableComponent from "./table-columns";
import { SystemModule } from "../../../../Redux/Reducers/SystemModulesReducer/types";
import { CustomInput, PageHeader } from "../../../Atoms";
import { SystemModulesType, SystemModuleVisibility } from "../../../../Modules/SystemModules/types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { SystemModulesPermissionsEnum } from "../../../../Modules/SystemModules/permissions";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PermissionPermissionsEnum } from "../../../../Modules/Permissions/permissions";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/"
	},
	{
		isLink: true,
		text: "Site Settings",
		path: "/siteSettings",
	},
	{
		isLink: false,
		text: "System Modules",
	},
];

function SystemModulesSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(SystemModulesPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in SystemModulesPermissionsEnum]: boolean };
	const { readSystemModules, createSystemModules, updateSystemModules } = permissions;

	const dispatch = useDispatch<dispatchType>();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [currentEditType, setcurrentEditType] = useState<string>("new");
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	/** default selected values for editing the data */
	const defaultEditData = useMemo<SystemModule>(() => ({
		id: 0,
		name: "",
		slug: "",
		icon: "",
		isMenuItem: true,
		order: 0,
		url: "",
		description: "",
		visibility: SystemModuleVisibility.Organization,
	}), []);

	const [selectedSystemModule, setSelectedSystemModule] = useState<SystemModule>(defaultEditData);

	const {
		systemModulesData, addSystemModuleData, editSystemModuleData
	} = useSelector((state: RootState) => state.systemModulesReducer);

	const [searchResult, setSearchResult] = useState<Partial<SystemModulesType[]>>();

	useEffect(() => {
		dispatch(getSystemModulesData());
	}, [dispatch]);

	const onCancelClick = useCallback(() => {
		if (createSystemModules === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType("new");
		setOpenModal(!openModal);
		setSelectedSystemModule(defaultEditData);
	}, [openModal, defaultEditData]);

	const onEditIconClick = useCallback((record: any) => {
		if (updateSystemModules === false) {
			message.error("You don't have permission to update this record");
			return;
		}
		setSelectedSystemModule(record);
		setcurrentEditType("edit");
		setOpenModal(!openModal);
	}, [openModal]);

	const onFinish = useCallback((obj: any) => {
		const _formData = new FormData();
		const excludeFields = ["icon"];
		Object.entries(obj).forEach((ele: any) => {
			if (!excludeFields.includes(ele[0])) {
				_formData.append(ele[0], ele[1]);
			}
		});

		if (obj["icon"] && typeof obj["icon"] !== "string") {
			_formData.append("icon", obj["icon"]["fileList"][0]["originFileObj"]);
		}

		switch (currentEditType) {
			case "new": {
				if (createSystemModules === true) {
					dispatch(
						addSystemModuleDataAction(_formData, () => {
							dispatch(getSystemModulesData());
							onCancelClick();
						})
					);
				} else {
					message.error("You don't have permission to create new system module");
				}
				break;
			}
			case "edit": {
				if (updateSystemModules === true) {
					dispatch(
						editSystemModuleDataAction(_formData, selectedSystemModule, () => {
							dispatch(getSystemModulesData());
							onCancelClick();
						})
					)
				} else {
					message.error("You don't have permission to update this system module");
				}
				break;
			}
		}
	}, [currentEditType, dispatch, onCancelClick, selectedSystemModule]);

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// Search functionality for the table
	const assignSearchResult = useCallback(() => {
		if (debouncedSearchTerm) {
			const data = systemModulesData.data as SystemModulesType[];
			const result = data.filter((ele) => {
				return ele.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			});
			setSearchResult(result);
		} else {
			setSearchResult(undefined);
		}
	}, [debouncedSearchTerm, systemModulesData?.data]);

	useEffect(() => {
		assignSearchResult();
	}, [assignSearchResult]);

	return (
		<SiteSettingsTemplate
			permissionSlug={[
				...permissionSlug,
				PermissionPermissionsEnum.READ
			]}
		>
			<PageHeader
				heading="System Modules"
				buttonText="Add New Module"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createSystemModules === true ? true : false}
				filters={
					readSystemModules === true ? (
						<div>
							<div>
								<CustomInput
									placeHolder='Search...'
									icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
									size="w100"
									className='py-1'
									value={searchTerm}
									onChange={onSearch}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readSystemModules === true && (
				<TableComponent
					tableData={searchResult || systemModulesData.data}
					tableLoading={systemModulesData.loading}
					openModal={onEditIconClick}
				/>
			)}
			{readSystemModules === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			<SystemModulesModal
				initialValues={selectedSystemModule}
				type={currentEditType}
				onFinish={onFinish}
				onCancel={onCancelClick}
				openModal={openModal}
				buttonLoading={addSystemModuleData.loading || editSystemModuleData.loading}
			/>
		</SiteSettingsTemplate>
	);
}
export default SystemModulesSettings;
