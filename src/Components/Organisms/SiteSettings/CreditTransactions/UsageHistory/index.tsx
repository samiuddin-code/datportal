import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../../Atoms";
import { Empty, message } from "antd";
import Skeletons from "../../../Skeletons";
import Layout from "../../../../Templates/Layout";
import TableComponent from "./table-columns";
import { TransactionsPermissionsEnum } from "../../../../../Modules/Transactions/permissions";
import { OrganizationModule } from "../../../../../Modules/Organization";
import styles from '../../../Common/styles.module.scss'
// import { CreditsTransactionTypeString } from "../../../../../helpers/commonEnums";
import { convertDate } from "../../../../../helpers/dateHandler";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../../helpers/common";
import SiteSettingsTemplate from "../../../../Templates/SiteSettings";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		text: "Site Settings",
		isLink: true,
		path: "/siteSettings",
	},
	{
		isLink: false,
		text: "Credit Usage History",
	},
];

type SelectedFiltersTypes = {
	transactionsType: string;
	dateRange: string[];
	userId: number;
	propertyId: number;
	organizationId: number;
	propertyType: string;
}

const SiteCreditsUsageHistory = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(TransactionsPermissionsEnum)
	//const { userPermissions } = useSelector((state: RootState) => state.usersReducer);

	const [moduleData, setModuleData] = useState<Partial<any>>({
		loading: false,
		data: [],
	});

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		transactionsType: "",
		dateRange: [""],
		userId: 0,
		propertyId: 0,
		organizationId: 0,
		propertyType: "",
	});
	const [reset, setReset] = useState<boolean>(false);

	const propType = [
		{
			label: "Residential For Sale",
			value: "residential-for-sale"
		},
		{
			label: "Residential For Rent",
			value: "residential-for-rent"
		},
		{
			label: "Commercial For Sale",
			value: "commercial-for-sale"
		},
		{
			label: "Commercial For Rent",
			value: "commercial-for-rent"
		},
	]

	const organizationModule = useMemo(() => new OrganizationModule(), []);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "userId" || name === "propertyId" || name === "organizationId") {
			const isValidNumber = isNumber(value)
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "userId": {
						label = "User ID";
						break;
					}
					case "propertyId": {
						label = "Property ID";
						break;
					}
					case "organizationId": {
						label = "Organization ID";
						break;
					}
				}
				return message.error(`${label} should be a number`);
			}
		}

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		// organizationModule.getCreditHistory(query).then((res) => {
		// 	setModuleData({ ...res.data, loading: false });
		// }).catch((err) => {
		// 	setModuleData({ ...moduleData, loading: false });
		// });
	}, [organizationModule, moduleData]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			transactionsType: selectedFilters.transactionsType ? selectedFilters.transactionsType : undefined,
			userId: Number(selectedFilters.userId) > 0 ? Number(selectedFilters.userId) : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
			propertyType: selectedFilters.propertyType ? selectedFilters.propertyType : undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		reloadTableData(data);
	}, [selectedFilters])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page: page,
			perPage: pageSize,
			transactionsType: selectedFilters.transactionsType ? selectedFilters.transactionsType : undefined,
			userId: Number(selectedFilters.userId) > 0 ? Number(selectedFilters.userId) : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
			propertyType: selectedFilters.propertyType ? selectedFilters.propertyType : undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		reloadTableData(params);
	}, [selectedFilters]);


	useEffect(() => {
		reloadTableData({ perPage: 10 });
	}, []);

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

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Credits Usage History"
				breadCrumbData={breadCrumbsData}
				filters={
					<div className={styles.filterWrapper}>
						<div>
							<CustomFilter
								type="radio"
								label="Transaction Type"
								name="transactionsType"
								options={Object.entries([]).map(([key, value]) => ({
									label: capitalize(key),
									value: value,
								}))}
								value={String(selectedFilters?.transactionsType)}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, transactionsType: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Organization ID"
								name="organizationId"
								value={selectedFilters?.organizationId > 0 ? String(selectedFilters?.organizationId) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, organizationId: 0 })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="User ID"
								name="userId"
								value={selectedFilters?.userId > 0 ? String(selectedFilters?.userId) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, userId: 0 })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Property ID"
								name="propertyId"
								value={selectedFilters?.propertyId > 0 ? String(selectedFilters?.propertyId) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, propertyId: 0 })
								}}
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
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, dateRange: [] })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Property Type"
								name="propertyType"
								options={propType.map((item) => ({
									label: item.label,
									value: item.value,
								}))}
								value={selectedFilters?.propertyType}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, propertyType: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
					</div>
				}
			/>

			{moduleData.loading ? (
				<Skeletons items={5} fullWidth />
			) : (
				<>
					<div className={styles.antdTableWrapper}>
						<TableComponent
							tableData={moduleData?.data}
							tableLoading={moduleData?.loading}
							emptyText={
								<Empty
									image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
									imageStyle={{
										height: 200,
									}}
									description={
										<span>
											No credits usage history found
										</span>
									}
								>
								</Empty>
							}
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
		</SiteSettingsTemplate>
	);
};

export default SiteCreditsUsageHistory;
