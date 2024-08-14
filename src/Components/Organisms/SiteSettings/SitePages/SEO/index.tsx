import { useCallback, useEffect, useMemo, useState } from "react";
import SiteSettingsTemplate from "../../../../Templates/SiteSettings";
import { StaticPageSEOModal } from "./modal";
import TableComponent from "./table-columns";
import { PageHeader, Pagination } from "../../../../Atoms";
import { StaticPageSEOModule } from "../../../../../Modules/StaticPageSEO";
import { StaticPageSEOType } from "../../../../../Modules/StaticPageSEO/types";
import { useSearchParams } from "react-router-dom";
import { Empty, message, Select } from "antd";
import { SitePagesModule } from "../../../../../Modules/SitePages";
import { StaticPageSEOPermissionsEnum } from "../../../../../Modules/StaticPageSEO/permissions";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../Redux/store";
import { ErrorCode403 } from "../../../../Atoms/ErrorCodes";
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
		text: "Static Pages SEO",
	},
];

function StaticPageSEOSettings() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(StaticPageSEOPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in StaticPageSEOPermissionsEnum]: boolean };
	const { readStaticPageSEO, createStaticPageSEO, updateStaticPageSEO } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = useMemo(() => new StaticPageSEOModule(), [])
	const sitePagesModule = useMemo(() => new SitePagesModule(), [])
	const [searchParams, setSearchParams] = useSearchParams();
	const pageId = Number(searchParams.get('pageId'))

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [sitePagesModuleData, setSitePagesModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	// event handle  to open and close modal
	const handleClick = () => {
		if (createStaticPageSEO === false) {
			message.error("You don't have permission to create new record, please contact your admin.");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: StaticPageSEOType) => {
		if (updateStaticPageSEO === false) {
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
		if (!pageId || pageId === 0) return;
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords({ sitePageId: pageId }).then((res) => {
			setModuleData({ ...moduleData, ...res.data });
		}).catch((err) => { });
	};

	const getSitePagesData = () => {
		setSitePagesModuleData({ ...sitePagesModuleData, loading: true });
		sitePagesModule.getAllRecords().then((res) => {
			setSitePagesModuleData(res.data);
		}).catch((err) => { });
	}

	useEffect(() => {
		getSitePagesData();
	}, []);

	useEffect(() => {
		reloadTableData();
	}, [pageId]);

	const onPaginationChange = useCallback((page: number, pageSize: number) => {
		setModuleData({ ...moduleData, loading: true });

		const params = {
			page,
			perPage: pageSize,
		};

		module.getAllRecords(params).then((res) => {
			setModuleData({ ...res.data, loading: false });
		}).catch((err) => {
			setModuleData({ ...moduleData, loading: false });
		});
	}, [moduleData, module]);

	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="SEO of"
				buttonText="Add New SEO"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createStaticPageSEO === true ? true : false}
			>
				<div>
					<Select
						onChange={(value) => setSearchParams({ pageId: value?.toString() })}
						className="w-200"
						defaultValue={pageId || null}
						placeholder="Choose page"
						loading={sitePagesModuleData?.loading}
						options={sitePagesModuleData?.data?.map((ele: any) => {
							return {
								label: ele?.title,
								value: ele?.id
							}
						})}
					/>
				</div>
			</PageHeader>
			{(!pageId) ? (
				<Empty
					image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
					imageStyle={{
						height: 150,
					}}
					description={
						<span>
							Please select a page to view its content
						</span>
					}
				/>
			) : (
				<>
					{readStaticPageSEO === true && (
						<>
							<TableComponent
								tableData={moduleData?.data}
								tableLoading={moduleData?.loading}
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
					{readStaticPageSEO === false && (
						<ErrorCode403
							mainMessage="You don't have permission to view this data"
						/>
					)}
					{currentEditType.openModal && (
						<StaticPageSEOModal
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
export default StaticPageSEOSettings;
