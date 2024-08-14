import { useEffect, useState, useMemo, useCallback } from "react";
import { PageHeader } from "../../../Atoms";
import { Empty } from "antd";
import Skeletons from "../../Skeletons";
import Layout from "../../../Templates/Layout";
import TableComponent from "./table-columns";
import { SavedSearchesListingTypes } from "../../../../Modules/SaveSearches/types";
import { SaveSearchesModule } from "../../../../Modules/SaveSearches";


const breadCrumbsData = [
	{
		text: "Home",
		isLink: true,
		path: "/",
	},
	{
		isLink: false,
		text: "Saved Searches",
	},
];

const AgentSavedSearches = () => {
	const [moduleData, setModuleData] = useState<{ data?: SavedSearchesListingTypes | []; loading: boolean }>({
		loading: false,
		data: [],
	});

	const saveSearchesModule = useMemo(() => new SaveSearchesModule(), []);

	const getModuleData = useCallback(async () => {
		setModuleData({ ...moduleData, loading: true });
		saveSearchesModule.getAllRecords().then((res) => {
			setModuleData({ data: res.data?.data, loading: false });
		}).catch((err) => {
			setModuleData({ loading: false });
		});
	}, [saveSearchesModule]);

	useEffect(() => {
		getModuleData();
	}, []);

	return (
		<Layout>
			<PageHeader
				heading="Saved Searches"
				breadCrumbData={breadCrumbsData}
			/>
			<div className="d-flex overflow-hidden">
				<div className="d-flex flex-column w-100">
					<div className="overflow-auto">
						<TableComponent
							tableData={moduleData?.data}
							tableLoading={moduleData.loading}
							reloadTableData={getModuleData}
						/>
					</div>
				</div>
			</div>
		</Layout >
	);
};

export default AgentSavedSearches;
