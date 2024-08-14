import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AttendanceModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { useDebounce } from "@helpers/useDebounce";
import { AttendanceEntryType } from "@helpers/commonEnums";
import { AttendancePermissionSet } from "@modules/Attendance/permissions";
import { AttendanceModule } from "@modules/Attendance";
import { AttendanceType } from "@modules/Attendance/types";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import SiteSettingsTemplate from "@templates/SiteSettings";

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
		text: "Attendance",
	},
];

function Attendance() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(AttendancePermissionSet)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AttendancePermissionSet]: boolean };
	const { readAttendance, createAttendance, updateAttendance } = permissions;
	const [filters, setFilters] = useState<{ type?: number, fromDate?: string, toDate?: string, userId?: number, perPage?: number }>({
		perPage: 25,
		type: undefined,
		fromDate: undefined,
		toDate: undefined,
		userId: undefined
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

	const module = new AttendanceModule();

	const { data, meta, onRefresh, setData, loading } = useFetchData<AttendanceType[]>({
		method: module.getAllRecords,
		initialQuery: { perPage: 25 }
	});

	const onPaginationChange = (page: number, pageSize: number) => {
		const params = {
			...filters,
			page,
			perPage: pageSize,
		};
		onRefresh(params);
	};

	const onCancelClick = () => {
		if (createAttendance === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};


	const onEditIconClick = (record: AttendanceType) => {
		if (updateAttendance === false) {
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
		<SiteSettingsTemplate
			permissionSlug={permissionSlug}>
			<PageHeader
				heading="Attendance"
				buttonText="Add Attendance"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createAttendance === true ? true : false}
				filters={
					<div >
						<div>
							<CustomFilter
								type="radio"
								label="Employee"
								name="userId"
								withSearch={true}
								options={users?.map((item) => ({
									label: item.firstName + " " + item.lastName,
									value: item.id.toString(),
								}))}
								onChange={(event) => {
									const _temp = { ...filters, userId: event.target.value };
									setFilters(_temp);
								}}
								value={filters.userId?.toString()}
								onReset={() => {
									const _temp = { ...filters, userId: undefined };
									setFilters(_temp);
									onRefresh(_temp);
									// Reset search term
									setSearchTermUser("")
								}}
								onUpdate={() => onRefresh(filters)}
								// START: For search
								// loading={clients.loading}
								searchTerm={searchTermUser}
								onSearch={(event) => setSearchTermUser(event.currentTarget.value)}
							// END: For search
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Type"
								name="type"
								withSearch={false}
								options={Object.entries(AttendanceEntryType).map(([key, value]) => {
									return {
										label: capitalize(key),
										value: value.toString(),
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
					</div>
				}
			/>
			{readAttendance === true && (
				<>
					<TableComponent
						tableData={data!}
						tableLoading={loading}
						meta={meta}
						onEditIconClick={onEditIconClick}
						reloadTableData={() => onRefresh()}
					/>
					<Pagination
						total={meta?.total!}
						current={meta?.page!}
						defaultPageSize={meta?.perPage ? meta?.perPage : 25}
						pageSizeOptions={[10, 25, 50, 100]}
						onChange={onPaginationChange}
					/>
				</>
			)}
			{readAttendance === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<AttendanceModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => onRefresh()}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default Attendance;
