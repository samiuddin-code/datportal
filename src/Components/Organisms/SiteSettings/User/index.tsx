import { useEffect, useState, useCallback, useMemo } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteUserModal } from "./modal";
import TableComponent from "./table-columns";
import { UserModule } from "../../../../Modules/User";
import { UserTypes } from "../../../../Modules/User/types";
import { PageHeader, Pagination } from "../../../Atoms";
import Filters from "./filters";
import { FiltersType } from "./filters/types";
import { UserRoleModal } from "./Roles/modal";
import { UserCountryAccessModal } from "./CountryAccess/modal";
import { UserPermissionsEnum } from "../../../../Modules/User/permissions";
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
		text: "Users",
	},
];

function SiteUserSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(UserPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in UserPermissionsEnum]: boolean };
	const { readUser, createUser, updateUser, addUserCountry, addUserRole } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const [editUserRoles, setEditUserRoles] = useState<{
		recordId: number;
		openModal: boolean;
		recordData?: any
	}>({
		recordId: 0,
		openModal: false,
		recordData: {}
	});

	const [editUserCountryAccess, setEditCountryAccess] = useState<{
		recordId: number;
		openModal: boolean;
		recordData?: any
	}>({
		recordId: 0,
		openModal: false,
		recordData: {}
	});

	const module = useMemo(() => new UserModule(), []);

	const [moduleData, setModuleData] = useState<any>({
		loading: false,
		error: {},
		data: [],
	});

	const [filters, setFilters] = useState<FiltersType>({});

	const onCancelClick = () => {
		if (createUser === false) {
			message.error("You don't have permission to create new user");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: UserTypes) => {
		if (updateUser === false) {
			message.error("You don't have permission to update this user");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};

	const onManageRolesClick = (record: UserTypes) => {
		if (addUserRole === false) {
			message.error("You don't have permission to manage roles for this user");
			return;
		}
		setEditUserRoles({
			...editUserRoles,
			recordId: record.id,
			recordData: record,
			openModal: true,
		});
	};

	const onCountryAccessClick = (record: UserTypes) => {
		if (addUserCountry === false) {
			message.error("You don't have permission to manage country access for this user");
			return;
		}
		setEditCountryAccess({
			...editUserCountryAccess,
			recordId: record.id,
			recordData: record,
			openModal: true,
		});
	};

	const reloadTableData = useCallback((query?: { [key: string]: any }) => {
		setModuleData({ ...moduleData, loading: true });
		let __filtersData = { ...filters };
		if (__filtersData?.fromDate) {
			let date = __filtersData?.fromDate?.format("YYYY-MM-DD");
			__filtersData.fromDate = date;
		}
		if (__filtersData?.toDate) {
			let date = __filtersData?.toDate?.format("YYYY-MM-DD");
			__filtersData.toDate = date;
		}
		let filteredData: any = {};

		Object.entries(__filtersData).map(([key, value]) => {
			return (
				<>
					{value && typeof value === "number" ? (
						filteredData[key] = value
					) : value && value.length > 0 ? (
						filteredData[key] = value
					) : null}
				</>
			)
		});

		const finalParams = {
			page: moduleData?.meta?.page,
			perPage: moduleData?.meta?.perPage,
			...filteredData,
			...query
		};

		module.getAllRecords(finalParams).then((res) => {
			setModuleData(res.data);
		}).catch((err) => {
			setModuleData({
				...moduleData,
				loading: false,
				error: err?.response?.data
			});
		});
	}, [filters, module]);

	useEffect(() => {
		reloadTableData();
	}, [reloadTableData]);

	// Pagination change
	const onPaginationChange = (page: number, pageSize: number) => reloadTableData({ page, perPage: pageSize });

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Users"
				buttonText="Add New User"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				filters={readUser === true ? <Filters filters={filters} setFilters={setFilters} /> : null}
				showAdd={createUser === true ? true : false}
			/>
			{readUser === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						onManageRolesClick={onManageRolesClick}
						onCountryAccessClick={onCountryAccessClick}
					/>
					<Pagination
						total={moduleData?.meta?.total}
						current={moduleData?.meta?.page}
						defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
						pageSizeOptions={[10, 20, 50, 100]}
						onChange={onPaginationChange}
					/>
				</>
			)}
			{readUser === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteUserModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}

			{editUserRoles.openModal && (
				<UserRoleModal
					record={editUserRoles.recordId}
					recordData={editUserRoles.recordData}
					type={"edit"}
					reloadTableData={reloadTableData}
					onCancel={() => setEditUserRoles({ ...editUserRoles, openModal: false })}
					openModal={editUserRoles.openModal}
					permissions={permissions}
				/>
			)}

			{editUserCountryAccess.openModal && (
				<UserCountryAccessModal
					record={editUserCountryAccess.recordId}
					recordData={editUserCountryAccess.recordData}
					type={"edit"}
					reloadTableData={reloadTableData}
					onCancel={() => setEditCountryAccess({ ...editUserCountryAccess, openModal: false })}
					openModal={editUserCountryAccess.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}

export default SiteUserSettings;
