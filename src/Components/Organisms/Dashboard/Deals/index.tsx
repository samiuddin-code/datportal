import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../../Templates/Layout";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
// import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PropertyDealsModule } from "../../../../Modules/Properties";
import { PropertyDealPermissionsEnum } from "../../../../Modules/Properties/permissions";
import { PropertyDealTypes } from "../../../../Modules/Properties/types";
import { DealsModal } from "./modal";
import { Tabs } from "antd";
import { capitalize, getPermissionSlugs } from "../../../../helpers/common";
import { TabKeysEnum } from "./types";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Deals",
	},
];

type ModuleDataTypes = {
	loading: boolean;
	error: any;
	data: PropertyDealTypes[];
};

function PropertyDeals() {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(PropertyDealPermissionsEnum)

	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PropertyDealPermissionsEnum]: boolean };

	const [modalType, setModalType] = useState<{
		type: "new" | "edit";
		record: PropertyDealTypes | {};
		openModal: boolean;
	}>({
		type: "new",
		record: {},
		openModal: false,
	});

	// property deals module
	const module = useMemo(() => new PropertyDealsModule(), []);
	const [activeTab, setActiveTab] = useState<{
		key: keyof typeof TabKeysEnum
		label: string
	}>({ key: "active", label: "Active" });

	//const [searchParams] = useSearchParams();

	// const propertyId = searchParams.get("propertyId");

	const [moduleData, setModuleData] = useState<ModuleDataTypes>({
		loading: false,
		error: {},
		data: [],
	});

	const onCancelClick = () => {
		setModalType({
			...modalType,
			openModal: !modalType.openModal,
			type: "new",
		});
	};

	const onEditIconClick = (record: PropertyDealTypes) => {
		setModalType({
			...modalType,
			type: "edit",
			record: record,
			openModal: true,
		});
	};

	const reloadTableData = useCallback((query?: any) => {
		setModuleData({ ...moduleData, loading: true });

		module.getAllRecords(query).then((response) => {
			setModuleData({
				...moduleData,
				loading: false,
				data: response.data?.data
			});
		}).catch((error) => {
			setModuleData({
				...moduleData,
				loading: false,
				error: error
			});
		});
	}, []);

	const onTabChange = useCallback(() => {
		if (activeTab.key) {
			let query: { isPublished?: boolean; isExpired?: boolean; } = {};

			switch (activeTab.key) {
				case "active": {
					query = {
						isPublished: true,
						isExpired: false,
					}
					break;
				}
				case "draft": {
					query = { isPublished: false }
					break;
				}
				case "expired": {
					query = {
						isPublished: true,
						isExpired: true,
					}
					break;
				}
			}
			reloadTableData(query)
		}
	}, [activeTab.key]);

	useEffect(() => {
		onTabChange();
	}, [onTabChange]);

	// useEffect(() => {
	// 	if (propertyId) {
	// 		setcurrentEditType({
	// 			...currentEditType,
	// 			openModal: true,
	// 		});
	// 	}
	// }, [propertyId]);

	return (
		<Layout permissionSlug={permissionSlug}>
			<div>
				<PageHeader
					heading="Deals"
					buttonText="Add Deal"
					onButtonClick={onCancelClick}
					breadCrumbData={breadCrumbsData}
					showAdd={permissions.createPropertyDeals === true ? true : false}
				/>
				<Tabs
					type="card"
					onTabClick={(key) => {
						setActiveTab({
							key: key as keyof typeof TabKeysEnum,
							label: capitalize(key)
						})
					}}
				>
					{Object.keys(TabKeysEnum).map((key) => (
						<Tabs.TabPane tab={capitalize(key)} key={key}>
							<TableComponent
								tableData={moduleData.data}
								tableLoading={moduleData.loading}
								onEditIconClick={onEditIconClick}
								reloadTableData={reloadTableData}
							/>
						</Tabs.TabPane>
					))}
				</Tabs>
				{modalType.openModal && (
					<DealsModal
						type={modalType.type}
						reloadTableData={reloadTableData}
						onCancel={onCancelClick}
						openModal={modalType.openModal}
						permissions={permissions}
						record={modalType.record as PropertyDealTypes}
						tabKey={activeTab.key}
					/>
				)}
			</div>
		</Layout>
	);
}
export default PropertyDeals;
