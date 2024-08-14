import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePagesSectionModal } from "./modal";
import TableComponent from "./table-columns";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { CustomInput, PageHeader } from "../../../Atoms";
import { PagesSectionType } from "../../../../Modules/PagesSection/types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PagesContentPermissionsEnum } from "../../../../Modules/PagesSectionContent/permissions";
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
		isLink: true,
		text: "Site Pages",
		path: "/siteSettings/site-pages",
	},
	{
		isLink: false,
		text: "Site Pages Section",
	},
];

function SitePagesSection() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PagesSectionPermissionsEnum)
	permissionSlug.push(PagesContentPermissionsEnum.READ);
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as {
		[key in PagesSectionPermissionsEnum]: boolean
	} & {
		[PagesContentPermissionsEnum.READ]: boolean;
	};
	const { readSitePagesSection, createSitePagesSection, updateSitePagesSection } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new PagesSectionModule();

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [searchResult, setSearchResult] = useState<Partial<PagesSectionType[]>>();

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// event handle  to open and close modal
	const handleClick = () => {
		if (createSitePagesSection === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PagesSectionType) => {
		if (updateSitePagesSection === false) {
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
			const data = moduleData?.data as PagesSectionType[];
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
				heading="Site Pages Section"
				buttonText="Add new section"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createSitePagesSection === true ? true : false}
				filters={
					readSitePagesSection === true ? (
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
			/>
			{readSitePagesSection === true && (
				<TableComponent
					tableData={searchResult || moduleData?.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}
			{readSitePagesSection === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
			{currentEditType.openModal && (
				<SitePagesSectionModal
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
export default SitePagesSection;
