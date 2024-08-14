import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { AuthoritiesModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { AuthoritiesPermissionsEnum } from "../../../../Modules/Authorities/permissions";
import { AuthoritiesModule } from "../../../../Modules/Authorities";
import { AuthoritiesType } from "../../../../Modules/Authorities/types";
import { useFetchData } from "hooks";
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
		text: "Authorities",
	},
];

function Authorities() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(AuthoritiesPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AuthoritiesPermissionsEnum]: boolean };
	const { readAuthorities, createAuthorities, updateAuthorities } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new AuthoritiesModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<AuthoritiesType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});


	const onCancelClick = () => {
		if (createAuthorities === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: AuthoritiesType) => {
		if (updateAuthorities === false) {
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
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Authorities"
				buttonText="Add Authorities"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createAuthorities === true ? true : false}
			/>
			{readAuthorities === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readAuthorities === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<AuthoritiesModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={onRefresh}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default Authorities;
