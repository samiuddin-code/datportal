import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import styles from '../../Common/styles.module.scss';
import { MailLogsResponseObject } from "../../../../Modules/Default/mail-types";
import { convertDate } from "../../../../helpers/dateHandler";
import { DefaultModule } from "../../../../Modules/Default";

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
		text: "Mail Logs",
	},
];

type SelectedFiltersTypes = {
	subject: string;
	email: string;
	template: string;
	dateRange?: string[];
}

const SiteMailLogs = () => {
	const [moduleData, setModuleData] = useState<Partial<MailLogsResponseObject>>({
		loading: false,
		data: [],
	});

	const module = useMemo(() => new DefaultModule(), []);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		subject: '',
		email: '',
		template: '',
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const getModuleData = useCallback(async () => {
		setModuleData({ loading: true });
		module.getMailLogs().then((res) => {
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
			subject: selectedFilters?.subject || undefined,
			email: selectedFilters?.email || undefined,
			template: selectedFilters?.template || undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		// get the data from the api
		module.getMailLogs(data).then((res) => {
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
			subject: selectedFilters?.subject || undefined,
			email: selectedFilters?.email || undefined,
			template: selectedFilters?.template || undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		module.getMailLogs(params).then((res) => {
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
				heading="Mail Logs"
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
								label="Subject"
								name="subject"
								value={selectedFilters?.subject ? String(selectedFilters?.subject) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, subject: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Template"
								name="template"
								value={selectedFilters?.template ? String(selectedFilters?.template) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, template: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="email"
								label="Email"
								name="email"
								value={selectedFilters?.email ? String(selectedFilters?.email) : ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, email: "" })
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

export default SiteMailLogs;
