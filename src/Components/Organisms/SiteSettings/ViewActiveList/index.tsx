import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import styles from '../../Common/styles.module.scss';
import { ActiveUserResponseObject } from "../../../../Modules/User/types";
import { UserModule } from "../../../../Modules/User";
import { convertDate } from "../../../../helpers/dateHandler";
import { TokenTypes } from "../../../../helpers/commonEnums";
import { isNumber } from "../../../../helpers/common";
import { message } from "antd";

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
		text: "Active Users",
	},
];

type SelectedFiltersTypes = {
	userId: number;
	organizationId: number;
	userAgent: string;
	userIP: string;
	tokenType: string;
	dateRange?: string[];
}

const SiteSMSLogs = () => {
	const [moduleData, setModuleData] = useState<Partial<ActiveUserResponseObject>>({
		loading: false,
		data: [],
	});

	const module = useMemo(() => new UserModule(), []);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		userId: 0,
		organizationId: 0,
		userAgent: '',
		userIP: '',
		tokenType: '',
		dateRange: [],
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "userId" || name === "organizationId") {
			const isValidNumber = isNumber(value);
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "userId": {
						label = "User Id";
						break;
					}
					case "organizationId": {
						label = "Organization Id";
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

	const getModuleData = useCallback(async (query?: any) => {
		setModuleData({ loading: true });
		module.getActiveUsers(query).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		});
	}, [module]);

	useEffect(() => {
		getModuleData();
	}, [getModuleData]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			userId: selectedFilters.userId || undefined,
			organizationId: selectedFilters.organizationId || undefined,
			userAgent: selectedFilters.userAgent || undefined,
			userIP: selectedFilters.userIP || undefined,
			tokenType: selectedFilters.tokenType || undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		getModuleData(data);
	}, [selectedFilters, module])

	const onReset = useCallback((name: string, value: number | string | string[]) => {
		if (name) {
			setReset(true);
			setSelectedFilters({ ...selectedFilters, [name]: value });
		}
	}, [selectedFilters]);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page: page,
			perPage: pageSize,
			userId: selectedFilters.userId || undefined,
			organizationId: selectedFilters.organizationId || undefined,
			userAgent: selectedFilters.userAgent || undefined,
			userIP: selectedFilters.userIP || undefined,
			tokenType: selectedFilters.tokenType || undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		// get the data from the api
		getModuleData(params);
	}, [module, selectedFilters, moduleData]);

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
		<SiteSettingsTemplate>
			<PageHeader
				heading="Active Users"
				breadCrumbData={breadCrumbsData}
				filters={
					<div>
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
						<div>
							<CustomFilter
								type="input"
								label="User ID"
								name="userId"
								value={selectedFilters?.userId ? String(selectedFilters?.userId) : ""}
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
								label="Organization ID"
								name="organizationId"
								value={selectedFilters?.organizationId ? String(selectedFilters?.organizationId) : ""}
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
								label="User Agent"
								name="userAgent"
								value={selectedFilters?.userAgent ? String(selectedFilters?.userAgent) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, userAgent: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="User IP"
								name="userIP"
								value={selectedFilters?.userIP ? String(selectedFilters?.userIP) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, userIP: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Token Type"
								name="tokenType"
								value={selectedFilters?.tokenType ? String(selectedFilters?.tokenType) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, tokenType: "" })
								}}
								onUpdate={onUpdate}
								options={Object.entries(TokenTypes).map(([key, value]) => {
									return {
										label: value,
										value: key
									}
								})}
							/>
						</div>
					</div>
				}
			/>
			<div className={styles.antdTableWrapper}>
				<TableComponent
					tableData={moduleData?.data}
					tableLoading={moduleData.loading}
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

export default SiteSMSLogs;
