import { useEffect, useState, useMemo, useCallback, FormEvent } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../Atoms";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import { UserAlertsModule } from "../../../../Modules/UserAlerts";
import { UserAlertsFiltersTypes, UserAlertsResponseObject } from "../../../../Modules/UserAlerts/types";
import styles from '../../Common/styles.module.scss'
import { Bathrooms, Bedrooms, PropertyPriceType } from "../../../../helpers/propertyEnums";
import { capitalize, isNumber } from "../../../../helpers/common";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
import MoreCustomFilters from "../../../Atoms/CustomFilter/more";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { LocationModule } from "../../../../Modules/Location";
import { useDebounce } from "../../../../helpers/useDebounce";
import { LocationType } from "../../../../Modules/Location/types";
import { PropertyType } from "../../../../Modules/PropertyType/types";
import { PropertyTypeModule } from "../../../../Modules/PropertyType";
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
		text: "User Alerts",
	},
];

const SiteUserAlerts = () => {
	const [moduleData, setModuleData] = useState<Partial<UserAlertsResponseObject>>({
		loading: false,
		data: [],
	});

	const module = useMemo(() => new UserAlertsModule(), []);
	const propertyCategory = useMemo(() => new PropertyCategoryModule(), [])
	const locationModule = useMemo(() => new LocationModule(), [])
	const propertyTypeModule = useMemo(() => new PropertyTypeModule(), [])

	const [selectedFilters, setSelectedFilters] = useState<Partial<UserAlertsFiltersTypes>>({
		userIds: []
	});
	const [reset, setReset] = useState<boolean>(false);
	const [categoryData, setCategoryData] = useState<PropertyCategoryType[]>([]);
	const [moreFilters, setMoreFilters] = useState<CheckboxValueType[]>([]);
	const [propertyTypeData, setPropertyTypeData] = useState<PropertyType[]>([]);

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const [searchResult, setSearchResult] = useState<Partial<{
		data: LocationType[];
		loading: boolean
	}>>({
		loading: false,
		data: []
	});

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// Name of the fields or filters to validate
	const fieldsToValidate = [
		{
			name: "userIds",
			full_name: "User ID"
		},
		{
			name: "minArea",
			full_name: "Min Area"
		},
		{
			name: "maxArea",
			full_name: "Max Area"
		},
		{
			name: "minPrice",
			full_name: "Min Price"
		},
		{
			name: "maxPrice",
			full_name: "Max Price"
		},
	]

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		const filter = fieldsToValidate.find((field) => field.name === name)

		// if the field is in the fieldsToValidate array then validate it
		if (filter?.name) {
			// validate the field
			const isValidNumber = isNumber(value);

			// if the value is not a valid number then return
			if (!isValidNumber) {
				return message.error(`${filter.full_name} must be a number`);
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
		module.getAllRecords().then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		});

		propertyCategory.getAllRecords().then((res) => {
			setCategoryData(res.data.data)
		}).catch((err) => {
			setCategoryData([])
		})

		propertyTypeModule.getAllRecords().then((res) => {
			setPropertyTypeData(res.data.data)
		}).catch((err) => {
			setPropertyTypeData([])
		})
	}, [module, propertyCategory, propertyTypeModule]);

	useEffect(() => {
		getModuleData();
	}, []);

	const onUpdate = useCallback(() => {
		const data = {
			category: selectedFilters?.category || undefined,
			rentalPeriod: selectedFilters?.rentalPeriod || undefined,
			minPrice: selectedFilters?.minPrice || undefined,
			maxPrice: selectedFilters?.maxPrice || undefined,
			minArea: selectedFilters?.minArea || undefined,
			maxArea: selectedFilters?.maxArea || undefined,
			bedrooms: selectedFilters?.bedrooms || undefined,
			bathrooms: selectedFilters?.bathrooms || undefined,
			userIds: selectedFilters?.userIds?.length! > 0 ? [selectedFilters?.userIds] : undefined,
			location: selectedFilters?.location?.length! > 0 ? selectedFilters?.location : undefined,
			type: selectedFilters?.type || undefined,
		}

		// get the data from the api
		module.getAllRecords(data).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		})
	}, [selectedFilters, module])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const params = {
			page: page,
			perPage: pageSize,
			category: selectedFilters?.category || undefined,
			rentalPeriod: selectedFilters?.rentalPeriod || undefined,
			minPrice: selectedFilters?.minPrice || undefined,
			maxPrice: selectedFilters?.maxPrice || undefined,
			minArea: selectedFilters?.minArea || undefined,
			maxArea: selectedFilters?.maxArea || undefined,
			bedrooms: selectedFilters?.bedrooms || undefined,
			bathrooms: selectedFilters?.bathrooms || undefined,
			userIds: selectedFilters?.userIds?.length! > 0 ? [selectedFilters?.userIds] : undefined,
			location: selectedFilters?.location?.length! > 0 ? selectedFilters?.location : undefined,
			type: selectedFilters?.type || undefined,
		};

		module.getAllRecords(params).then((res) => {
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

	const GetSearchResult = useCallback(() => {
		if (debouncedSearchTerm) {
			setSearchResult({ ...searchResult, loading: true })

			locationModule.getAllRecords({ name: debouncedSearchTerm }).then((res) => {
				setSearchResult({
					data: res.data?.data,
					loading: false
				})
			}).catch((error) => {
				setSearchResult({ ...searchResult, loading: false })
			})
		}
	}, [debouncedSearchTerm, locationModule])

	useEffect(() => {
		GetSearchResult()
	}, [GetSearchResult])

	const moreFiltersOptions = [
		{
			label: "Min Price",
			value: "minPrice",
		},
		{
			label: "Max Price",
			value: "maxPrice",
		},
		{
			label: "Min Area",
			value: "minArea",
		},
		{
			label: "Max Area",
			value: "maxArea",
		},
		{
			label: "User ID",
			value: "userIds",
		},
	]

	const moreComponents: any = {
		userIds: (
			<CustomFilter
				type="input"
				label="User ID"
				name="userIds"
				value={selectedFilters?.userIds ? String(selectedFilters?.userIds) : ""}
				onChange={onSelected}
				onReset={() => {
					setReset(true)
					setSelectedFilters({ ...selectedFilters, userIds: [] })
				}}
				onUpdate={onUpdate}
				defaultVisible={true}
			/>
		),
		minPrice: (
			<CustomFilter
				type="input"
				label="Min Price"
				name="minPrice"
				value={selectedFilters?.minPrice ? String(selectedFilters?.minPrice) : ""}
				onChange={onSelected}
				onReset={() => {
					setReset(true)
					setSelectedFilters({ ...selectedFilters, minPrice: 0 })
				}}
				onUpdate={onUpdate}
				defaultVisible={true}
			/>
		),
		maxPrice: (
			<CustomFilter
				type="input"
				label="Max Price"
				name="maxPrice"
				value={selectedFilters?.maxPrice ? String(selectedFilters?.maxPrice) : ""}
				onChange={onSelected}
				onReset={() => {
					setReset(true)
					setSelectedFilters({ ...selectedFilters, maxPrice: 0 })
				}}
				onUpdate={onUpdate}
				defaultVisible={true}
			/>
		),
		minArea: (
			<CustomFilter
				type="input"
				label="Min Area"
				name="minArea"
				value={selectedFilters?.minArea ? String(selectedFilters?.minArea) : ""}
				onChange={onSelected}
				onReset={() => {
					setReset(true)
					setSelectedFilters({ ...selectedFilters, minArea: 0 })
				}}
				onUpdate={onUpdate}
				defaultVisible={true}
			/>
		),
		maxArea: (
			<CustomFilter
				type="input"
				label="Max Area"
				name="maxArea"
				value={selectedFilters?.maxArea ? String(selectedFilters?.maxArea) : ""}
				onChange={onSelected}
				onReset={() => {
					setReset(true)
					setSelectedFilters({ ...selectedFilters, maxArea: 0 })
				}}
				onUpdate={onUpdate}
				defaultVisible={true}
			/>
		),
	}

	return (
		<SiteSettingsTemplate>
			<PageHeader
				heading="User Alerts"
				breadCrumbData={breadCrumbsData}
				filters={
					<div>
						<div>
							<CustomFilter
								type="radio"
								label="Category"
								name="category"
								options={categoryData.map((item) => ({
									label: item.localization[0].title,
									value: item.slug,
								}))}
								value={selectedFilters?.category || ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, category: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Rental Period"
								name="rentalPeriod"
								options={Object.entries(PropertyPriceType).map(([key, value]) => ({
									label: capitalize(key),
									value: value,
								}))}
								value={selectedFilters?.rentalPeriod || ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, rentalPeriod: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Property Type"
								name="type"
								options={propertyTypeData?.map((item) => ({
									label: item.localization[0].title,
									value: item.slug!,
								}))}
								value={selectedFilters?.type || ""}
								onChange={onSelected}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, type: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="multiSelect"
								label="Location"
								name="location"
								withSearch={true}
								options={searchResult.data?.map((item) => ({
									label: item.localization[0].name,
									value: item.url,
								})) || []}
								onChange={(value) => {
									setSelectedFilters({
										...selectedFilters,
										location: value
									})
								}}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, location: [] })
									// reset the search term
									setSearchTerm("")
								}}
								onUpdate={onUpdate}
								// START: For search
								loading={searchResult.loading}
								searchTerm={searchTerm}
								onSearch={onSearch}
							// END: For search
							/>
						</div>
						<div>
							<CustomFilter
								type="multiSelect"
								label="Bedrooms"
								name="bedrooms"
								options={Object.entries(Bedrooms).map(([key, value]) => ({
									label: capitalize(key?.replace("_", " ")),
									value: value,
								}))}
								onChange={(value) => {
									setSelectedFilters({
										...selectedFilters,
										bedrooms: value
									})
								}}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, bedrooms: [] })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="multiSelect"
								label="Bathrooms"
								name="bathrooms"
								options={Object.entries(Bathrooms).map(([key, value]) => ({
									label: capitalize(key?.replace("_", " ")),
									value: value,
								}))}
								onChange={(value) => {
									setSelectedFilters({
										...selectedFilters,
										bathrooms: value
									})
								}}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, bathrooms: [] })
								}}
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
								onChange={(value) => {
									setMoreFilters(value as any)
								}}
								value={moreFilters}
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

export default SiteUserAlerts;
