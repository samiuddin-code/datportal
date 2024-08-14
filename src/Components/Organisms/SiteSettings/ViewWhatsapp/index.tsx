import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import styles from '../../Common/styles.module.scss';
import { convertDate } from "../../../../helpers/dateHandler";
import { getPermissionSlugs, isNumber } from "../../../../helpers/common";
import { message } from "antd";
import { WHATSAPP_QUERY_TYPES, WhatsappResponseObject } from "../../../../Modules/Whatsapp/types";
import { WhatsappModule } from "../../../../Modules/Whatsapp";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { OrganizationModule } from "../../../../Modules/Organization";
import { useDebounce } from "../../../../helpers/useDebounce";
import { OrganizationType } from "../../../../Modules/Organization/types";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
import MoreCustomFilters from "../../../Atoms/CustomFilter/more";
import { UserTypes } from "../../../../Modules/User/types";
import { UserModule } from "../../../../Modules/User";
import { WhatsappPermissionsEnum } from "../../../../Modules/Whatsapp/permissions";

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
		text: "WhatsApp",
	},
];

type SelectedFiltersTypes = {
	sortByField: string;
	sortOrder: string;
	phone: string;
	status: string;
	dateRange: string[];
	propertyId: number;
	propertyCategory?: any
	organizationId: number;
	propertyUrl: string;
	agentId: number;
}

const moreFiltersOptions = [
	{ label: "Organization", value: "organizationId" },
	{ label: "Phone", value: "phone" },
	{ label: "Property URL", value: "propertyUrl", },
];

const sortByField = [
	{ label: "Date Added", value: "addedDate" },
];

const ViewWhatsapp = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(WhatsappPermissionsEnum)

	//Module initializations
	const module = useMemo(() => new WhatsappModule(), []);
	const propertyCategoryModule = useMemo(() => new PropertyCategoryModule(), [])
	const orgModule = useMemo(() => new OrganizationModule(), []);
	const userModule = useMemo(() => new UserModule(), []);

	const [moreFilters, setMoreFilters] = useState<CheckboxValueType[]>([]);
	const [moduleData, setModuleData] = useState<Partial<WhatsappResponseObject>>({ loading: false, data: [] });

	// search term for the organization
	const [orgSearchTerm, setOrgSearchTerm] = useState("");
	const debouncedOrgSearchTerm = useDebounce(orgSearchTerm, 500);

	// search term for agent
	const [agentSearchTerm, setAgentSearchTerm] = useState("");
	const debouncedAgentSearchTerm = useDebounce(agentSearchTerm, 500);

	// organization data
	const [organizationData, setOrganizationData] = useState<{ data: OrganizationType[]; loading: boolean }>({
		data: [],
		loading: false
	});

	// agent data
	const [agentData, setAgentData] = useState<{ data: UserTypes[]; loading: boolean }>({
		data: [],
		loading: false
	});

	// property category data
	const [propertyCategories, setPropertyCategories] = useState<{ data: PropertyCategoryType[]; loading: boolean }>({
		data: [],
		loading: false
	})

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		sortByField: "",
		sortOrder: "",
		phone: "",
		status: "",
		dateRange: [],
		propertyId: 0,
		propertyCategory: undefined,
		organizationId: 0,
		propertyUrl: "",
		agentId: 0,
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "propertyId" || name === "phone") {
			const isValidNumber = isNumber(value);

			if (!isValidNumber) {
				let label: string = "";
				switch (name) {
					case "organizationId": {
						label = "Organization ID";
						break;
					}
					case "phone": {
						label = "Phone";
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

	// get the search result for the organization 
	const GetSearchResult = useCallback(() => {
		// get the organization data
		if (debouncedOrgSearchTerm) {
			setOrganizationData((prev) => ({ ...prev, loading: true }));
			orgModule.findPublished({ name: debouncedOrgSearchTerm }).then((res) => {
				const data = res.data?.data as OrganizationType[];
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

		// get the agent data
		if (debouncedAgentSearchTerm) {
			setAgentData((prev) => ({ ...prev, loading: true }));
			userModule.getAgents({ name: debouncedAgentSearchTerm }).then((res) => {
				const data = res.data?.data as UserTypes[];
				if (data) {
					// remove duplicate data
					const uniqueData = data.filter((item, index) => {
						return data.findIndex((ele) => ele.id === item.id) === index;
					});
					setAgentData((prev) => ({ ...prev, data: uniqueData }));
				}
			}).catch((err) => {
				message.error(err?.response?.data?.message || "Something went wrong");
			}).finally(() => {
				setAgentData((prev) => ({ ...prev, loading: false }));
			})
		}
	}, [debouncedOrgSearchTerm, debouncedAgentSearchTerm])

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

	const onUpdate = useCallback((query?: Partial<WHATSAPP_QUERY_TYPES>) => {
		const fromDateString: string = selectedFilters.dateRange?.[0] || "";
		const toDateString = selectedFilters.dateRange?.[1] || "";
		const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
		const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

		const data = {
			status: selectedFilters.status ? selectedFilters.status : undefined,
			propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
			phone: selectedFilters.phone ? selectedFilters.phone : undefined,
			fromDate: fromDate,
			toDate: toDate,
			propertyCategory: selectedFilters.propertyCategory ? selectedFilters.propertyCategory : undefined,
			organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
			propertyUrl: selectedFilters.propertyUrl ? selectedFilters.propertyUrl : undefined,
			agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
			sortOrder: selectedFilters.sortOrder ? selectedFilters.sortOrder : undefined,
			sortByField: selectedFilters.sortByField ? selectedFilters.sortByField : undefined,
			...query
		} as WHATSAPP_QUERY_TYPES;

		// get the data from the api
		module.getAllRecords(data).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
			message.error(err?.response?.data?.message || "Something went wrong");
		})
	}, [selectedFilters, module])

	const onReset = useCallback((name: string, value: number | string | string[]) => {
		if (name) {
			setReset(true);
			setSelectedFilters({ ...selectedFilters, [name]: value });
		}
	}, [selectedFilters]);

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

	const reloadTableData = useCallback((query?: Partial<WHATSAPP_QUERY_TYPES>) => {
		onUpdate(query);
	}, [onUpdate]);

	useEffect(() => {
		reloadTableData();
	}, []);

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

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="WhatsApp"
				breadCrumbData={breadCrumbsData}
				filters={
					<div>
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
								label="Agent"
								name="agentId"
								withSearch={true}
								options={agentData?.data?.map((item) => ({
									label: `${item.firstName} ${item.lastName}`,
									value: `${item.id}`,
								}))}
								onChange={onSelected}
								value={Number(selectedFilters?.agentId) > 0 ? String(selectedFilters?.agentId) : ""}
								onReset={() => {
									setReset(true)
									onReset("agentId", 0);
									// reset the search term
									setAgentSearchTerm("");
								}}
								onUpdate={onUpdate}
								// START: For search
								loading={agentData?.loading}
								searchTerm={agentSearchTerm}
								onSearch={(event) => setAgentSearchTerm(event.currentTarget.value)}
							// END: For search
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

export default ViewWhatsapp;
