import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { SiteAmenityModal } from "./modal";
import TableComponent from "./table-columns";
import { AmenityModule } from "../../../../Modules/Amenity";
import { Amenity } from "../../../../Modules/Amenity/types";
import { CustomInput, PageHeader } from "../../../Atoms";
import { useDebounce } from "../../../../helpers/useDebounce";
import { AmenityPermissionsEnum } from "../../../../Modules/Amenity/permissions";
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
		text: "Amenities",
	},
];

function SiteAmenitySettings() {
	// available permissions for this page
	const permissionSlug = getPermissionSlugs(AmenityPermissionsEnum)

	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AmenityPermissionsEnum]: boolean };
	const { readAmenity, createAmenity, updateAmenity } = permissions;

	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new AmenityModule();

	const [moduleData, setModuleData] = useState<any>({
		isLoading: false,
		error: {},
		data: [],
	});

	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	const [searchResult, setSearchResult] = useState<Partial<Amenity[]>>();

	const onSearch = (event: FormEvent<HTMLInputElement>) => {
		const value = event.currentTarget.value
		setSearchTerm(value);
	}

	// event handle  to open and close modal
	const handleClick = () => {
		if (createAmenity === false) {
			message.error("You don't have permission to create new record");
			return;
		}
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const onEditIconClick = (record: Amenity) => {
		if (updateAmenity === false) {
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
			const data = moduleData?.data as Amenity[];
			const result = data.filter((ele) => {
				return ele.localization[0].title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
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
				heading="Amenities"
				buttonText="Add New Amenity"
				onButtonClick={handleClick}
				breadCrumbData={breadCrumbsData}
				showAdd={createAmenity === true ? true : false}
				filters={
					readAmenity === true ? (
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
			{readAmenity === true && (
				<TableComponent
					tableData={searchResult || moduleData.data}
					tableLoading={moduleData.loading}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
				/>
			)}

			{readAmenity === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}

			{currentEditType.openModal && (
				<SiteAmenityModal
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
export default SiteAmenitySettings;
