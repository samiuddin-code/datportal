import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import styles from "../../SiteSettings/Common/styles.module.scss";
import TableComponent from "./table-columns";
// import { TransactionsListingResponseObject } from "../../../../Modules/Transactions/types";
import { TransactionsModule } from "../../../../Modules/Transactions";
import { TransactionsPermissionsEnum } from "../../../../Modules/Transactions/permissions";
import { TransactionTypeString } from "../../../../helpers/commonEnums";
import { convertDate } from "../../../../helpers/dateHandler";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../helpers/common";
import { message } from "antd";

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
		text: "Transactions",
	},
];

type SelectedFiltersTypes = {
	dateRange?: string[];
	status: number;
	transactionType: number;
	organizationId: number | string;
}

const SiteTransactions = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(TransactionsPermissionsEnum)
	//const { userPermissions } = useSelector((state: RootState) => state.usersReducer);

	const [moduleData, setModuleData] = useState<any>({
		loading: false,
		data: [],
	});

	const transactionModule = useMemo(() => new TransactionsModule(), []);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		status: 0,
		transactionType: 0,
		dateRange: [""],
		organizationId: "",
	});

	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "organizationId") {
			const isValidNumber = isNumber(value);

			if (!isValidNumber) {
				return message.error("Organization ID should be a number")
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
		transactionModule.getAllRecords({ ...query, onlyGovernmentFees: true }).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ ...moduleData, loading: false });
		});
	}, [moduleData]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			transactionType: selectedFilters.transactionType ? selectedFilters.transactionType : undefined,
			status: selectedFilters.status ? selectedFilters.status : undefined,
			organizationId: selectedFilters.organizationId ? selectedFilters.organizationId : undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		reloadTableData(data);
	}, [selectedFilters])

	const getModuleData = useCallback(() => {
		setModuleData({ loading: true });
		setSelectedFilters({
			...selectedFilters,
			dateRange: [""]
		});

		reloadTableData();
	}, [selectedFilters]);

	useEffect(() => {
		getModuleData();
	}, []);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page,
			perPage: pageSize,
			status: selectedFilters.status ? selectedFilters.status : undefined,
			transactionType: selectedFilters.transactionType ? selectedFilters.transactionType : undefined,
			organizationId: selectedFilters.organizationId ? selectedFilters.organizationId : undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		reloadTableData(params);
	}, [selectedFilters]);

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
				heading="Transactions"
				breadCrumbData={breadCrumbsData}
				filters={
					<div>
						<div>
							<CustomFilter
								type="radio"
								label="Status"
								name="status"
								options={[]}
								value={selectedFilters?.status > 0 ? String(selectedFilters?.status) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, status: 0 })
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
								label="Transaction Type"
								name="transactionType"
								options={Object.entries(TransactionTypeString).map(([key, value]) => ({
									label: capitalize(key),
									value: value,
								}))}
								value={selectedFilters?.transactionType ? String(selectedFilters?.transactionType) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, transactionType: 0 })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Organization ID"
								name="organizationId"
								value={String(selectedFilters?.organizationId)}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, organizationId: 0 })
								}}
								onUpdate={onUpdate}
							/>
						</div>
					</div>
				}

			/>

			<div className={styles.antdTableWrapper}>
				<TableComponent
					tableData={moduleData?.data}
					tableLoading={moduleData?.loading}
				/>
			</div>
			<Pagination
				total={moduleData?.meta?.total!}
				current={moduleData?.meta?.page!}
				defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
				pageSizeOptions={[10, 20, 50, 100]}
				onChange={onPaginationChange}
			/>
		</SiteSettingsTemplate>
	);
};

export default SiteTransactions;
