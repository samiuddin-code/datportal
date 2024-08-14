import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BiometricModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomFilter, PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Button, Empty, Select, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { useDebounce } from "@helpers/useDebounce";
import { BiometricsEntryType } from "@helpers/commonEnums";
import { BiometricsPermissionSet } from "@modules/Biometrics/permissions";
import { BiometricModule } from "@modules/Biometrics";
import { BiometricType } from "@modules/Biometrics/types";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { BulkUploadJobPermissionsEnum } from "@modules/BulkUploadFormat/Job/permissions";
import { OrganizationModule } from "@modules/Organization";
import { OrganizationType } from "@modules/Organization/types";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Biometrics",
	},
];

function Biometrics() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(BiometricsPermissionSet)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BiometricsPermissionSet]: boolean };
	const bulkUploadPermissions = userPermissions as { [key in BulkUploadJobPermissionsEnum]: boolean };
	const organizationModule = new OrganizationModule();
	const { readBiometrics, createBiometrics, updateBiometrics, readAllBiometrics } = permissions;
	const { createBiometricsJob } = bulkUploadPermissions

	const [filters, setFilters] = useState<{ mode?: string, type?: number, fromDate?: string, toDate?: string, userId?: number, page: number, perPage: number,organizationId?: number }>({
		mode: undefined,
		type: undefined,
		fromDate: undefined,
		toDate: undefined,
		userId: undefined,
		organizationId: undefined,
		page: 1,
		perPage: 25
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

	const module = new BiometricModule();

	const { data, onRefresh, setData, loading, meta } = useFetchData<BiometricType[]>({
		method: module.getAllRecords,
		initialQuery: filters
	});

	const { data : organization, onRefresh : refreshOrganization} = useFetchData<OrganizationType[]>({
		method: organizationModule.findPublished,
		initialQuery: {}
	});

	console.log(organization);

	const onCancelClick = () => {
		if (createBiometrics === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};


	const onEditIconClick = (record: BiometricType) => {
		if (updateBiometrics === false) {
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
	//user search
	const [searchTermUser, setSearchTermUser] = useState("");
	const debouncedSearchTermUser = useDebounce(searchTermUser, 500);
	const [users, setUsers] = useState<UserTypes[]>([]);
	const userModule = useMemo(() => new UserModule(), []);
	const onUserSearch = useCallback(() => {
		if (debouncedSearchTermUser) {
			userModule.getAllRecords({ name: debouncedSearchTermUser }).then((res) => {
				setUsers((prev) => {
					// if the data is already present in the state, then don't add it again
					const filteredData = res?.data?.data?.filter((item: UserTypes) => {
						return !prev?.find((prevItem) => prevItem.id === item.id);
					});
					// add the new data to the existing data
					return [...prev, ...filteredData];
				})
			}).catch((err) => {
				message.error(err.response.data.message)
			})
		}
	}, [debouncedSearchTermUser])
	useEffect(() => {
		onUserSearch()
	}, [onUserSearch])

	return (
		<Layout
			permissionSlug={[...permissionSlug, BulkUploadJobPermissionsEnum.CREATE]}>
			<PageHeader
				heading="Biometrics"
				buttonText="Add Biometric"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createBiometrics === true ? true : false}
				excelExport={
					createBiometricsJob && <Button
						href={'/biometrics/bulk-upload-job?openModal=true'}
						style={{
							background: 'var(--color-light)',
							border: 'none',
							height: '2.25rem',
							borderRadius: '0.25rem',
							marginRight: '0.5rem',
							display: 'flex',
							alignItems: 'center',
						}}>Bulk Upload</Button>}
				filters={
					<div >
						{readAllBiometrics && <div>
							<Select
								allowClear
								placeholder="Search for the employee"
								className="selectAntdCustom"
								onChange={(value) => {
									const _temp = { ...filters, userId: value };
									setFilters(_temp)
									onRefresh(_temp)
								}}

								value={filters.userId ? filters.userId : undefined}
								showSearch
								onSearch={(value) => setSearchTermUser(value)}
								optionFilterProp="label"
								options={users?.map((item) => {
									return {
										label: item.firstName + " " + item.lastName,
										value: item.id,
									}
								})}
								notFoundContent={
									<Empty
										image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
										imageStyle={{
											height: 100,
										}}
										description={
											<span>
												No data found, Please search for the employee
											</span>
										}
									/>
								}
							/>
						</div>}
						<div>
							<CustomFilter
								type="radio"
								label="Type"
								name="type"
								withSearch={false}
								options={Object.entries(BiometricsEntryType).map(([key, value]) => {
									return {
										label: capitalize(key),
										value: value,
									}
								})}
								onChange={(event) => {
									const _temp = { ...filters, type: Number(event.target.value) };
									setFilters(_temp);
								}}
								value={filters.type?.toString()}
								onReset={() => {
									const _temp = { ...filters, type: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="datepicker"
								label="Date"
								name="dateRange"
								onChange={(values: any) => {
									const _temp = {
										...filters,
										fromDate: values ? values[0]?._d?.toISOString().substring(0, 10) : undefined,
										toDate: values ? values[1]?._d?.toISOString().substring(0, 10) : undefined
									}
									setFilters(_temp);
								}}
								onReset={() => {
									const _temp = {
										...filters,
										fromDate: undefined,
										toDate: undefined
									}
									setFilters(_temp);
									onRefresh(_temp)
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Mode"
								name="mode"
								withSearch={false}
								options={[{
									label: "Check In",
									value: "in"
								}, {
									label: "Check Out",
									value: "out"
								}]}
								onChange={(event) => {
									const _temp = { ...filters, mode: (event.target.value) };
									setFilters(_temp);
								}}
								value={filters.mode}
								onReset={() => {
									const _temp = { ...filters, mode: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Organization"
								name="organizationId"
								withSearch={false}
								options={organization ? organization?.map((ele) => {
									return {
										label: ele.name,
										value: String(ele.id)
									}
								}) : []}
								onChange={(event) => {
									const _temp = { ...filters, organizationId: (event.target.value) };
									setFilters(_temp);
								}}
								value={String(filters.organizationId)}
								onReset={() => {
									const _temp = { ...filters, organizationId: undefined };
									setFilters(_temp);
									onRefresh(_temp);
								}}
								onUpdate={() => onRefresh(filters)}
							/>
						</div>
					</div>
				}
			/>
			{readBiometrics === true && (
				<TableComponent
					tableData={data!}
					tableLoading={loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={onRefresh}
					meta={meta}
					filters={filters}
				/>
			)}
			{readBiometrics === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<BiometricModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={onRefresh}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</Layout>
	);
}
export default Biometrics;
