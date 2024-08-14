import { useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePropertyBulkUploadJobModal } from "./modal";
import TableComponent from "./table-columns";
import { BiometricsBulkUploadJobModule } from "../../../../Modules/BulkUploadFormat/Job";
import { BulkUploadJobTypes } from "../../../../Modules/BulkUploadFormat/Job/types";
import { PageHeader, Pagination } from "../../../Atoms";
import { message } from "antd";
import { useDebounce } from "../../../../helpers/useDebounce";
import { BulkUploadJobPermissionsEnum } from "../../../../Modules/BulkUploadFormat/Job/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { getPermissionSlugs } from "@helpers/common";
// import styles from "./styles.module.scss";

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
		text: "Biometrics Bulk Upload Job",
	},
];

// type SelectedFiltersTypes = {
// 	type: string;
// 	slug: string;
// 	locationUrl: string;
// 	country: number;
// }

function BiometricsBulkUploadJobSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(BulkUploadJobPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BulkUploadJobPermissionsEnum]: boolean };
	const {
		readBiometricsJob, createBiometricsJob,
		updateBiometricsJob
	} = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new BiometricsBulkUploadJobModule(), [])

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
	// 	type: "",
	// 	slug: "",
	// 	country: 0,
	// 	locationUrl: "",
	// });

	// const [reset, setReset] = useState<boolean>(false);

	// const onSelected = (event: any) => {
	// 	const { name, value } = event?.target

	// 	// set the selected value in the state 
	// 	setSelectedFilters({
	// 		...selectedFilters,
	// 		[name]: value
	// 	});
	// }

	// const onSearch = (event: FormEvent<HTMLInputElement>) => {
	// 	const value = event.currentTarget.value
	// 	setSearchTerm(value);
	// }

	// const onUpdate = useCallback(() => {
	// 	const data = {
	// 		type: selectedFilters.type || undefined,
	// 		slug: selectedFilters.slug || undefined,
	// 		locationUrl: selectedFilters.locationUrl ? [selectedFilters.locationUrl] : undefined,
	// 		country: selectedFilters.country > 0 ? selectedFilters.country : undefined,
	// 	}

	// 	// get the data from the api
	// 	module.getAllRecords(data).then((response) => {
	// 		setModuleData({
	// 			...moduleData,
	// 			loading: false,
	// 			data: response.data?.data,
	// 		});
	// 	});
	// }, [selectedFilters, module])

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const onCancelClick = () => {
		if (createBiometricsJob === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: BulkUploadJobTypes) => {
		if (updateBiometricsJob === false) {
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

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => {
			message.error(err.response?.data?.message)
		});
	}, [moduleData, module]);

	// Search Effect 
	useEffect(() => {
		if (debouncedSearchTerm) {
			reloadTableData({ name: debouncedSearchTerm });
		} else {
			reloadTableData();
		}
	}, [debouncedSearchTerm]);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });
		const params = {
			page,
			perPage: pageSize,
			// type: selectedFilters.type || undefined,
			// slug: selectedFilters.slug || undefined,
			// locationUrl: selectedFilters.locationUrl ? [selectedFilters.locationUrl] : undefined,
			// country: selectedFilters.country > 0 ? selectedFilters.country : undefined,
			name: debouncedSearchTerm || undefined,
		};

		module.getAllRecords(params).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ ...moduleData, loading: false });
		});
	}, [moduleData, module]);

	// useEffect(() => {
	// 	if (reset) {
	// 		onUpdate();
	// 	}
	// 	// after 2 seconds set reset clicked state to false
	// 	const timer = setTimeout(() => {
	// 		setReset(false)
	// 	}, 2000);
	// 	return () => clearTimeout(timer);
	// }, [reset, selectedFilters, onUpdate])

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Biometrics Bulk Upload Job"
				buttonText="New Upload Job"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createBiometricsJob === true ? true : false}
			// filters={
			// 	<div>
			// 		<div>
			// 			<CustomInput
			// 				placeHolder='Search...'
			// 				icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
			// 				size="w100"
			// 				value={searchTerm}
			// 				onChange={onSearch}
			// 			/>
			// 		</div>
			// 		<div>
			// 			<CustomFilter
			// 				type="input"
			// 				label="Slug"
			// 				name="slug"
			// 				value={String(selectedFilters?.slug)}
			// 				onChange={onSelected}
			// 				onReset={() => {
			// 					setReset(true)
			// 					setSelectedFilters({ ...selectedFilters, slug: "" })
			// 				}}
			// 				onUpdate={onUpdate}
			// 			/>
			// 		</div>
			// 		<div>
			// 			<CustomFilter
			// 				type="input"
			// 				label="Location Url"
			// 				name="locationUrl"
			// 				value={String(selectedFilters?.locationUrl)}
			// 				onChange={onSelected}
			// 				onReset={() => {
			// 					setReset(true)
			// 					setSelectedFilters({ ...selectedFilters, locationUrl: "" })
			// 				}}
			// 				onUpdate={onUpdate}
			// 			/>
			// 		</div>
			// 	</div>
			// }
			/>
			{readBiometricsJob === true && (
				<>
					<TableComponent
						tableData={moduleData?.data}
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
			{readBiometricsJob === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SitePropertyBulkUploadJobModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => reloadTableData({
						page: moduleData?.meta?.page,
						perPage: moduleData?.meta?.perPage,
						// type: selectedFilters.type || undefined,
						// slug: selectedFilters.slug || undefined,
						// locationUrl: selectedFilters.locationUrl ? [selectedFilters.locationUrl] : undefined,
						// country: selectedFilters.country > 0 ? selectedFilters.country : undefined,
					})}
					onCancel={onCancelClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default BiometricsBulkUploadJobSettings;
