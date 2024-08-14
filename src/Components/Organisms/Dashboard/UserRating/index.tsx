import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import Skeletons from "../../Skeletons";
import TableComponent from "./table-columns";
import {
	UserRatingResponseObject, UserRating_QUERY_TYPES
} from "../../../../Modules/UserRating/types";
import { UserRatingModule } from "../../../../Modules/UserRating";
import styles from '../../Common/styles.module.scss';
// import { UserRatingStatusString } from "../../../../helpers/commonEnums";
import { convertDate } from "../../../../helpers/dateHandler";
import Layout from "../../../Templates/Layout";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../helpers/common";
import { message } from "antd";
import { UserRatingPermissionsEnum } from "../../../../Modules/UserRating/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "User Ratings",
	},
];

type SelectedFiltersTypes = {
	status?: string;
	dateRange?: string[];
	propertyId?: number;
	agentId: number;
	propertyLink: string;
}

const UserRatingDashboard = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(UserRatingPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in UserRatingPermissionsEnum]: boolean };
	const { readUserRating } = permissions

	const [moduleData, setModuleData] = useState<Partial<UserRatingResponseObject>>({
		loading: false,
		data: [],
	});

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		status: "",
		dateRange: [""],
		propertyId: 0,
		agentId: 0,
		propertyLink: "",
	});

	const [reset, setReset] = useState<boolean>(false);

	const module = useMemo(() => new UserRatingModule(), []);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "agentId" || name === "propertyId") {
			const isValidNumber = isNumber(value);
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "agentId": {
						label = "Agent ID";
						break;
					}
					case "propertyId": {
						label = "Property ID";
						break;
					}
				}
				message.error(`${label} should be a number`);
				return;
			}
		}

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const onReset = useCallback((name: string, value: number | string | string[]) => {
		if (name) {
			setReset(true);
			setSelectedFilters({ ...selectedFilters, [name]: value });
		}
	}, [selectedFilters]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			status: selectedFilters.status ? selectedFilters.status : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
			propertyLink: selectedFilters.propertyLink ? selectedFilters.propertyLink : undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		module.getAllRecords(data).then((response) => {
			setModuleData({
				...moduleData,
				loading: false,
				data: response.data?.data,
				meta: response.data?.meta
			});
		});
	}, [selectedFilters, module])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page: page,
			perPage: pageSize,
			status: selectedFilters.status ? selectedFilters.status : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
			propertyLink: selectedFilters.propertyLink ? selectedFilters.propertyLink : undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		module.getAllRecords(params).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ ...moduleData, loading: false });
		});
	}, [selectedFilters, module]);

	useEffect(() => {
		if (reset) {
			onUpdate();
		}
		// after 2 seconds set reset clicked state to false
		const timer = setTimeout(() => {
			setReset(false)
		}, 2000);
		return () => clearTimeout(timer);
	}, [reset, selectedFilters, onUpdate])

	const reloadTableData = useCallback((query?: Partial<UserRating_QUERY_TYPES>) => {
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	}, [module]);

	useEffect(() => {
		setModuleData({ ...moduleData, loading: true });
		reloadTableData();
	}, []);

	const reloadTableDataWithFilters = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		reloadTableData({
			perPage: moduleData?.meta?.perPage || 10,
			page: moduleData?.meta?.page || 1,
			status: selectedFilters.status ? selectedFilters.status : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
			propertyLink: selectedFilters.propertyLink ? selectedFilters.propertyLink : undefined,
			fromDate: fromDate,
			toDate: toDate,
		})
	}, [moduleData, selectedFilters])

	//TODO: add permissions 

	return (
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="User Ratings"
				breadCrumbData={breadCrumbsData}
				filters={
					readUserRating ? (
						<div className={styles.filterWrapper}>
							<div>
								<CustomFilter
									type="radio"
									label="Status"
									name="status"
									options={[]}
									value={String(selectedFilters?.status)}
									onChange={onSelected}
									onReset={() => onReset("status", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Agent ID"
									name="agentId"
									value={selectedFilters?.agentId > 0 ? String(selectedFilters?.agentId) : ""}
									onChange={onSelected}
									onReset={() => onReset("agentId", 0)}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Property Link"
									name="propertyLink"
									value={String(selectedFilters?.propertyLink)}
									onChange={onSelected}
									onReset={() => onReset("propertyLink", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Property ID"
									name="propertyId"
									value={Number(selectedFilters?.propertyId) > 0 ? String(selectedFilters?.propertyId) : ""}
									onChange={onSelected}
									onReset={() => onReset("propertyId", 0)}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="datepicker"
									label="Date"
									name="dateRange"
									onChange={(value) => {
										setSelectedFilters({
											...selectedFilters,
											dateRange: value
										})
									}}
									onReset={() => onReset("dateRange", [])}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>

			{moduleData.loading ? (
				<Skeletons items={5} fullWidth />
			) : (
				<>
					{readUserRating === true && (
						<>
							<div className={styles.antdTableWrapper}>
								<TableComponent
									tableData={moduleData?.data}
									tableLoading={moduleData?.loading!}
									reloadTableData={reloadTableDataWithFilters}
									onEditIconClick={() => { }}
								/>
							</div>
							<Pagination
								total={moduleData?.meta?.total!}
								current={moduleData?.meta?.page!}
								defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
								pageSizeOptions={[10, 20, 50, 100]}
								onChange={onPaginationChange}
							/>
						</>
					)}
					{readUserRating === false && (
						<ErrorCode403
							mainMessage="You don't have permission to view this data"
						/>
					)}
				</>
			)}
		</Layout>
	);
};

export default UserRatingDashboard;
