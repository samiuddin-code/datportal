import { useEffect, useState } from "react";
import { CompanyAssetModal } from "./modal";
import TableComponent from "./table-columns";
import { CompanyAssetType } from "../../../../Modules/CompanyAsset/types";
import { CustomFilter, PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Input, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { CompanyAssetPermissionsEnum } from "../../../../Modules/CompanyAsset/permissions";
import { CompanyAssetModule } from "../../../../Modules/CompanyAsset";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { CompanyAssetTypeEnum } from "@helpers/commonEnums";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import { useDebounce } from "@helpers/useDebounce";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Company Assets",
	},
];

function CompanyAssets() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(CompanyAssetPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CompanyAssetPermissionsEnum]: boolean };
	const { readCompanyAsset, createCompanyAsset, updateCompanyAsset } = permissions;
	const [filters, setFilters] = useState<{ code?: string, type?: CompanyAssetTypeEnum, assetName?: string, page: number, perPage: number }>({
		code: undefined,
		assetName: undefined,
		type: undefined,
		page: 1,
		perPage: 10
	})

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const debouncedName = useDebounce(filters.assetName, 500);
	useEffect(() => {
		onRefresh(filters)
	}, [debouncedName])

	const module = new CompanyAssetModule();

	const { data, onRefresh, setData, loading, meta } = useFetchData<CompanyAssetType[]>({
		method: module.getAllRecords,
		initialQuery: { ...filters }
	});

	const onCancelClick = () => {
		if (createCompanyAsset === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: CompanyAssetType) => {
		if (updateCompanyAsset === false) {
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
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="Company Assets"
				buttonText="Add Asset"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createCompanyAsset === true ? true : false}
				filters={
					<div >
						<div>
							<Input
								type="input"
								placeholder="Asset Name"
								name="assetName"
								onChange={(event) => {
									const _temp = { ...filters, assetName: event.target.value };
									setFilters(_temp);
								}}
								value={filters.assetName}
								allowClear
								style={{
									border: '1.5px solid var(--color-border)',
									borderRadius: '0.25rem'
								}}
								prefix={<img style={{ padding: '0rem 0.5rem' }} src="/images/searchIcon.svg" alt="" />}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Code"
								name="code"
								withSearch={false}
								onChange={(event) => {
									const _temp = { ...filters, code: event.target.value };
									setFilters(_temp);
								}}
								value={filters.code}
								onReset={() => {
									const _temp = { ...filters, code: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Type"
								name="type"
								withSearch={false}
								options={Object.entries(CompanyAssetTypeEnum).map(([key, value]) => {
									return {
										label: capitalize(key?.replaceAll("_", " ")),
										value: value,
									}
								})}
								onChange={(event) => {
									const _temp = { ...filters, type: event.target.value };
									setFilters(_temp);
								}}
								value={filters.type}
								onReset={() => {
									const _temp = { ...filters, type: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
					</div>
				}
			/>
			{readCompanyAsset === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readCompanyAsset === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<CompanyAssetModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => onRefresh()}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</Layout>
	);
}
export default CompanyAssets;
