import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteBlogCategoryModal } from "./modal";
import TableComponent from "./table-columns";
import { BlogsCategoryModule } from "../../../../Modules/BlogsCategory";
import { BlogsTypes } from "../../../../Modules/Blogs/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import { useDebounce } from "../../../../helpers/useDebounce";
import { BlogsCategoryStatus } from "../../../../helpers/commonEnums";
import { BlogsCategoryPermissionsEnum } from "../../../../Modules/BlogsCategory/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
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
		text: "Blogs Category",
	},
];

type SelectedFiltersTypes = {
	status: number;
}

function SiteBlogsCategorySettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(BlogsCategoryPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BlogsCategoryPermissionsEnum]: boolean };
	const { readBlogsCategory, createBlogsCategory, updateBlogsCategory, updateBlogsCategorySEO } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit" | "seo";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new BlogsCategoryModule();

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
		status: 0,
	});
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

	// event handle  to open and close modal
	const handleClick = () => {
		if (createBlogsCategory === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: BlogsTypes) => {
		if (updateBlogsCategory === false) {
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

	const onSeoIconClick = (record: BlogsTypes) => {
		if (updateBlogsCategorySEO === false) {
			message.error("You don't have permission to update this record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			editType: "seo",
			recordId: record.id,
			openModal: true,
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
		const data = {
			title: debouncedSearchTerm || undefined,
			status: selectedFilters.status || undefined,
		}

		reloadTableData(data);
	}, [selectedFilters, debouncedSearchTerm])


	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		const params = {
			page,
			perPage: pageSize,
			title: debouncedSearchTerm || undefined,
			status: selectedFilters.status || undefined,
		};

		reloadTableData(params);
	}, [selectedFilters, debouncedSearchTerm]);

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
				heading="Blogs Category"
				buttonText="New Blog Category"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createBlogsCategory === true ? true : false}
				filters={
					readBlogsCategory === true ? (
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
									label="Status"
									name="status"
									value={String(selectedFilters.status)}
									options={Object.entries(BlogsCategoryStatus).map(([key, value]) => ({
										label: key,
										value: value
									}))}
									onChange={onSelected}
									onReset={() => onReset("status", 0)}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readBlogsCategory === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						onSeoIconClick={onSeoIconClick}
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
			{readBlogsCategory === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteBlogCategoryModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={handleClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SiteBlogsCategorySettings;
