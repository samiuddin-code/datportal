import { useEffect, useState, useMemo, useCallback } from "react";
import { PageHeader } from "../../../../Atoms";
import { Empty, message } from "antd";
import Skeletons from "../../../Skeletons";
import Layout from "../../../../Templates/Layout";
import TableComponent from "./table-columns";
import { TransactionsPermissionsEnum } from "../../../../../Modules/Transactions/permissions";
import { OrganizationModule } from "../../../../../Modules/Organization";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../Redux/store";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Eligible Credits For Refund",
	},
];

const CreditsEligibleForRefund = () => {
	// available permissions for the properties page
	const permissionSlug = getPermissionSlugs(TransactionsPermissionsEnum)

	const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);

	const [moduleData, setModuleData] = useState<{ data?: any[] | []; loading: boolean }>({
		loading: false,
		data: [],
	});


	const [credits, setCredits] = useState<number>(0);

	const organizationModule = useMemo(() => new OrganizationModule(), []);

	const getModuleData = useCallback(async () => {
		setModuleData({ loading: true });
		const organizationId: number = loggedInUserData?.data?.Organization?.id;
		// if (loggedInUserData?.data && organizationId) {
		// 	organizationModule.getEligibleCredit(organizationId).then((res) => {

		// 		let totalEligibleCredits = 0;
		// 		if (res.data) {
		// 			res.data?.data.forEach((item: any) => {
		// 				if (item.refundCredits) {
		// 					totalEligibleCredits += item.refundCredits;
		// 				}
		// 			});
		// 		}

		// 		setCredits(totalEligibleCredits);

		// 		setModuleData({ data: res.data?.data, loading: false });
		// 	}).catch((err) => {
		// 		setModuleData({ loading: false });
		// 	});
		// }
	}, [organizationModule, loggedInUserData?.data]);

	const onCreditRefund = () => {
		const organizationId: number = loggedInUserData?.data?.Organization?.id;
		// organizationModule.refundCredits(organizationId).then((res) => {
		// 	message.success(res.data?.message);
		// 	getModuleData();
		// }).catch((err) => {
		// 	message.error(err?.response?.data?.message);
		// });
	}

	useEffect(() => {
		getModuleData();
	}, [getModuleData]);

	return (
		<Layout permissionSlug={permissionSlug}>
			<PageHeader
				heading="Eligible Credits For Refund"
				breadCrumbData={breadCrumbsData}
				buttonWithoutIcon
				buttonTooltip={credits < 10 ? "You need at least 10 eligible credits to request for refund" : null}
				buttonText="Refund Credits"
				onButtonClick={() => onCreditRefund()}
				buttonLoading={moduleData.loading}
				buttonDisable={credits < 10 ? true : false}
			/>

			<div className="d-flex justify-end">
				<p className="text-success">Total Refundable Credits: {credits}</p>
			</div>

			<div className="d-flex overflow-hidden">
				<div className="d-flex flex-column w-100">
					<div className="overflow-auto">
						<div>
							{moduleData.loading ? (
								<Skeletons items={5} fullWidth />
							) : (
								<TableComponent
									tableData={moduleData?.data}
									tableLoading={moduleData.loading}
									emptyText={
										<Empty
											image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
											imageStyle={{
												height: 150,
											}}
											description={
												<span>
													No Eligible Credits For Refund Found
												</span>
											}
										>
										</Empty>
									}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CreditsEligibleForRefund;
