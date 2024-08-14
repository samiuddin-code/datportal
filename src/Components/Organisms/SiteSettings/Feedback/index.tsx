import { useEffect, useState } from "react";
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import TableComponent from "./table-columns";
import { PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { FeedbackPermissionsEnum } from "../../../../Modules/Feedback/permissions";
import { FeedbackModule } from "../../../../Modules/Feedback";
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
		text: "Feedback",
	},
];

function Feedback() {
	// available permissions for this module
	const permissionSlug = getPermissionSlugs(FeedbackPermissionsEnum)
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in FeedbackPermissionsEnum]: boolean };
	const { readFeedback } = permissions;
	const [isLoading, setIsLoading] = useState(false);
	const [currentEditType, setcurrentEditType] = useState<{
		editType: "new" | "edit";
		recordId: number;
		openModal: boolean;
	}>({
		editType: "new",
		recordId: 0,
		openModal: false,
	});

	const module = new FeedbackModule();

	const [moduleData, setModuleData] = useState<any>({
		data: [],
	});

	const onCancelClick = () => {
		setcurrentEditType({
			...currentEditType,
			openModal: !currentEditType.openModal,
			editType: "new",
		});
	};

	const reloadTableData = () => {
		setIsLoading(true)
		setModuleData({ ...moduleData, loading: true });
		module.getAllRecords().then((res) => {
			console.log(res.data, 'sads')
			setModuleData(res);
			setIsLoading(false);
		}).catch((err) => {
			setIsLoading(false);
			return
		});
	};

	useEffect(() => {
		reloadTableData();
	}, []);


	return (
		<SiteSettingsTemplate permissionSlug={permissionSlug}>
			<PageHeader
				heading="Feedback"
				buttonText="Add Feedback"
				onButtonClick={onCancelClick}
				breadCrumbData={breadCrumbsData}
			/>
			{readFeedback === true && (
				<TableComponent
					tableData={moduleData.data.data}
					tableLoading={isLoading}
					onEditIconClick={() => { }}
					reloadTableData={reloadTableData}
				/>
			)}
			{readFeedback === false && (
				<ErrorCode403
					mainMessage="You don't have permission to view this data"
				/>
			)}
		</SiteSettingsTemplate>
	);
}
export default Feedback;
