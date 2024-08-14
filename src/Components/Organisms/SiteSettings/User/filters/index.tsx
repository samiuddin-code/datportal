import { useCallback, useEffect, useState, useMemo } from "react";
import { useDebounce } from "../../../../../helpers/useDebounce";
import { UserModule } from "../../../../../Modules/User";
import CustomInput from "../../../../Atoms/Input";
import { FiltersType } from "./types";
import MoreFilters, { MultiSelectFilter } from "../../../common___/moreFilters";
import { MultiInputFilter } from "../../../common___/multiInputFilters";
import { UserStatus } from "../../../../../helpers/commonEnums";
import { capitalize } from "../../../../../helpers/common";
import { OrganizationModule } from "../../../../../Modules/Organization";
import { message } from "antd";
import { OrganizationType } from "../../../../../Modules/Organization/types";
import { CustomFilter } from "../../../../Atoms";
import { RolesModule } from "../../../../../Modules/Roles";
import { RoleTypes } from "../../../../../Modules/Roles/types";

export type FilterPropTypes = {
	filters: FiltersType;
	setFilters: (filters: FiltersType) => void;
};

const publishOptions = [
	{ label: "Published", value: "true" },
	{ label: "Not Published", value: "false" },
	{ label: "Ascending", value: "asc" },
	{ label: "Descending", value: "desc" },
];

const moreItems = [
	{ label: "Organization", value: "organization" },
	{ label: "Email", value: "email" },
	{ label: "Phone", value: "phone" },
	{ label: "Role", value: "role" },
];

const sortByField = [
	{ label: "Name", value: "name" },
	{ label: "Email", value: "email" },
	{ label: "Date Added", value: "addedDate" },
];

const Filters = ({ filters, setFilters }: FilterPropTypes) => {
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const [moreFilters, setMoreFilters] = useState<string[]>([]);
	const [currentMoreFilter, setCurrentMoreFilters] = useState<string>("");
	const [moreVisible, setMoreVisible] = useState(false);
	const [organizationData, setOrganizationData] = useState<Partial<{
		data: OrganizationType[];
		loading: boolean
	}>>({
		data: [],
		loading: false
	});
	const [rolesData, setRolesData] = useState<RoleTypes[]>([]);
	const [reset, setReset] = useState<boolean>(false);

	const [orgSearchTerm, setOrgSearchTerm] = useState("");
	const debouncedOrgSearchTerm = useDebounce(orgSearchTerm, 500);

	// Modules
	const module = useMemo(() => new UserModule(), []);
	const orgModule = useMemo(() => new OrganizationModule(), []);
	const rolesModule = useMemo(() => new RolesModule(), []);

	const [prefilterData, setPreFilterData] = useState<FiltersType>({});

	useEffect(() => {
		if (debouncedSearchTerm) {
			setFilters({ ...prefilterData, name: debouncedSearchTerm });
		} else {
			setFilters({ ...prefilterData });
		}
	}, [debouncedSearchTerm]);

	const onFilter = useCallback((values?: FiltersType) => {
		setFilters({
			...prefilterData,
			...values,
		});
	}, [prefilterData, setFilters]);

	const onFilterValueChange = useCallback((data: any, type: string) => {
		let filterData = { ...prefilterData, [type]: data };
		if (type === "phone") {
			filterData.phone = data?.replace(/[^0-9]/g, "")
		}
		if (type === "date") {
			filterData.fromDate = null;
			filterData.toDate = null;
			setFilters(filterData);
		} else if (data?.length === 0) {
			setFilters(filterData);
		}
		setPreFilterData(filterData);
	}, [prefilterData, setFilters]);

	const onMoreFiltersUpdate = (data: any[]) => {
		setMoreFilters((prv) => {
			let [difference]: any = new Set([
				...data.filter((x) => prv.indexOf(x) === -1),
				...prv.filter((x) => data.indexOf(x) === -1),
			]);
			setMoreVisible(false);

			if (prv.includes(difference)) {
				const filterData = { ...prefilterData, [difference]: [] };
				setPreFilterData(filterData);
				setFilters(filterData);
			} else {
				setCurrentMoreFilters(difference);
			}
			return data;
		});
	};

	// get the search result for the organization
	const GetSearchResult = useCallback(() => {
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
	}, [debouncedOrgSearchTerm, orgModule])

	useEffect(() => {
		GetSearchResult()
	}, [GetSearchResult])

	useEffect(() => {
		if (reset) {
			onFilter();
		}
		// after 2 seconds set reset clicked state to false
		const timer = setTimeout(() => {
			setReset(false)
		}, 2000);
		return () => clearTimeout(timer);
	}, [reset, prefilterData.organizationId, onFilter])

	useEffect(() => {
		rolesModule.getAllRecords().then((res) => {
			const data = res.data?.data as RoleTypes[];
			if (data) {
				setRolesData(data);
			}
		}).catch((err) => {
			message.error(err?.response?.data?.message || "Something went wrong");
		})
	}, [])

	// More filter components
	const moreFilterComponents: any = {
		email: (
			<MultiSelectFilter
				filterType="input"
				value={prefilterData.email}
				onChange={onFilterValueChange}
				type="email"
				label="Email"
				filters={filters}
				data={[]}
				onFilter={onFilter}
				show={currentMoreFilter === "email"}
				showFooter={false}
			/>
		),
		phone: (
			<MultiSelectFilter
				filterType="input"
				value={prefilterData.phone}
				onChange={onFilterValueChange}
				type="phone"
				label="Phone"
				placeHolder="Enter phone"
				filters={filters}
				data={[]}
				onFilter={onFilter}
				show={currentMoreFilter === "phone"}
				showFooter={false}
			/>
		),
		organization: (
			<CustomFilter
				type="radio"
				label="Organization"
				name="organizationId"
				withSearch={true}
				options={organizationData?.data?.map((item) => ({
					label: item.name,
					value: `${item.id}`,
				})) || []}
				onChange={(event) => {
					const { value } = event.target;
					setPreFilterData({ ...prefilterData, organizationId: value });
				}}
				value={prefilterData?.organizationId}
				onReset={() => {
					setReset(true)
					setPreFilterData({ ...prefilterData, organizationId: "" });
					// reset the search term
					setOrgSearchTerm("");
				}}
				onUpdate={() => onFilter()}
				// START: For search
				loading={organizationData?.loading}
				searchTerm={orgSearchTerm}
				onSearch={(event) => setOrgSearchTerm(event.currentTarget.value)}
			// END: For search
			/>
		),
		role: (
			<CustomFilter
				type="multiSelect"
				label="Role"
				name="roleIds"
				options={rolesData?.map((item) => ({
					label: item.title,
					value: `${item.id}`,
				}))}
				onChange={(value) => setPreFilterData({ ...prefilterData, roleIds: value })}
				onReset={() => {
					setReset(true)
					setPreFilterData({ ...prefilterData, roleIds: [] });
					onFilterValueChange([], "roleIds");
				}}
				onUpdate={() => onFilter()}
			/>
		)
	};

	const onFilterReset = () => {
		setSearchTerm("");
		setFilters({});
		setPreFilterData({});
		setMoreFilters([]);
		module.getAllRecords();
	};

	const showResetAll = useMemo(() => {
		const filtersLength = Object.entries(filters).filter(([, value]) => (value && value.length > 0 ? true : false)).length;

		return filtersLength > 0 || searchTerm.length > 0;
	}, [filters, searchTerm])

	return (
		<div className="d-flex align-center">
			<div>
				<CustomInput
					value={searchTerm}
					onChange={(e: any) => setSearchTerm(e.target.value)}
					size="w100"
					label=""
					placeHolder={"Search by Name"}
					icon={<img src="/images/searchIcon.svg" alt="" />}
				/>
			</div>
			<MultiSelectFilter
				filterType="single"
				show={false}
				value={prefilterData.status}
				onChange={onFilterValueChange}
				type="status"
				label="Status"
				filters={filters}
				data={Object.entries(UserStatus).map(([key, value]) => ({
					label: capitalize(key),
					value: value,
				}))}
				onFilter={onFilter}
			/>
			<MultiInputFilter
				values={[prefilterData.fromDate, prefilterData.toDate]}
				onChange={onFilterValueChange}
				subTypes={["fromDate", "toDate"]}
				label="Registered Between"
				type="date"
				labels={["From Date", "To Date"]}
				filters={filters}
				onFilter={onFilter}
				show={false}
				showFooter
				types={["fromDate", "toDate"]}
			/>
			<MultiSelectFilter
				filterType="single"
				show={false}
				value={prefilterData.isPublished}
				onChange={onFilterValueChange}
				type="isPublished"
				label="Published"
				filters={filters}
				data={publishOptions}
				onFilter={onFilter}
			/>
			{Object.keys(moreFilterComponents).map((item: string) =>
				moreFilters.includes(item) ? moreFilterComponents[item] : null
			)}
			<MoreFilters
				values={moreFilters}
				setValues={onMoreFiltersUpdate}
				setVisible={setMoreVisible}
				visible={moreVisible}
				moreItems={moreItems}
			/>
			{showResetAll && (
				<p
					onClick={onFilterReset}
					style={{
						cursor: "pointer",
						color: "red",
						marginBottom: "0",
					}}
				>
					Reset All
				</p>
			)}

			<div style={{ marginLeft: "auto", marginRight: "0px" }}>
				<CustomFilter
					type="radio"
					label="Sort By"
					name="sortByField"
					options={sortByField}
					onChange={(event) => {
						const { value } = event.target;
						setPreFilterData({ ...prefilterData, sortByField: value });
					}}
					value={prefilterData?.sortByField}
					onReset={() => {
						setReset(true)
						setPreFilterData({ ...prefilterData, sortByField: "" });
					}}
					onUpdate={(query) => onFilter(query)}
					withSort
				/>
			</div>
		</div>
	);
};

export default Filters;
