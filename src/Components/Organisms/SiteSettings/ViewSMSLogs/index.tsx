import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import styles from '../../Common/styles.module.scss';
import { SMSLogsResponseObject } from "../../../../Modules/SMS/types";
import { SMSModule } from "../../../../Modules/SMS";
import { convertDate } from "../../../../helpers/dateHandler";
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
		text: "SMS Logs",
	},
];

type SelectedFiltersTypes = {
	message: string;
	userId: number;
	gateway: string;
	number: string;
	status: string;
	dateRange?: string[];
}

const SiteSMSLogs = () => {
	const [moduleData, setModuleData] = useState<Partial<SMSLogsResponseObject>>({
		loading: false,
		data: [],
	});

	const module = useMemo(() => new SMSModule(), []);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		message: '',
		userId: 0,
		gateway: '',
		number: '',
		status: '',
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "userId" || name === "number") {
			const isValidNumber = isNumber(value);

			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "userId": {
						label = "User ID";
						break;
					}
					case "number": {
						label = "Phone Number";
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
		module.getLogs().then((res) => {
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
			status: selectedFilters?.status || undefined,
			message: selectedFilters?.message || undefined,
			userId: selectedFilters?.userId || undefined,
			gateway: selectedFilters?.gateway || undefined,
			number: selectedFilters?.number || undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		module.getLogs(data).then((res) => {
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
			status: selectedFilters?.status || undefined,
			message: selectedFilters?.message || undefined,
			userId: selectedFilters?.userId || undefined,
			gateway: selectedFilters?.gateway || undefined,
			number: selectedFilters?.number || undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		module.getLogs(params).then((res) => {
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
				heading="SMS Logs"
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
								label="Gateway"
								name="gateway"
								value={selectedFilters?.gateway ? String(selectedFilters?.gateway) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, gateway: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Number"
								name="number"
								value={selectedFilters?.number ? String(selectedFilters?.number) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, number: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Message"
								name="message"
								value={selectedFilters?.message ? String(selectedFilters?.message) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, message: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							{/**TODO: Change this filter to use sms status enum */}
							<CustomFilter
								type="input"
								label="Status"
								name="status"
								value={selectedFilters?.status ? String(selectedFilters?.status) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, status: "" })
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

export default SiteSMSLogs;
