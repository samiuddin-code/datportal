import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteFAQModal } from "./modal";
import TableComponent from "./table-columns";
import { FAQModule } from "../../../../Modules/FAQs";
import { FAQTypes } from "../../../../Modules/FAQs/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import { message } from "antd";
import { useDebounce } from "../../../../helpers/useDebounce";
import { FAQCategoryModule } from "../../../../Modules/FAQCategory";
import { FAQCategoryTypes } from "../../../../Modules/FAQCategory/types";
import { FAQPermissionsEnum } from "../../../../Modules/FAQs/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import MultipleImages from "./MultipleImages";
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
		text: "FAQs",
	},
];

function SiteFAQSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(FAQPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in FAQPermissionsEnum]: boolean };
	const { readFaqs, createFaqs, updateFaqs } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new FAQModule(), []);
	const faqsCategoryModule = useMemo(() => new FAQCategoryModule(), []);

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [selectedFilters, setSelectedFilters] = useState<{
		title: string;
		faqsCategoryId: number;
		faqsCategorySlug: string;
	}>({
		title: "",
		faqsCategoryId: 0,
		faqsCategorySlug: "",
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});
	const [imagesModal, setImagesModal] = useState<{
		openModal: boolean;
		recordId: number;
		uploadedImages?: string[];
	}>({
		openModal: false,
		recordId: 0,
	});
	const [faqCategoryData, setFaqCategoryData] = useState<FAQCategoryTypes[]>([]);

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	// handle Current Operations
	const onHandleClick = () => {
		if (createFaqs === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: FAQTypes) => {
		if (updateFaqs === false) {
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
	const onImageClick = (record: FAQTypes) => {
		if (updateFaqs === false) {
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
		}).catch((err) => {
			message.error(err.response?.data?.message)
		});
	}, [module, moduleData]);

	const getFaqsCategory = useCallback(() => {
		faqsCategoryModule.getAllRecords({ perPage: 100 }).then((res) => {
			setFaqCategoryData(res.data.data);
		}).catch((err) => { });
	}, [faqsCategoryModule]);

	const onUpdate = useCallback(() => {
		const data = {
			title: debouncedSearchTerm || undefined,
			faqsCategoryId: selectedFilters?.faqsCategoryId || undefined,
			faqsCategorySlug: selectedFilters?.faqsCategorySlug || undefined,
		}

		reloadTableData(data);
	}, [selectedFilters, module])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const params = {
			page: page,
			perPage: pageSize,
			title: debouncedSearchTerm || undefined,
			faqsCategoryId: selectedFilters?.faqsCategoryId || undefined,
			faqsCategorySlug: selectedFilters?.faqsCategorySlug || undefined,
		};

		reloadTableData(params);
	}, [module, selectedFilters, moduleData]);

	// Search Effect 
	useEffect(() => {
		if (debouncedSearchTerm) {
			const data = {
				title: debouncedSearchTerm || undefined,
				faqsCategoryId: selectedFilters?.faqsCategoryId || undefined,
				faqsCategorySlug: selectedFilters?.faqsCategorySlug || undefined,
			}

			reloadTableData(data);
		} else {
			reloadTableData();
		}
	}, [debouncedSearchTerm]);

	useEffect(() => {
		getFaqsCategory();
	}, []);

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
				heading="FAQs"
				buttonText="Add New FAQ"
				onButtonClick={onHandleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createFaqs === true ? true : false}
				filters={
					readFaqs === true ? (
						<div>
							<div>
								<CustomInput
									placeHolder='Search...'
									icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
									size="w100"
									value={searchTerm}
									onChange={onSearch}
								/>
							</div>
							<div>
								<CustomFilter
									type="radio"
									label="Category"
									name="faqsCategoryId"
									value={String(selectedFilters?.faqsCategoryId)}
									options={faqCategoryData?.map((item) => ({
										label: item?.title,
										value: `${item.id}`
									}))}
									onChange={onSelected}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, faqsCategoryId: 0 })
									}}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Slug"
									name="faqsCategorySlug"
									value={String(selectedFilters?.faqsCategorySlug)}
									onChange={onSelected}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, faqsCategorySlug: "" })
									}}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readFaqs === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
						tableLoading={moduleData.loading}
						onEditIconClick={onEditIconClick}
						reloadTableData={reloadTableData}
						onImageClick={onImageClick}
					/>
					<Pagination
						total={moduleData?.meta?.total!}
						current={moduleData?.meta?.page!}
						defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
						pageSizeOptions={[10, 20, 50, 100]}
						onChange={onPaginationChange}
					/>
				</>
			)}
			{readFaqs === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteFAQModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onHandleClick}
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
export default SiteFAQSettings;
