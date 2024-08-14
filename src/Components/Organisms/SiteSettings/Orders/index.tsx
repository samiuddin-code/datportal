import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentOrdersModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import { OrgCreditsPackageModule } from "../../../../Modules/OrganizationCreditPackage";
import { OrganizationCreditPackageTypes } from "../../../../Modules/OrganizationCreditPackage/types";
import { OrgCreditPackagePermissionsEnum } from "../../../../Modules/OrganizationCreditPackage/permissions";
import { message } from "antd";
import { convertDate } from "../../../../helpers/dateHandler";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../helpers/common";

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
		text: "Orders",
	},
];

type SelectedFiltersTypes = {
	organizationId: number;
	creditPackageId: number;
	status: number;
	dateRange: string[];
}

function SiteOrders() {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(OrgCreditPackagePermissionsEnum)

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	// Organization Credit packages module
	const module = useMemo(() => new OrgCreditsPackageModule(), []);

	const [moduleData, setModuleData] = useState<any>({
		loading: false,
		error: {},
		data: [],
	});

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		organizationId: 0,
		creditPackageId: 0,
		status: 0,
		dateRange: [""],
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "organizationId" || name === "creditPackageId" || name === "status") {
			const isValidNumber = isNumber(value)
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "organizationId": {
						label = "Organization ID";
						break;
					}
					case "creditPackageId": {
						label = "Credit Package ID";
						break;
					}
					case "status": {
						label = "Status";
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

	const onReset = useCallback((name: string, value: number | string | string[]) => {
		if (name) {
			setReset(true);
			setSelectedFilters({ ...selectedFilters, [name]: value });
		}
	}, [selectedFilters]);

	const onCancelClick = () => {
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: OrganizationCreditPackageTypes) => {
		setcurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllOrgSubscriptions(query).then((res) => {
			setModuleData({ ...res.data });
		}).catch((err) => {
			message.error(err.response.data.message);
		});
	}, [module, moduleData]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			organizationId: selectedFilters.organizationId > 0 ? selectedFilters.organizationId : undefined,
			creditPackageId: selectedFilters.creditPackageId > 0 ? selectedFilters.creditPackageId : undefined,
			status: selectedFilters.status > 0 ? selectedFilters.status : undefined,
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
			organizationId: selectedFilters.organizationId > 0 ? selectedFilters.organizationId : undefined,
			creditPackageId: selectedFilters.creditPackageId > 0 ? selectedFilters.creditPackageId : undefined,
			status: selectedFilters.status > 0 ? selectedFilters.status : undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		reloadTableData(params);
	}, [selectedFilters]);

	useEffect(() => {
		reloadTableData();
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
				heading="Orders"
				breadCrumbData={breadCrumbsData}
				filters={
					<div>
						<div>
							<CustomFilter
								type="input"
								label="Organization ID"
								name="organizationId"
								value={Number(selectedFilters?.organizationId) > 0 ? String(selectedFilters?.organizationId) : ""}
								onChange={onSelected}
								onReset={() => onReset("organizationId", 0)}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="input"
								label="Credit Package ID"
								name="creditPackageId"
								value={Number(selectedFilters?.creditPackageId) > 0 ? String(selectedFilters?.creditPackageId) : ""}
								onChange={onSelected}
								onReset={() => onReset("creditPackageId", 0)}
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
						<div>
							<CustomFilter
								type="radio"
								label="Status"
								name="status"
								value={selectedFilters?.status ? String(selectedFilters?.status) : ""}
								onChange={onSelected}
								onReset={() => onReset("status", 0)}
								onUpdate={onUpdate}
								options={Object.entries([]).map(([key, value]) => ({
									label: capitalize(key),
									value: String(value)
								}))}
							/>
						</div>
					</div>
				}
			/>
			<TableComponent
				tableData={moduleData.data}
				tableLoading={moduleData.loading}
				onEditIconClick={onEditIconClick}
				reloadTableData={reloadTableData}
			/>
			<Pagination
				total={moduleData?.meta?.total}
				current={moduleData?.meta?.page}
				defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
				pageSizeOptions={[10, 20, 50, 100]}
				onChange={onPaginationChange}
			/>
			{currentEditType.openModal && (
				<AgentOrdersModal
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SiteOrders;
