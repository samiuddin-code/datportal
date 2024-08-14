import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePagesModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomButton, CustomInput, PageHeader } from "../../../Atoms";
import { SitePagesModule } from "../../../../Modules/SitePages";
import { SitePagesType } from "../../../../Modules/SitePages/types";
import { SitePagesSectionRelationModal } from "./sitePagesSectionModal";
import { useDebounce } from "../../../../helpers/useDebounce";
import { SitePagesPermissionsEnum } from "../../../../Modules/SiteSettings/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { StaticPageSEOPermissionsEnum } from "../../../../Modules/StaticPageSEO/permissions";
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
		text: "Site Pages",
	},
];

function SitePages() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(SitePagesPermissionsEnum)
	// add additional permissions for this module / page
	permissionSlug.push(
		PagesSectionPermissionsEnum.UPDATE,
		PagesSectionPermissionsEnum.READ,
		PagesSectionPermissionsEnum.CREATE,
		StaticPageSEOPermissionsEnum.READ
	);
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as {
		[key in SitePagesPermissionsEnum]: boolean
	} & {
		[PagesSectionPermissionsEnum.UPDATE]: boolean;
		[PagesSectionPermissionsEnum.READ]: boolean;
		[PagesSectionPermissionsEnum.CREATE]: boolean;
		[StaticPageSEOPermissionsEnum.READ]: boolean;
	}
	const {
		readSitePages, createSitePages, updateSitePages,
		updateSitePagesSection, readSitePagesSection
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

	const [editPageSection, setEditPageSection] = useState<{
		recordId: number;
		openModal: boolean;
		recordData?: any
	}>({
		recordId: 0,
		openModal: false,
		recordData: {}
	});

	const module = new SitePagesModule();

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [searchResult, setSearchResult] = useState<Partial<SitePagesType[]>>();

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// event handle  to open and close modal
	const handleClick = () => {
		if (createSitePages === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const handleCancelClick = () => {
		setEditPageSection({
			...currentEditType,
			openModal: !editPageSection.openModal
		});
	};

	const onEditIconClick = (record: SitePagesType) => {
		if (updateSitePages === false) {
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

	const onManageSectionClick = (record: SitePagesType) => {
		if (updateSitePagesSection === false) {
			message.error("You don't have permission to manage page sections");
			return;
		}
		setEditPageSection({
			...editPageSection,
			recordId: record.id,
			recordData: record,
			openModal: true,
		});
	};

	const reloadTableData = () => {
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords().then((res) => {
			setModuleData(res.data);
		}).catch((err) => { });
	};

	useEffect(() => {
		reloadTableData();
	}, []);

	// Search functionality for the table
	const assignSearchResult = useCallback(() => {
		if (debouncedSearchTerm) {
			const data = moduleData?.data as SitePagesType[];
			const result = data.filter((ele) => {
				return ele.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			});
			setSearchResult(result);
		} else {
			setSearchResult(undefined);
		}
	}, [debouncedSearchTerm, moduleData?.data]);

	useEffect(() => {
		assignSearchResult();
	}, [assignSearchResult]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Site Pages"
				buttonText="Add new page"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createSitePages === true ? true : false}
				filters={
					readSitePages === true ? (
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
						</div>
					) : null
				}
			>
				{readSitePagesSection === true && (
					<a href="/siteSettings/pages-section">
						<CustomButton>Manage Sections</CustomButton>
					</a>
				)}
			</PageHeader>
			{readSitePages === true && (
				<TableComponent
					tableData={searchResult || moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					onManageSectionClick={onManageSectionClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{readSitePages === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SitePagesModal
					record={currentEditType.recordId}
					type={currentEditType.editType}
					reloadTableData={reloadTableData}
					onCancel={handleClick}
					openModal={currentEditType.openModal}
					permissions={permissions}
				/>
			)}

			{editPageSection.openModal && (
				<SitePagesSectionRelationModal
					record={editPageSection.recordId}
					pageData={editPageSection.recordData}
					type="edit"
					reloadTableData={reloadTableData}
					onCancel={handleCancelClick}
					openModal={editPageSection.openModal}
					permissions={permissions}
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default SitePages;
