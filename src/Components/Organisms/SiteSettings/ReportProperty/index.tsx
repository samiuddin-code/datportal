import { useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import styles from "../../Common/styles.module.scss";
import { ReportPropertyModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PropertyReportPermissionsEnum } from "../../../../Modules/PropertyReport/permissions";
import { PropertyReportModule } from "../../../../Modules/PropertyReport";
import { PropertyReportTypes } from "../../../../Modules/PropertyReport/types";
import { convertDate } from "../../../../helpers/dateHandler";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
// import { PropertyReportsStatusString } from "../../../../helpers/commonEnums";
import { isNumber } from "../../../../helpers/common";

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
		text: "Report Property",
	},
];

type SelectedFiltersTypes = {
	userIP: string;
	userAgent: string;
	propertyUrl: string;
	organizationId: string;
	propertyCategory: string;
	propertyId: string;
	reason: string;
	status: string;
	dateRange?: string[];
};

function ReportPropertySettings() {
	// available permissions for this module
	const permissionSlug = Object.values(PropertyReportPermissionsEnum).map(
		(value: string) => value
	);
	const { userPermissions } = useSelector(
		(state: RootState) => state.usersReducer
	);
	const permissions = userPermissions as {
		[key in PropertyReportPermissionsEnum]: boolean;
	};
	const { readReportProperty, createReportProperty, updateReportProperty } =
		permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new PropertyReportModule();
	const propertyCategoryModule = useMemo(
		() => new PropertyCategoryModule(),
		[]
	);

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});
	const [propertyCategories, setPropertyCategories] = useState<{
		data: PropertyCategoryType[];
		loading: boolean;
	}>({
		data: [],
		loading: false,
	});

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		userIP: "",
		userAgent: "",
		propertyUrl: "",
		organizationId: "",
		propertyCategory: "",
		propertyId: "",
		reason: "",
		status: "",
	});
	const [reset, setReset] = useState<boolean>(false);
	const onSelected = (event: any) => {
		const { name, value } = event?.target;

		if (name === "organizationId" || name === "propertyId") {
			const isValidNumber = isNumber(value);
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "organizationId": {
						label = "Organization ID";
						break;
					}
					case "propertyId": {
						label = "Property ID";
						break;
					}
				}
				return message.error(`${label} should be a number`);
			}
		}

		// set the selected value in the state
		setSelectedFilters({
			...selectedFilters,
			[name]: value,
		});
	};

	const reloadTableData = (query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	};

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString
			? convertDate(fromDateString, "yy-mm-dd")
			: undefined;
		const toDate = toDateString
			? convertDate(toDateString, "yy-mm-dd")
			: undefined;

		const data = {
			fromDate: fromDate || undefined,
			toDate: toDate || undefined,
			userIP: selectedFilters.userIP || undefined,
			userAgent: selectedFilters.userAgent || undefined,
			propertyUrl: selectedFilters.propertyUrl || undefined,
			organizationId: selectedFilters.organizationId || undefined,
			propertyCategory: selectedFilters.propertyCategory || undefined,
			propertyId: selectedFilters.propertyId || undefined,
			reason: selectedFilters.reason || undefined,
			status: selectedFilters.status || undefined,
		};

		// get the data from the api
		reloadTableData(data);
	}, [selectedFilters]);

	const onReset = useCallback(
		(name: string, value: number | string | string[]) => {
			if (name) {
				setReset(true);
				setSelectedFilters({ ...selectedFilters, [name]: value });
			}
		},
		[selectedFilters]
	);

	const onCancelClick = () => {
		if (createReportProperty === false) {
			message.error("You don't have permission to update this record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PropertyReportTypes) => {
		if (updateReportProperty === false) {
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

	const getPropertCategory = useCallback(() => {
		propertyCategoryModule
			.getAllRecords()
			.then((res) => {
				setPropertyCategories(res.data);
			})
			.catch((err) => {
				setPropertyCategories({ ...propertyCategories, loading: false });
			});
	}, []);

	const onPaginationChange = useCallback(
		(page: number, pageSize: number) => {
			setModuleData({ ...moduleData, loading: true });

			const fromDateString: string = selectedFilters.dateRange?.[0] || "";
			const toDateString = selectedFilters.dateRange?.[1] || "";
			const fromDate = fromDateString
				? convertDate(fromDateString, "yy-mm-dd")
				: undefined;
			const toDate = toDateString
				? convertDate(toDateString, "yy-mm-dd")
				: undefined;

			const params = {
				page: page,
				perPage: pageSize,
				fromDate: fromDate || undefined,
				toDate: toDate || undefined,
				userIP: selectedFilters.userIP || undefined,
				userAgent: selectedFilters.userAgent || undefined,
				propertyUrl: selectedFilters.propertyUrl || undefined,
				organizationId: selectedFilters.organizationId || undefined,
				propertyCategory: selectedFilters.propertyCategory || undefined,
				propertyId: selectedFilters.propertyId || undefined,
				reason: selectedFilters.reason || undefined,
				status: selectedFilters.status || undefined,
			};

			// get the data from the api
			reloadTableData(params);
		},
		[selectedFilters]
	);

	const reloadTableDataWithFilters = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		reloadTableData({
			perPage: moduleData?.meta?.perPage || 10,
			page: moduleData?.meta?.page || 1,
			fromDate: fromDate || undefined,
			toDate: toDate || undefined,
			userIP: selectedFilters.userIP || undefined,
			userAgent: selectedFilters.userAgent || undefined,
			propertyUrl: selectedFilters.propertyUrl || undefined,
			organizationId: selectedFilters.organizationId || undefined,
			propertyCategory: selectedFilters.propertyCategory || undefined,
			propertyId: selectedFilters.propertyId || undefined,
			reason: selectedFilters.reason || undefined,
			status: selectedFilters.status || undefined,
		})
	}, [moduleData, selectedFilters])

	useEffect(() => {
		getPropertCategory();
	}, []);

	useEffect(() => {
		reloadTableData();
	}, []);

	useEffect(() => {
		if (reset) {
			onUpdate();
		}
		// after 2 seconds set reset clicked state to false
		const timer = setTimeout(() => {
			setReset(false);
		}, 2000);
		return () => clearTimeout(timer);
	}, [reset, selectedFilters, onUpdate]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Reported Properties"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				filters={
					readReportProperty === true ? (
						<div>
							<div>
								<CustomFilter
									type="datepicker"
									label="Date"
									name="dateRange"
									onChange={(value) => {
										setSelectedFilters({
											...selectedFilters,
											dateRange: value,
										});
									}}
									onReset={() => onReset("dateRange", [])}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="User IP"
									name="userIP"
									value={selectedFilters?.userIP ? selectedFilters?.userIP : ""}
									onChange={onSelected}
									onReset={() => onReset("userIP", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="User Agent"
									name="userAgent"
									value={selectedFilters?.userAgent ? selectedFilters?.userAgent : ""}
									onChange={onSelected}
									onReset={() => onReset("userAgent", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Property Url"
									name="propertyUrl"
									value={selectedFilters?.propertyUrl ? selectedFilters?.propertyUrl : ""}
									onChange={onSelected}
									onReset={() => onReset("propertyUrl", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Organization Id"
									name="organizationId"
									value={selectedFilters?.organizationId ? selectedFilters?.organizationId : ""}
									onChange={onSelected}
									onReset={() => onReset("organizationId", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Property Category"
									name="propertyCategory"
									options={propertyCategories?.data?.map(
										(item: PropertyCategoryType) => ({
											label: item.localization[0].title,
											value: item.slug,
										})
									)}
									value={selectedFilters?.propertyCategory}
									onChange={onSelected}
									onReset={() => onReset("propertyCategory", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Property ID"
									name="propertyId"
									value={selectedFilters?.propertyId ? selectedFilters?.propertyId : ""}
									onChange={onSelected}
									onReset={() => onReset("propertyId", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Reason"
									name="reason"
									value={selectedFilters?.reason ? selectedFilters?.reason : ""}
									onChange={onSelected}
									onReset={() => onReset("reason", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Status"
									name="status"
									options={[]}
									value={selectedFilters?.status}
									onChange={onSelected}
									onReset={() => onReset("status", "")}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readReportProperty === true && (
				<>
					<div className={styles.antdTableWrapper}>
						<TableComponent
							tableData={moduleData.data}
							tableLoading={moduleData.loading}
							onEditIconClick={onEditIconClick}
							reloadTableData={reloadTableDataWithFilters}
						/>
					</div>
					<Pagination
						total={moduleData?.meta?.total}
						current={moduleData?.meta?.page}
						defaultPageSize={
							moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10
						}
						pageSizeOptions={[10, 20, 50, 100]}
						onChange={onPaginationChange}
					/>
				</>
			)}
			{readReportProperty === false && (
				<ErrorCode403 mainMessage="You don't have permission to view this data" />
			)}
			{currentEditType.openModal && (
				<ReportPropertyModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableDataWithFilters}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default ReportPropertySettings;
