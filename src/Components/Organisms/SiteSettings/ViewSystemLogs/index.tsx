import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import styles from '../../Common/styles.module.scss';
import { convertDate } from "../../../../helpers/dateHandler";
import { DefaultModule } from "../../../../Modules/Default";
import { SystemLogsResponseObject } from "../../../../Modules/Default/system-logs-types";
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
		text: "System Logs",
	},
];

type SelectedFiltersTypes = {
	table: string;
	tableColumnKey: string;
	tableColumnValue: string;
	organizationId: number;
	addedById: number;
	dateRange?: string[];
}

const SystemLogs = () => {
	const [moduleData, setModuleData] = useState<Partial<SystemLogsResponseObject>>({
		loading: false,
		data: [],
	});

	const module = useMemo(() => new DefaultModule(), []);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		table: '',
		tableColumnKey: '',
		tableColumnValue: '',
		organizationId: 0,
		addedById: 0,
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "organizationId" || name === "addedById") {
			const isValidNumber = isNumber(value);
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "organizationId": {
						label = "Organization ID";
						break;
					}
					case "addedById": {
						label = "User ID";
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

	const getModuleData = useCallback(async () => {
		setModuleData({ loading: true });
		module.getSystemLogs().then((res) => {
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
			table: selectedFilters.table || undefined,
			tableColumnKey: selectedFilters.tableColumnKey || undefined,
			tableColumnValue: selectedFilters.tableColumnValue || undefined,
			organizationId: selectedFilters.organizationId > 0 ? selectedFilters.organizationId : undefined,
			addedById: selectedFilters.addedById > 0 ? selectedFilters.addedById : undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		module.getSystemLogs(data).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		})
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
			table: selectedFilters.table || undefined,
			tableColumnKey: selectedFilters.tableColumnKey || undefined,
			tableColumnValue: selectedFilters.tableColumnValue || undefined,
			organizationId: selectedFilters.organizationId > 0 ? selectedFilters.organizationId : undefined,
			addedById: selectedFilters.addedById > 0 ? selectedFilters.addedById : undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		module.getSystemLogs(params).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		});
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
				heading="System Logs"
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
								label="Table"
								name="table"
								value={selectedFilters?.table ? String(selectedFilters?.table) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, table: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Table Column Key"
								name="tableColumnKey"
								value={selectedFilters?.tableColumnKey ? String(selectedFilters?.tableColumnKey) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, tableColumnKey: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Table Column Value"
								name="tableColumnValue"
								value={selectedFilters?.tableColumnValue ? String(selectedFilters?.tableColumnValue) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, tableColumnValue: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Organization Id"
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
								label="User Id"
								name="addedById"
								value={selectedFilters?.addedById ? String(selectedFilters?.addedById) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, addedById: 0 })
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

export default SystemLogs;
