import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, ExcelExport, PageHeader, Pagination } from "../../../Atoms";
import Skeletons from "../../Skeletons";
import TableComponent from "./table-columns";
import { LeadsModal } from "./modal";
import { LeadsResponseObject, LeadsTypes, LeadsParamTypes } from "../../../../Modules/Leads/types";
import { LeadsModule } from "../../../../Modules/Leads";
import styles from '../../Common/styles.module.scss'
import { convertDate } from "../../../../helpers/dateHandler";
import { LeadsPermissionsEnum } from "../../../../Modules/Leads/permissions";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { capitalize, getPermissionSlugs, isNumber } from "../../../../helpers/common";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
import MoreCustomFilters from "../../../Atoms/CustomFilter/more";
import { OrganizationModule } from "../../../../Modules/Organization";
import { useDebounce } from "../../../../helpers/useDebounce";
import { OrganizationType } from "../../../../Modules/Organization/types";
import { Button, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { QueryType } from "@modules/Common/common.interface";

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
		text: "Leads",
	},
];

type SelectedFiltersTypes = {
	name?: string;
	phone?: string;
	email?: string;
	status?: string;
	dateRange?: string[];
	propertyId?: number;
	propertyCategory?: any
	organizationId?: number;
	propertyUrl?: string;
	source?: any
	sortOrder?: string;
	sortByField?: string;
}

type LeadsExportType = { [key: string]: string | number | boolean }

const LeadsSettings = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(LeadsPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in LeadsPermissionsEnum]: boolean };
	const { readLeads, createLeads, updateLeads } = permissions;

	const propertyCategoryModule = useMemo(() => new PropertyCategoryModule(), [])
	const orgModule = useMemo(() => new OrganizationModule(), []);
	const leadsModule = useMemo(() => new LeadsModule(), []);

	const [orgSearchTerm, setOrgSearchTerm] = useState("");
	const debouncedOrgSearchTerm = useDebounce(orgSearchTerm, 500);

	const [moreFilters, setMoreFilters] = useState<CheckboxValueType[]>([]);
	const [moduleData, setModuleData] = useState<Partial<LeadsResponseObject>>({
		loading: false,
		data: [],
	});

	const [organizationData, setOrganizationData] = useState<{ data: OrganizationType[]; loading: boolean }>({
		data: [],
		loading: false
	});

	const [propertyCategories, setPropertyCategories] = useState<{ data: PropertyCategoryType[]; loading: boolean }>({
		data: [],
		loading: false
	})

	const [currentEditType, setCurrentEditType] = useState<{
		editType: "new" | "edit" | "notes";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		status: "",
		dateRange: [""],
		name: "",
		propertyId: 0,
		phone: "",
		email: "",
		propertyCategory: undefined,
		organizationId: 0,
		propertyUrl: "",
		source: undefined,
		sortOrder: "",
		sortByField: ""
	});

	const [reset, setReset] = useState<boolean>(false);
	const [excelData, setExcelData] = useState<LeadsExportType[]>([]);

	// headers for the excel export
	const headers = [
		{ label: "Name", key: "name" },
		{ label: "Email", key: "email" },
		{ label: "Phone", key: "phone" },
		{ label: "Source", key: "source" },
		{ label: "Date Added", key: "addedDate" },
		{ label: "Status", key: "status" },
		{ label: "Property ID", key: "propertyId" },
		{ label: "Assigned To", key: "assignedTo" },
		{ label: "Organization", key: "organization" },
		{ label: "Message", key: "message" },
		{ label: "Reference", key: "reference" }
	]


	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "organizationId" || name === "propertyId") {
			const isValidNumber = isNumber(value)
			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "organizationId": {
						label = "Organization ID"
						break;
					}
					case "propertyId": {
						label = "Property ID"
						break;
					}
				}
				return message.error(`${label} should be a number`)
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
		setCurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onAddNewLeadClick = () => {
		if (createLeads === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setCurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	}

	const onEditIconClick = (record: LeadsTypes) => {
		if (updateLeads === false) {
			message.error("You don't have permission to update record");
			return;
		}
		setCurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};

	const onAddNoteClick = (record: LeadsTypes) => {
		setCurrentEditType({
			...currentEditType,
			editType: "notes",
			recordId: record.id,
			openModal: true,
		});
	};

	// get the search result for the organization
	const GetSearchResult = useCallback(() => {
		if (debouncedOrgSearchTerm) {
			setOrganizationData((prev) => ({ ...prev, loading: true }));
			orgModule.findPublished({ name: debouncedOrgSearchTerm }).then((res) => {
				const data = res.data?.data
				if (data) {
					// remove duplicate data
					const uniqueData = data.filter((item, index) => {
						return data.findIndex((ele) => ele.id === item.id) === index;
					});
					setOrganizationData((prev) => ({ ...prev, data: uniqueData }));
				}
			}).catch((err) => {
				message.error(err?.response?.data?.message || "Something went wrong");
			}).finally(() => {
				setOrganizationData((prev) => ({ ...prev, loading: false }));
			})
		}
	}, [debouncedOrgSearchTerm, orgModule])

	useEffect(() => {
		GetSearchResult()
	}, [GetSearchResult])

	const getData = useCallback(() => {
		propertyCategoryModule.getAllRecords().then((res) => {
			setPropertyCategories(res.data);
		}).catch(() => {
			setPropertyCategories({ ...propertyCategories, loading: false });
		});
	}, [propertyCategories]);

	useEffect(() => {
		getData();
	}, []);

	const onUpdate = useCallback((query?: QueryType<LeadsParamTypes>) => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			status: selectedFilters.status ? selectedFilters.status : undefined,
			name: selectedFilters.name ? selectedFilters.name : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			email: selectedFilters.email ? selectedFilters.email : undefined,
			phone: selectedFilters.phone ? selectedFilters.phone : undefined,
			fromDate: fromDate,
			toDate: toDate,
			propertyCategory: selectedFilters.propertyCategory ? selectedFilters.propertyCategory : undefined,
			organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
			propertyUrl: selectedFilters.propertyUrl ? selectedFilters.propertyUrl : undefined,
			source: selectedFilters.source ? selectedFilters.source : undefined,
			sortOrder: selectedFilters.sortOrder ? selectedFilters.sortOrder : undefined,
			sortByField: selectedFilters.sortByField ? selectedFilters.sortByField : undefined,
			...query,
		}

		// get the data from the api
		leadsModule.getAllRecords(data).then((response) => {
			setModuleData({
				...moduleData,
				loading: false,
				data: response.data?.data,
				meta: response.data?.meta
			});
		});
	}, [selectedFilters, leadsModule])

	const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });

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

	const reloadTableData = useCallback((query?: QueryType<LeadsParamTypes>) => {
		leadsModule.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	}, [leadsModule]);

	useEffect(() => {
		setModuleData({ ...moduleData, loading: true });
		reloadTableData();
	}, []);

	const moreFiltersOptions = [
		{ label: "Organization", value: "organizationId" },
		{ label: "Phone", value: "phone" },
		{ label: "Email", value: "email" },
		{ label: "Property URL", value: "propertyUrl", },
	];

	const sortByField = [
		{ label: "Name", value: "name" },
		{ label: "Email", value: "email" },
		{ label: "Date Added", value: "addedDate" },
	];

	const moreComponents: any = {
		organizationId: (
			<CustomFilter
				type="radio"
				label="Organization"
				name="organizationId"
				withSearch={true}
				options={organizationData?.data?.map((item) => ({
					label: item.name,
					value: `${item.id}`,
				}))}
				onChange={onSelected}
				value={Number(selectedFilters?.organizationId) > 0 ? String(selectedFilters?.organizationId) : ""}
				onReset={() => {
					setReset(true)
					onReset("organizationId", 0);
					// reset the search term
					setOrgSearchTerm("");
				}}
				onUpdate={onUpdate}
				// START: For search
				loading={organizationData?.loading}
				searchTerm={orgSearchTerm}
				onSearch={(event) => setOrgSearchTerm(event.currentTarget.value)}
			// END: For search
			/>
		),
		phone: (
			<CustomFilter
				type="input"
				label="Phone"
				name="phone"
				value={String(selectedFilters?.phone)}
				onChange={onSelected}
				onReset={() => onReset("phone", "")}
				onUpdate={onUpdate}
			/>
		),
		email: (
			<CustomFilter
				type="email"
				label="Email"
				name="email"
				value={String(selectedFilters?.email)}
				onChange={onSelected}
				onReset={() => onReset("email", "")}
				onUpdate={onUpdate}
			/>
		),
		propertyUrl: (
			<CustomFilter
				type="input"
				label="Property URL"
				name="propertyUrl"
				value={String(selectedFilters?.propertyUrl)}
				onChange={onSelected}
				onReset={() => onReset("propertyUrl", "")}
				onUpdate={onUpdate}
			/>
		),
	}

	const getExcelData = useCallback(() => {
		if (moduleData?.data?.length > 0) {
			const data = moduleData?.data?.map((item: LeadsTypes) => {
				// const { assignedTo, organization } = item;
				// return {
				// 	name: item.name,
				// 	email: item.email,
				// 	phone: `+${item.phoneCode}${item.phone}`,
				// 	source: item.source,
				// 	addedDate: moment(item?.addedDate).format("LL") || "N/A",
				// 	status: LeadsStatus[item.status],
				// 	propertyId: item.propertyId || "N/A",
				// 	assignedTo: assignedTo?.firstName ? `${assignedTo?.firstName} ${assignedTo?.lastName}` : "N/A",
				// 	organization: organization ? organization.name : "N/A",
				// 	message: item.message || "N/A",
				// 	reference: item.reference || "N/A"
				// }
			})
			setExcelData(data);
		}
	}, [moduleData])

	useEffect(() => {
		getExcelData();
	}, [getExcelData])

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Leads"
				breadCrumbData={breadCrumbsData}
				showAdd={permissions.createLeads === true ? true : false}
				buttonText="Add Lead"
				onButtonClick={onAddNewLeadClick}
				positionChildren="new-line"
				filters={
					readLeads ? (
						<div className={styles.filterWrapper}>
							<div>
								<CustomFilter
									type="radio"
									label="Status"
									name="status"
									options={[]}
									value={String(selectedFilters?.status)}
									onChange={onSelected}
									onReset={() => onReset("status", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Name"
									name="name"
									value={String(selectedFilters?.name)}
									onChange={onSelected}
									onReset={() => onReset("name", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Property ID"
									name="propertyId"
									value={Number(selectedFilters?.propertyId) > 0 ? String(selectedFilters?.propertyId) : ""}
									onChange={onSelected}
									onReset={() => onReset("propertyId", 0)}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Property Category"
									name="propertyCategory"
									options={propertyCategories?.data?.map((item: PropertyCategoryType) => ({
										label: item.localization[0].title,
										value: item.slug
									}))}
									value={String(selectedFilters?.propertyCategory)}
									onChange={onSelected}
									onReset={() => onReset("propertyCategory", "")}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Source"
									name="source"
									options={Object.entries([]).map(([key, value]) => ({
										label: value,
										value: key,
									}))}
									value={String(selectedFilters?.source)}
									onChange={onSelected}
									onReset={() => onReset("source", "")}
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
							{/**  Find the selected filter and render the component based on the name of the filter */
								Object.keys(moreComponents).map((key: string) => {
									return moreFilters?.includes(key) && moreComponents[key]
								})
							}
							<div>
								<MoreCustomFilters
									options={moreFiltersOptions?.map((option) => ({
										label: option.label,
										value: option.value,
									}))}
									onChange={(value) => setMoreFilters(value)}
									value={moreFilters}
								/>
							</div>

							<div style={{ marginLeft: "auto", marginRight: "0px" }}>
								<CustomFilter
									type="radio"
									label="Sort By"
									name="sortByField"
									options={sortByField}
									value={String(selectedFilters?.sortByField)}
									onChange={onSelected}
									onReset={() => onReset("sortByField", "")}
									onUpdate={onUpdate}
									withSort
								/>
							</div>
						</div>
					) : null
				}
				excelExport={(readLeads === true && moduleData?.data?.length > 0) && (
					<ExcelExport
						fileName="Leads"
						headers={headers}
						data={excelData}
						icon={
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="none"
								viewBox="0 0 24 24"
								className='mr-1'
							>
								<path
									fill="#42526E"
									d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2zm1.06 10.33c0 .41-.34.75-.75.75s-.75-.34-.75-.75V9.31l-7.72 7.72c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 010-1.06l7.72-7.72h-3.02c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.83c.41 0 .75.34.75.75v4.83z"
								></path>
							</svg>
						}
					/>
				)}
			>
				{readLeads === true && (
					<div style={{ display: "flex" }}>
						<Button
							type="ghost"
							href="/siteSettings/leads/tracker"
							style={{
								marginLeft: "auto",
								marginRight: "0px",
								width: "fit-content",
								marginTop: 10,
							}}
						>
							Leads Tracker
						</Button>
					</div>
				)}
			</PageHeader>

			{moduleData.loading ? (
				<Skeletons items={5} fullWidth />
			) : (
				<>
					{readLeads === true && (
						<>
							<div className={styles.antdTableWrapper}>
								<TableComponent
									tableData={moduleData?.data}
									tableLoading={moduleData?.loading!}
									reloadTableData={() => onUpdate({
										perPage: moduleData?.meta?.perPage || 10,
										page: moduleData?.meta?.page || 1,
									})}
									onEditIconClick={onEditIconClick}
									onAddNoteClick={onAddNoteClick}
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
				</>
			)}

			{readLeads === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<LeadsModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => onUpdate({
						perPage: moduleData?.meta?.perPage || 10,
						page: moduleData?.meta?.page || 1,
					})}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
};

export default LeadsSettings;
