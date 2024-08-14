import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SystemModulePermissionModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSearchParams } from "react-router-dom";
import { Empty, message, Select } from "antd";
import { SystemModulesModule } from "../../../../Modules/SystemModules";
import { SystemModulesType } from "../../../../Modules/SystemModules/types";
import { PermissionPermissionsEnum } from "../../../../Modules/Permissions/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
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
		isLink: true,
		text: "System Modules",
		path: "/siteSettings/system-modules",
	},
	{
		isLink: false,
		text: "System Modules Permissions",
	},
];

function SystemModulePermissionSiteSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PermissionPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PermissionPermissionsEnum]: boolean };
	const { readPermissions, createPermissions, updatePermissions } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const systemModule = new SystemModulesModule();
	const [searchParams, setSearchParams] = useSearchParams();
	let moduleId = Number(searchParams.get('moduleId'))

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [systemModuleData, setSystemModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [moduleItem, setModuleItem] = useState<Array<any>>([])

	// event handle  to open and close modal
	const handleClick = () => {
		if (createPermissions === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: SystemModulesType) => {
		if (updatePermissions === false) {
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
		systemModule.getRecordById(moduleId).then((res) => {
			setModuleData({ ...moduleData, ...res.data });
		}).catch((err) => { });
	};

	const getPermissionData = () => {
		setSystemModuleData({ ...systemModuleData, loading: true });
		systemModule.getAllRecords().then((res) => {
			setModuleItem(res.data?.data);
			setSystemModuleData(res.data);
		}).catch((err) => { });
	}

	useEffect(() => {
		getPermissionData();
	}, []);

	useEffect(() => {
		reloadTableData();
	}, [moduleId]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="System Module Of"
				buttonText="Add New Permission"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPermissions === true ? true : false}
			>
				<div>
					<Select
						onChange={(value) => setSearchParams({ moduleId: value.toString() })}
						className="w-200"
						defaultValue={moduleId}
						placeholder="Choose module"
						loading={systemModuleData.loading}
						showSearch
						optionFilterProp="label"
						options={moduleItem?.map((ele: any) => {
							return {
								label: ele.name,
								value: ele.id
							}
						})}
					/>
				</div>
			</PageHeader>
			{(!moduleId) ? (
				<Empty
					image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
					imageStyle={{
						height: 150,
					}}
					description={
						<span>
							Please select system module
						</span>
					}
				/>
			) : (
				<>
					{readPermissions === true && (
						<TableComponent
							tableData={moduleData?.data?.Permissions}
							tableLoading={moduleData.loading}
							onEditIconClick={onEditIconClick}
							reloadTableData={reloadTableData}
						/>
					)}
					{/* <Pagination
						total={moduleData?.meta?.total}
						current={moduleData?.meta?.page}
						defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
						pageSizeOptions={[10, 20, 50, 100]}
						onChange={onPaginationChange}
					/> */}
					{readPermissions === false && (
						<ErrorCode403
							mainMessage="You don't have permission to view this data"
						/>
					)}
					{currentEditType.openModal && (
						<SystemModulePermissionModal
							record={currentEditType.recordId}
							type={currentEditType.editType}
							reloadTableData={reloadTableData}
							onCancel={handleClick}
							openModal={currentEditType.openModal}
							permissions={permissions}
						/>
					)}
				</>
			)}
		</SiteSettingsTemplate>
	);
}
export default SystemModulePermissionSiteSettings;
