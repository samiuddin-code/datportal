import { SetStateAction, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { useDispatch } from "react-redux";

import { useDebounce } from "../../../../../helpers/useDebounce";
import { getOrganizationFilteredData } from "../../../../../Redux/Reducers/OrganizationReducer/action";
import CustomInput from "../../../../Atoms/Input";
import styles from "../styles.module.scss";
import { filtersType } from "./filters";
import MoreFilters, { MultiSelectFilter } from "../../../common___/moreFilters";
import { MultiInputFilter } from "../../../common___/multiInputFilters";
// import { OrganizationStatus } from "../../../../../helpers/commonEnums";
import { dispatchType } from "../../../../../Redux/Reducers/commonTypes";
import { CustomFilter } from "../../../../Atoms";

function Filters() {
	const dispatch = useDispatch<dispatchType>();
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const [moreFilters, setMoreFilters] = useState<string[]>([]);
	const [currentMoreFilter, setCurrentMoreFilters] = useState<string>("");
	const [moreVisible, setMoreVisible] = useState<boolean>(false);
	const [reset, setReset] = useState<boolean>(false);

	const initialFilterState = {
		title: "",
		status: "",
		email: "",
		phone: "",
		name: "",
		isPublished: "",
		fromDate: "",
		toDate: "",
		sortOrder: "",
		sortByField: "",
	};
	const [prefilterData, setPreFilterData] = useState<filtersType>(initialFilterState);
	const [filters, setFilters] = useState<filtersType>(initialFilterState);
	const publishOptions = [
		{ label: "Published", value: "true" },
		{ label: "Not Published", value: "false" },
	];

	const moreItems = [
		{ label: "Email", value: "email" },
		{ label: "Phone", value: "phone" },
	];

	const sortByField = [
		{ label: "Email", value: "email" },
		{ label: "Date Added", value: "addedDate" },
	];


	const onOrganizationSearch = useCallback((e: { target: { value: SetStateAction<string> } }) => {
		setSearchTerm(e.target.value);
	}, []);

	useEffect(() => {
		if (debouncedSearchTerm) {
			dispatch(
				getOrganizationFilteredData({ ...filters, name: debouncedSearchTerm })
			);
		}
	}, [debouncedSearchTerm, dispatch]);

	const onFilter = useCallback((values?: any) => {
		setFilters({
			...prefilterData,
			...values,
		});
		dispatch(getOrganizationFilteredData({
			...prefilterData,
			name: searchTerm,
			...values,
		}));
	}, [dispatch, prefilterData, searchTerm, setFilters]);

	const onFilterValueChange = useCallback((data: any, type: string) => {
		const filterData = { ...prefilterData, [type]: data };
		setPreFilterData(filterData);
		if (data?.length === 0) {
			if (type === "date") {
				filterData["fromDate"] = "";
				filterData["toDate"] = "";
			}
			setFilters(filterData);
			dispatch(getOrganizationFilteredData(filterData));
		}
	}, [dispatch, prefilterData]);

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
				filters={filters}
				data={[]}
				onFilter={onFilter}
				show={currentMoreFilter === "phone"}
				showFooter={false}
			/>
		)
	};

	const onFilterReset = () => {
		setSearchTerm("");
		setFilters(initialFilterState);
		setPreFilterData(initialFilterState);
		setMoreFilters([]);
		dispatch(getOrganizationFilteredData());
	};

	useEffect(() => {
		if (reset) {
			onFilter();
		}
		// after 2 seconds set reset clicked state to false
		const timer = setTimeout(() => {
			setReset(false)
		}, 2000);
		return () => clearTimeout(timer);
	}, [reset, onFilter]);

	const showResetAll = useMemo(() => {
		const filtersLength = Object.entries(filters).filter(([, value]) => (value && value.length > 0 ? true : false)).length;

		return filtersLength > 0 || searchTerm.length > 0;
	}, [filters, searchTerm])

	return (
		<div className={styles.filterWrap}>
			<div className={styles.search}>
				<CustomInput
					value={searchTerm}
					onChange={onOrganizationSearch}
					size="w100"
					label=""
					placeHolder={"Search"}
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
				data={Object.entries([]).map(([key, value]) => ({
					label: key,
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
				types={["date", "date"]}
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
				<div className={styles.resetWrap}>
					<p onClick={onFilterReset}>Reset</p>
				</div>
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
}
export default Filters;
