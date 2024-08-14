import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePromotionModal } from "./modal";
import TableComponent from "./table-columns";
import { PromotionModule } from "../../../../Modules/Promotion";
import { PromotionTypes } from "../../../../Modules/Promotion/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import { ManagePackagesModal } from "./ManagePackages/modal";
import { CountryModule } from "../../../../Modules/Country";
import { useDebounce } from "../../../../helpers/useDebounce";
import { CountryTypes } from "../../../../Modules/Country/types";
import { convertDate } from "../../../../helpers/dateHandler";
// import { PromotionDiscountType, PromotionStatus } from "../../../../helpers/commonEnums";
import { capitalize, getPermissionSlugs } from "../../../../helpers/common";
import { PromotionPermissionsEnum } from "../../../../Modules/Promotion/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/"
	},
	{
		isLink: true,
		text: "Site Settings",
		path: "/siteSettings",
	},
	{
		isLink: false,
		text: "Promotion",
	},
];

type SelectedFiltersTypes = {
	promoCode: string;
	discountType: string;
	country: number;
	isPublished: boolean | undefined;
	dateRange?: string[];
	status: string;
}

function SitePromotionSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PromotionPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PromotionPermissionsEnum]: boolean };
	const { createPromotion, readPromotion, updatePromotion } = permissions

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new PromotionModule(), [])
	const countryModule = useMemo(() => new CountryModule(), []);

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		promoCode: "",
		discountType: "",
		country: 0,
		isPublished: undefined,
		status: "",
	});

	const [countries, setCountries] = useState<CountryTypes[]>([]);
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

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

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [managePackages, setManagePackages] = useState<{
		recordId: number;
		openModal: boolean;
		recordData?: any
		type: "credit" | "package"
	}>({
		recordId: 0,
		openModal: false,
		recordData: {},
		type: "credit"
	});

	// event handle  to open and close modal
	const handleClick = () => {
		if (createPromotion === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PromotionTypes) => {
		if (updatePromotion === false) {
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

	const onManageClick = (record: PromotionTypes, type: "credit" | "package") => {
		if (updatePromotion === false) {
			message.error("You don't have permission to manage this record");
			return;
		}
		setManagePackages({
			...managePackages,
			recordId: record.id,
			recordData: type === "credit" ? record['creditPackagePromotions'] : record['packagePromotions'],
			openModal: true,
			type: type
		});
	};

	const reloadTableData = (query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => {
			setModuleData({ ...moduleData, loading: false });
		});
	};

	const onUpdate = useCallback(() => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			promoCode: selectedFilters.promoCode || undefined,
			discountType: selectedFilters.discountType || undefined,
			country: selectedFilters.country || undefined,
			isPublished: selectedFilters.isPublished || undefined,
			status: selectedFilters.status || undefined,
			title: debouncedSearchTerm || undefined,
			fromDate: fromDate,
			toDate: toDate,
		}

		reloadTableData(data);
	}, [selectedFilters, debouncedSearchTerm])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const params = {
			page,
			perPage: pageSize,
			promoCode: selectedFilters.promoCode || undefined,
			discountType: selectedFilters.discountType || undefined,
			country: selectedFilters.country || undefined,
			isPublished: selectedFilters.isPublished || undefined,
			status: selectedFilters.status || undefined,
			title: debouncedSearchTerm || undefined,
			fromDate: fromDate,
			toDate: toDate,
		};

		reloadTableData(params);
	}, [selectedFilters, debouncedSearchTerm]);

	useEffect(() => {
		countryModule.getAllRecords().then((res) => {
			setCountries(res.data.data);
		}).catch((err) => {
			console.error(err?.response?.data?.message || err?.message);
		});
	}, [countryModule]);

	// NOTE: this is not a good way to do this, but it works for now
	useEffect(() => {
		if (debouncedSearchTerm) {
			onUpdate()
		} else {
			onUpdate()
		}
	}, [debouncedSearchTerm]);

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
				heading="Promotion"
				buttonText="New Promotion"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createPromotion === true ? true : false}
				filters={
					readPromotion === true ? (
						<div>
							<div>
								<CustomInput
									placeHolder='Search...'
									icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
									size="w100"
									className='py-1'
									value={searchTerm}
									onChange={onSearch}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Discount Type"
									name="discountType"
									value={selectedFilters?.discountType}
									options={[]}
									onChange={onSelected}
									onReset={() => onReset("discountType", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Promo Code"
									name="promoCode"
									value={selectedFilters?.promoCode}
									onChange={onSelected}
									onReset={() => onReset("promoCode", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Status"
									name="status"
									value={selectedFilters?.status}
									options={[]}
									onChange={onSelected}
									onReset={() => onReset("status", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Published"
									name="isPublished"
									options={[
										{
											label: "Yes",
											value: "true"
										},
										{
											label: "No",
											value: "false"
										}
									]}
									value={String(selectedFilters?.isPublished)}
									onChange={onSelected}
									onReset={() => onReset("isPublished", "")}
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
									label="Country"
									name="country"
									value={String(selectedFilters?.country)}
									options={countries?.map((country) => ({
										label: country.name,
										value: String(country.id)
									}))}
									onChange={onSelected}
									onReset={() => onReset("country", "")}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readPromotion === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						onManageClick={onManageClick}
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
			{readPromotion === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<SitePromotionModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={handleClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}

			{managePackages.openModal && (
				<ManagePackagesModal
					record={managePackages.recordId}
					recordData={managePackages.recordData}
					type={managePackages.type}
					reloadTableData={reloadTableData}
					onCancel={() => setManagePackages({ ...managePackages, openModal: false })}
					openModal={managePackages.openModal}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SitePromotionSettings;
