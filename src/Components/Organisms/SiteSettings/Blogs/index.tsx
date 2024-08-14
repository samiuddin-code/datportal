import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteBlogModal } from "./modal";
import TableComponent from "./table-columns";
import { BlogsModule } from "../../../../Modules/Blogs";
import { BlogsTypes } from "../../../../Modules/Blogs/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import { BlogsPermissionsEnum } from "../../../../Modules/Blogs/permissions";
import { RootState } from "../../../../Redux/store";
import { useSelector } from "react-redux";
import MultipleImages from "./MultipleImages";
import { useDebounce } from "../../../../helpers/useDebounce";
import { BlogsCategory, BlogsStatus } from "../../../../helpers/commonEnums";
import { BlogsCategoryModule } from "../../../../Modules/BlogsCategory";
import { BlogsCategoryType } from "../../../../Modules/BlogsCategory/types";
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
		text: "Blogs",
	},
];

function SiteBlogsSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(BlogsPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in BlogsPermissionsEnum]: boolean };
	const { readBlogs, createBlogs, updateBlogs, updateBlogsSEO } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit" | "seo";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const [imagesModal, setImagesModal] = useState<{
		openModal: boolean;
		recordId: number;
		uploadedImages?: string[];
	}>({
		openModal: false,
		recordId: 0,
	});

	const module = useMemo(() => new BlogsModule(), [])
	const blogsCategory = useMemo(() => new BlogsCategoryModule(), [])

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});
	const [categoryData, setCategoryData] = useState<BlogsCategoryType[]>([])

	const [selectedFilters, setSelectedFilters] = useState<{
		status: number;
		category: number;
		type: number;
	}>({
		status: 0,
		category: 0,
		type: 0,
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// event handle  to open and close modal
	const handleClick = () => {
		if (createBlogs === false) {
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
		if (updateBlogs === false) {
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

	const onSeoIconClick = (record: BlogsTypes) => {
		if (updateBlogsSEO === false) {
			message.error("You don't have permission to update the SEO record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			editType: "seo",
			recordId: record.id,
			openModal: true,
		});
	};

	const onImageClick = (record: BlogsTypes) => {
		if (updateBlogs === false) {
			message.error("You don't have permission to update record");
			return;
		}
		setImagesModal({
			...imagesModal,
			openModal: true,
			recordId: record.id,
		});
	};

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	}, [moduleData, module]);

	const getBlogsCategory = useCallback(() => {
		blogsCategory.getAllRecords().then((res) => {
			setCategoryData(res.data.data)
		}).catch((err) => { });
	}, [blogsCategory])

	const onUpdate = useCallback(() => {
		const data = {
			category: selectedFilters?.category || undefined,
			status: selectedFilters?.status || undefined,
			title: debouncedSearchTerm || undefined,
			type: selectedFilters?.type || undefined,
		}

		// get the data from the api
		reloadTableData(data);
	}, [selectedFilters, module, debouncedSearchTerm])

	useEffect(() => {
		if (debouncedSearchTerm) {
			reloadTableData({ title: debouncedSearchTerm });
		} else {
			reloadTableData();
		}
	}, [debouncedSearchTerm]);

	useEffect(() => {
		getBlogsCategory()
	}, [])

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		//setModuleData({ ...moduleData, loading: true });

		const params = {
			page,
			perPage: pageSize,
			title: debouncedSearchTerm || undefined,
			category: selectedFilters?.category || undefined,
			status: selectedFilters?.status || undefined,
			type: selectedFilters?.type || undefined,
		};

		reloadTableData(params);

		// module.getAllRecords(params).then((res) => {
		// 	setModuleData({ ...res.data, loading: false });
		// }).catch((err) => {
		// 	setModuleData({ ...moduleData, loading: false });
		// });
	}, [moduleData, module, selectedFilters, debouncedSearchTerm, reloadTableData]);

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
				heading="Blogs"
				buttonText="Add New Blog"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createBlogs === true ? true : false}
				filters={
					readBlogs === true ? (
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
									options={Object.entries(BlogsStatus).map(([key, value]) => ({
										label: key,
										value: value
									}))}
									onChange={onSelected}
									value={String(selectedFilters?.status)}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, status: 0 })
									}}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Category"
									name="category"
									options={categoryData.map((item) => ({
										label: item.localization[0].title,
										value: `${item.id}`
									}))}
									onChange={onSelected}
									value={String(selectedFilters?.category)}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, category: 0 })
									}}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Type"
									name="type"
									options={Object.entries(BlogsCategory).map(([key, value]) => ({
										label: key,
										value: value
									}))}
									onChange={onSelected}
									value={String(selectedFilters?.type)}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, type: 0 })
									}}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>

			{readBlogs === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						onSeoIconClick={onSeoIconClick}
						onImageClick={onImageClick}
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

			{readBlogs === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<SiteBlogModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={() => reloadTableData({
						page: moduleData?.meta?.page,
						perPage: moduleData?.meta?.perPage,
					})}
					onCancel={handleClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}

			{imagesModal.openModal && (
				<MultipleImages
					recordId={imagesModal.recordId}
					onCancel={() => {
						setImagesModal({
							...imagesModal,
							openModal: false,
						});
					}}
					openModal={imagesModal.openModal}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SiteBlogsSettings;
