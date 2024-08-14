import { useEffect, useState } from "react";
import { PageHeader } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import Filters from "./filters";
import { OrganizationModal } from "./organizationModal";
import TableComponent from "./tableColumns";
import styles from '../../Common/styles.module.scss'
import { OrgPermissionsEnum } from "../../../../Modules/Organization/permissions";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { OrganizationModule } from "@modules/Organization";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { OrganizationType } from "@modules/Organization/types";
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
		text: "Organization Settings",
	},
];

function OrganizationSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(OrgPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in OrgPermissionsEnum]: boolean };
	const { readAllOrganization, createOrganization, updateOrganization } = permissions;
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});
	const module = new OrganizationModule();
	const [filters, setFilters] = useState({
		page: 1,
		perPage: 10
	});

	const { data, onRefresh, setData, loading, meta } = useFetchData<OrganizationType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});
	const onCancelClick = () => {
		if (createOrganization === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: OrganizationType) => {
		if (updateOrganization === false) {
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
		<SiteSettingsTemplate permissionSlug={[...permissionSlug, "topupCredits"]}>
			<PageHeader
				heading={"Organizations"}
				buttonText="New Organization"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createOrganization === true ? true : false}
			/>
			{readAllOrganization === true && (
				<div className={styles.antdTableWrapper}>
					<TableComponent
						tableData={data!}
						tableLoading={loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={onRefresh}
						meta={meta}
						filters={filters}
					/>
				</div>
			)}
			{readAllOrganization === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			<OrganizationModal
				record={currentEditType.recordId}
				type={currentEditType.editType}
				reloadTableData={onRefresh}
				onCancel={onCancelClick}
				openModal={currentEditType.openModal}
				permissions={permissions}
			/>
		</SiteSettingsTemplate>
	);
}
export default OrganizationSettings;
