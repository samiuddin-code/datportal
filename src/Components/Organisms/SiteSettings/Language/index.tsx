import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { RootState } from "../../../../Redux/store";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { LanguageModal } from "./modal";
import TableComponent from "./tableColumns";
import { Language, SET_LANGUAGE_DATA } from "../../../../Redux/Reducers/LanguageReducer/types";
import { PageHeader } from "../../../Atoms";
import { LanguageModule } from "../../../../Modules/Language";
import { message } from "antd";
import { LanguagePermissionsEnum } from "../../../../Modules/Language/permissions";
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
		text: "Language",
	},
];


function LanguageSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(LanguagePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in LanguagePermissionsEnum]: boolean };
	const { readLanguage, createLanguage, updateLanguage, } = permissions;

	const dispatch = useDispatch<dispatchType>();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [currentEditType, setcurrentEditType] = useState<string>("new");

	const module = useMemo(() => new LanguageModule(), [])

	/* prettier-ignore */
	/** default selected values for editing the data */
	const defaultEditData = useMemo<Language>(() => ({
		id: 0,
		name: "",
		code: "",
		nativeName: "",
		isPublished: false,
		isDeleted: false,
	}), [])

	const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultEditData);

	const { languageData, addLanguageData, editLanguageData, } = useSelector(
		(state: RootState) => state.languageReducer
	);

	const getLanguageData = useCallback(() => {
		dispatch({
			type: SET_LANGUAGE_DATA,
			payload: { loading: true, error: {}, data: [] },
		});
		module.getAllRecords().then((res) => {
			dispatch({
				type: SET_LANGUAGE_DATA,
				payload: { ...languageData, loading: false, data: res?.data?.data },
			});
		})
	}, [dispatch, languageData, module])

	useEffect(() => {
		getLanguageData();
	}, []);

	const onCancelClick = useCallback(() => {
		if (createLanguage === false) {
			message.error("You don't have permission to create new record, please contact your admin.");
			return;
		}
		setcurrentEditType("new");
		setOpenModal(!openModal);
		setSelectedLanguage(defaultEditData);
	}, [openModal, defaultEditData]);

	const onEditIconClick = useCallback((record: any) => {
		if (updateLanguage === false) {
			message.error("You don't have permission to update record, please contact your admin.");
			return;
		}
		setSelectedLanguage(record);
		setcurrentEditType("edit");
		setOpenModal(!openModal);
	}, [openModal]);

	const onFinish = useCallback((obj: any) => {
		const formData = obj;

		switch (currentEditType) {
			case "new": {
				if (createLanguage === true) {
					module.createRecord(formData).then((res) => {
						if (res && res.data) {
							getLanguageData()
							onCancelClick();
						}
					})
				} else {
					message.error("You don't have permission to create new record, please contact your admin.");
				}
				break;
			}
			case "edit": {
				if (updateLanguage === true) {
					module.updateRecord(formData, selectedLanguage.id).then((res) => {
						if (res && res.data) {
							getLanguageData()
							onCancelClick();
						}
					}).catch((err) => {
						message.error(err?.response?.data?.message);
					});
				} else {
					message.error("You don't have permission to update record, please contact your admin.");
				}
				break;
			}
		}
	}, [currentEditType, onCancelClick, selectedLanguage, module, getLanguageData]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading={"Language"}
				buttonText={"Add Langugage"}
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createLanguage === true ? true : false}
			/>
			{readLanguage === true && (
				<TableComponent
					tableData={languageData?.data}
					tableLoading={languageData?.loading}
					openModal={onEditIconClick}
				/>
			)}
			{readLanguage === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			<LanguageModal
				initialValues={selectedLanguage}
				type={currentEditType}
				onFinish={onFinish}
				onCancel={onCancelClick}
				openModal={openModal}
				buttonLoading={addLanguageData.loading || editLanguageData.loading}
			/>
		</SiteSettingsTemplate>
	);
}
export default LanguageSettings;
