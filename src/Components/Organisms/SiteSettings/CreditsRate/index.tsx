import { useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { CreditsRateModal } from "./modal";
import TableComponent from "./table-columns";
import { CreditsRateModule } from "../../../../Modules/CreditsRate";
import { CreditsRate } from "../../../../Modules/CreditsRate/types";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import { convertDate } from "../../../../helpers/dateHandler";
import { MatchOperator } from "../../../../helpers/commonEnums";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../helpers/common";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { CreditsRatePermissionsEnum } from "../../../../Modules/CreditsRate/permissions";
import { RootState } from "../../../../Redux/store";
import { useSelector } from "react-redux";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";

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
		text: "Credits Rate",
	},
];

type SelectedFiltersTypes = {
	countryId: number;
	rate: number;
	matchOperator: string;
	isActive: boolean | null;
	dateRange?: string[];
}

function CreditsRateSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(CreditsRatePermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in CreditsRatePermissionsEnum]: boolean };
	const { readCreditsRate, createCreditsRate, updateCreditsRate } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new CreditsRateModule();
	const countryModule = useMemo(() => new CountryModule(), []);

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});
	const [countries, setCountries] = useState<CountryTypes[]>([]);

	const getCountryList = useCallback(() => {
		countryModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				setCountries(res.data.data);
			}
		});
	}, [countryModule]);

	const onCancelClick = () => {
		if (createCreditsRate === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: CreditsRate) => {
		if (updateCreditsRate === false) {
			message.error("You don't have permission to update record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		dateRange: [""],
		countryId: 0,
		rate: 0,
		matchOperator: "",
		isActive: null,
	});

	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "rate") {
			const validRate = isNumber(value)
			if (!validRate) {
				message.error("Rate must be only numbers")
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

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	}, [module]);

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			countryId: selectedFilters.countryId || undefined,
			rate: selectedFilters.rate || undefined,
			matchOperator: selectedFilters.matchOperator || undefined,
			isActive: selectedFilters.isActive || undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		reloadTableData(data);
	}, [selectedFilters]);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {

		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page: page,
			perPage: pageSize,
			countryId: selectedFilters.countryId || undefined,
			rate: selectedFilters.rate || undefined,
			matchOperator: selectedFilters.matchOperator || undefined,
			isActive: selectedFilters.isActive || undefined,
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

	useEffect(() => {
		reloadTableData();
		getCountryList()
	}, []);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Credits Rate"
				buttonText="Add New Credits Rate"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createCreditsRate === true ? true : false}
				filters={
					readCreditsRate === true ? (
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
									label="Rate"
									name="rate"
									value={selectedFilters?.rate > 0 ? String(selectedFilters?.rate) : ""}
									onChange={onSelected}
									onReset={() => onReset("rate", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Rate Operator"
									name="matchOperator"
									options={Object.entries(MatchOperator).map(([key, value]) => ({
										label: capitalize(key),
										value: value,
									}))}
									value={String(selectedFilters?.matchOperator)}
									onChange={onSelected}
									onReset={() => onReset("matchOperator", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Status"
									name="isActive"
									options={[
										{ label: "Active", value: "true" },
										{ label: "Inactive", value: "false" },
									]}
									value={selectedFilters.isActive !== null ? String(selectedFilters.isActive) : ""}
									onChange={onSelected}
									onReset={() => onReset("isActive", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Country"
									name="countryId"
									options={countries.map((country) => ({
										label: country.name,
										value: `${country.id}`,
									}))}
									value={selectedFilters.countryId > 0 ? String(selectedFilters?.countryId) : ""}
									onChange={onSelected}
									onReset={() => onReset("countryId", "")}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readCreditsRate === true && (
				<>
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
				</>
			)}
			{readCreditsRate === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<CreditsRateModal
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default CreditsRateSettings;
