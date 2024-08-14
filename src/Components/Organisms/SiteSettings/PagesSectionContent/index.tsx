import { useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SitePagesSectionContentModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { PagesSectionContentModule } from "../../../../Modules/PagesSectionContent";
import { PagesSectionContentType } from "../../../../Modules/PagesSectionContent/types";
import { useSearchParams } from "react-router-dom";
import { Empty, message, Select } from "antd";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { PagesContentPermissionsEnum } from "../../../../Modules/PagesSectionContent/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
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
		isLink: true,
		text: "Site Pages",
		path: "/siteSettings/site-pages",
	},
	{
		isLink: true,
		text: "Pages Section",
		path: "/siteSettings/pages-section",
	},
	{
		isLink: false,
		text: "Site Pages Section Content",
	},
];

function SitePagesSectionContentSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(PagesContentPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PagesContentPermissionsEnum]: boolean };
	const { readSitePagesContent, createSitePagesContent, updateSitePagesContent } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new PagesSectionContentModule(), [])
	const sectionModule = useMemo(() => new PagesSectionModule(), [])
	const [searchParams, setSearchParams] = useSearchParams();
	let sectionId = Number(searchParams.get('sectionId'))

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [sectionModuleData, setSectionModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	// event handle  to open and close modal
	const handleClick = () => {
		if (createSitePagesContent === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: PagesSectionContentType) => {
		if (updateSitePagesContent === false) {
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
		module.getAllRecordsByCategory(sectionId).then((res) => {
			setModuleData({ ...moduleData, ...res.data });
		}).catch((err) => { });
	};

	const getSectionData = () => {
		setSectionModuleData({ ...sectionModuleData, loading: true });
		sectionModule.getAllRecords().then((res) => {
			setSectionModuleData(res.data);
		}).catch((err) => { });
	}

	useEffect(() => {
		getSectionData();
	}, []);

	useEffect(() => {
		reloadTableData();
	}, [sectionId]);

	// const onPaginationChange = useCallback((page: number, pageSize: number) => {
	// 	setModuleData({ ...moduleData, loading: true });

	// 	const params = {
	// 		page,
	// 		perPage: pageSize,
	// 	};

	// 	module
	// 		.getAllRecords(params)
	// 		.then((res) => {
	// 			setModuleData({ ...res.data, loading: false });
	// 		})
	// 		.catch((err) => {
	// 			setModuleData({ ...moduleData, loading: false });
	// 		});
	// }, [moduleData, module]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Section Content of"
				buttonText="Add New Content"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createSitePagesContent === true ? true : false}
			>
				<div>
					<Select
						onChange={(value) => setSearchParams({ sectionId: value.toString() })}
						className="w-200"
						defaultValue={sectionId}
						placeholder="Choose section"
						loading={sectionModuleData.loading}
						options={sectionModuleData?.data?.map((ele: any) => {
							return {
								label: ele.title,
								value: ele.id
							}
						})}
					/>
				</div>
			</PageHeader>
			{(!sectionId) ? (
				<Empty
					image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
					imageStyle={{
						height: 150,
					}}
					description={
						<span>
							Please select a page section to edit its content
						</span>
					}
				/>
			) : (
				<>
					{readSitePagesContent === true && (
						<TableComponent
							tableData={moduleData?.data.pagesContent}
							tableLoading={moduleData.loading}
							onEditIconClick={onEditIconClick}
							reloadTableData={reloadTableData}
						/>
					)}
					{readSitePagesContent === false && (
						<ErrorCode403
							mainMessage="You don't have permission to view this data"
						/>
					)}
					{/* <Pagination
						total={moduleData?.meta?.total}
						current={moduleData?.meta?.page}
						defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
						pageSizeOptions={[10, 20, 50, 100]}
						onChange={onPaginationChange}
					/> */}
					{currentEditType.openModal && (
						<SitePagesSectionContentModal
							record={currentEditType.recordId}
							type={currentEditType.editType}
							reloadTableData={reloadTableData}
							onCancel={handleClick}
							openModal={currentEditType.openModal}
							permissions={permissions}
						/>
					)}
				</>
			)}
		</SiteSettingsTemplate>
	);
}
export default SitePagesSectionContentSettings;
