import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteFAQCategoryModal } from "./modal";
import TableComponent from "./table-columns";
import { FAQCategoryModule } from "../../../../Modules/FAQCategory";
import { FAQTypes } from "../../../../Modules/FAQs/types";
import { CustomFilter, CustomInput, PageHeader, Pagination } from "../../../Atoms";
import { message } from "antd";
import { useDebounce } from "../../../../helpers/useDebounce";
import { FAQCategoryPermissionsEnum } from "../../../../Modules/FAQCategory/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { getPermissionSlugs, isNumber } from "../../../../helpers/common";

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
		text: "FAQ Categories",
	},
];

function SiteFAQCategorySettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(FAQCategoryPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in FAQCategoryPermissionsEnum]: boolean };
	const { readFaqsCategory, createFaqsCategory, updateFaqsCategory } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new FAQCategoryModule();

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [selectedFilters, setSelectedFilters] = useState<{
		title: string;
		isRoot: boolean | undefined;
		parentId: number;
	}>({
		title: "",
		isRoot: undefined,
		parentId: 0,
	});
	const [reset, setReset] = useState<boolean>(false);

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	const onSelected = (event: any) => {
		const { name, value } = event?.target

		if (name === "parentId") {
			const isValidNumber = isNumber(value);
			if (!isValidNumber) {
				return message.error("Parent Id must be a number");
			}
		}

		// set the selected value in the state 
		setSelectedFilters({
			...selectedFilters,
			[name]: value
		});
	}

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	// handle Current Operations
	const onHandleClick = () => {
		if (createFaqsCategory === false) {
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
		if (updateFaqsCategory === false) {
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

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords(query).then((res) => {
			setModuleData(res.data);
		}).catch((err) => {
			message.error(err.response?.data?.message)
		});
	}, [module, moduleData]);

	const onUpdate = useCallback(() => {
		const data = {
			title: debouncedSearchTerm || undefined,
			isRoot: selectedFilters.isRoot || undefined,
			parentId: selectedFilters.parentId || undefined,
		}

		reloadTableData(data);
	}, [selectedFilters, debouncedSearchTerm])

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const params = {
			page: page,
			perPage: pageSize,
			title: debouncedSearchTerm || undefined,
			isRoot: selectedFilters.isRoot || undefined,
			parentId: selectedFilters.parentId || undefined,
		};

		reloadTableData(params);
	}, [module, moduleData, selectedFilters, reloadTableData, debouncedSearchTerm]);

	// Search Effect 
	useEffect(() => {
		if (debouncedSearchTerm) {
			const data = {
				title: debouncedSearchTerm || undefined,
				isRoot: selectedFilters.isRoot || undefined,
				parentId: selectedFilters.parentId || undefined,
			}

			reloadTableData(data);
		} else {
			reloadTableData();
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
				heading="FAQ Categories"
				buttonText="Add New Category"
				onButtonClick={onHandleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createFaqsCategory === true ? true : false}
				filters={
					readFaqsCategory === true ? (
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
									label="Root Category"
									name="isRoot"
									value={String(selectedFilters?.isRoot)}
									options={[
										{ label: "Yes", value: "true" },
										{ label: "No", value: "false" },
									]}
									onChange={onSelected}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, isRoot: undefined })
									}}
									onUpdate={onUpdate}
								/>
							</div>
							<div>
								<CustomFilter
									type="input"
									label="Parent ID"
									name="parentId"
									value={selectedFilters?.parentId > 0 ? String(selectedFilters?.parentId) : ""}
									onChange={onSelected}
									onReset={() => {
										setReset(true)
										setSelectedFilters({ ...selectedFilters, parentId: 0 })
									}}
									onUpdate={onUpdate}
								/>
							</div>
						</div>
					) : null
				}
			/>
			{readFaqsCategory === true && (
				<>
					<TableComponent
						tableData={moduleData.data}
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
			{readFaqsCategory === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SiteFAQCategoryModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={onHandleClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SiteFAQCategorySettings;
