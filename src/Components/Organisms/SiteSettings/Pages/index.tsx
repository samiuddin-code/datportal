import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePagesModal } from "./modal";
import TableComponent from "./table-columns";
import { PagesModule } from "../../../../Modules/Pages";
import { PagesTypes } from "../../../../Modules/Pages/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import styles from '../../Common/styles.module.scss'
import { PagesPermissionsEnum } from "../../../../Modules/Pages/permissions";
import { useDebounce } from "../../../../helpers/useDebounce";
import { message } from "antd";
import { LocationModule } from "../../../../Modules/Location";
import { PagesStatus } from "../../../../helpers/commonEnums";
import { LocationType } from "../../../../Modules/Location/types";
import { PropertyTypeModule } from "../../../../Modules/PropertyType";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { PropertyType } from "../../../../Modules/PropertyType/types";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
import { getPermissionSlugs } from "@helpers/common";

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
		text: "Pages",
	},
];

type SelectedFiltersTypes = {
	title: string;
	status: number;
	location: string[];
	category: string;
	type: string;
}

function SitePagesSettings() {
	// available permissions for the pages system module
	const permissionSlug = getPermissionSlugs(PagesPermissionsEnum)

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit" | "seo";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new PagesModule(), [])
	const locationModule = useMemo(() => new LocationModule(), [])
	const propertyTypeModule = useMemo(() => new PropertyTypeModule(), [])
	const propertyCategoryModule = useMemo(() => new PropertyCategoryModule(), [])

	const [searchTerm, setSearchTerm] = useState("");
	const [locationSearchTerm, setLocationSearchTerm] = useState("");

	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedLocationSearchTerm = useDebounce(locationSearchTerm, 500);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		title: "",
		status: 0,
		location: [],
		category: "",
		type: "",
	});

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});
	const [locationSearchResult, setLocationSearchResult] = useState<Partial<{
		data: LocationType[];
		loading: boolean
	}>>({
		loading: false,
		data: []
	});
	const [propertyTypeData, setPropertyTypeData] = useState<PropertyType[]>([]);
	const [propertyCategoryData, setPropertyCategoryData] = useState<PropertyCategoryType[]>([]);

	const [reset, setReset] = useState<boolean>(false);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	const onLocationSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setLocationSearchTerm(value);
	}

	// event handle  to open and close modal
	const handleClick = () => {
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PagesTypes) => {
		setcurrentEditType({
			...currentEditType,
			editType: "edit",
			recordId: record.id,
			openModal: true,
		});
	};

	const onSeoIconClick = (record: PagesTypes) => {
		setcurrentEditType({
			...currentEditType,
			editType: "seo",
			recordId: record.id,
			openModal: true,
		});
	};

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => {
			message.error(err.response?.data?.message)
		});
	}, [moduleData, module]);

	const onUpdate = useCallback(() => {
		const data = {
			title: debouncedSearchTerm || undefined,
			type: selectedFilters.type || undefined,
			category: selectedFilters.category || undefined,
			location: selectedFilters.location?.length > 0 ? [selectedFilters.location] : undefined,
			status: selectedFilters.status || undefined,
		}

		reloadTableData(data);
	}, [selectedFilters, debouncedSearchTerm])

	// NOTE: this is not a good way to do this, but it works for now
	useEffect(() => {
		if (debouncedSearchTerm) {
			onUpdate()
		} else {
			onUpdate()
		}
	}, [debouncedSearchTerm]);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const params = {
			page,
			perPage: pageSize,
			title: debouncedSearchTerm || undefined,
			type: selectedFilters.type || undefined,
			category: selectedFilters.category || undefined,
			location: selectedFilters.location?.length > 0 ? [selectedFilters.location] : undefined,
			status: selectedFilters.status || undefined,
		};

		reloadTableData(params);
	}, [moduleData, module]);

	// get the search result for the location
	const GetSearchResult = useCallback(() => {
		if (debouncedLocationSearchTerm) {
			setLocationSearchResult({ ...locationSearchResult, loading: true })

			locationModule.getAllRecords({ name: locationSearchTerm }).then((res) => {
				setLocationSearchResult({
					data: res.data?.data,
					loading: false
				})
			}).catch((error) => {
				setLocationSearchResult({ ...locationSearchResult, loading: false })
			})
		}
	}, [debouncedLocationSearchTerm, locationModule])

	useEffect(() => {
		GetSearchResult()
	}, [GetSearchResult])

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
		// get the property type data 
		propertyTypeModule.getAllRecords().then((res) => {
			setPropertyTypeData(res.data?.data);
		}).catch((error) => {
			message.error(error.response?.data?.message)
		})

		// get the property category data
		propertyCategoryModule.getAllRecords().then((res) => {
			setPropertyCategoryData(res.data?.data);
		}).catch((error) => {
			message.error(error.response?.data?.message)
		})
	}, [propertyTypeModule, propertyCategoryModule])

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Pages"
				buttonText="New Page"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={false}
				filters={
					<div>
						<div>
							<CustomInput
								placeHolder='Search Page...'
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
								label="Status"
								name="status"
								value={selectedFilters.status > 0 ? String(selectedFilters.status) : ""}
								onChange={onSelected}
								options={Object.entries(PagesStatus).map(([key, value]) => ({
									label: key,
									value: value
								}))}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, status: 0 })
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
								options={locationSearchResult.data?.map((item) => ({
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
									setLocationSearchTerm("")
								}}
								onUpdate={onUpdate}
								// START: For search
								loading={locationSearchResult.loading}
								searchTerm={locationSearchTerm}
								onSearch={onLocationSearch}
							// END: For search
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Property Type"
								name="type"
								value={String(selectedFilters.type)}
								onChange={onSelected}
								options={propertyTypeData?.map((item) => ({
									label: item.localization[0].title,
									value: String(item.id)
								}))}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, type: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
						<div>
							<CustomFilter
								type="radio"
								label="Property Category"
								name="category"
								value={String(selectedFilters.category)}
								onChange={onSelected}
								options={propertyCategoryData?.map((item) => ({
									label: item.localization[0].title,
									value: String(item.id)
								}))}
								onReset={() => {
									setReset(true)
									setSelectedFilters({ ...selectedFilters, category: "" })
								}}
								onUpdate={onUpdate}
							/>
						</div>
					</div>
				}
			/>

			<div className={styles.antdTableWrapper}>
				<TableComponent
					tableData={moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					onSeoIconClick={onSeoIconClick}
				/>
			</div>

			<Pagination
				total={moduleData?.meta?.total}
				current={moduleData?.meta?.page}
				defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
				pageSizeOptions={[10, 20, 50, 100]}
				onChange={onPaginationChange}
			/>
			{currentEditType.openModal && (
				<SitePagesModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => reloadTableData({
						page: moduleData?.meta?.page,
						perPage: moduleData?.meta?.perPage
					})}
					onCancel={handleClick}
					openModal={currentEditType.openModal}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SitePagesSettings;
