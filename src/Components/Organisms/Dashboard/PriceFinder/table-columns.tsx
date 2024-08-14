import { Table } from "antd";
import Typography from "../../../Atoms/Headings";
import { TableProps } from "../../Common/common-types";
import { convertDate } from "../../../../helpers/dateHandler";
// import { DLDTransactionTypes } from "../../../../Modules/DLD-Transaction/types"
// import { DLDRentTransactionTypes } from "../../../../Modules/DLD-Rent-Transaction/types";
import { CalenderIcon } from "../../../Icons";

export default function TableComponent(props: Partial<TableProps> & { tableData: any[], isTypeSale: boolean }) {
	const { tableData, tableLoading, emptyText, isTypeSale } = props;

	// Sale Table Columns
	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "60px",
		},
		{
			title: "Transaction Group",
			dataIndex: "trans_group_en",
			key: "trans_group_en",
			render: (trans_group_en: string) => (
				<Typography color="dark-sub" size="sm">
					{trans_group_en || ""}
				</Typography>
			),
		},
		{
			title: "Property",
			dataIndex: "property",
			key: "property",
			render: (property: string, record: any) => (
				<>
					<Typography color="dark-sub" size="sm">
						{`Type: ${record?.property_type_en || ""}`}
					</Typography>
					<Typography color="dark-sub" size="sm" className="my-1">
						{`Sub-Type: ${record?.property_sub_type_en || ""}`}
					</Typography>
					<Typography color="dark-sub" size="sm">
						{`Usage: ${record?.property_usage_en || ""}`}
					</Typography>
				</>
			),
		},
		{
			title: "Area",
			dataIndex: "area_name_en",
			key: "area_name_en",
			render: (area_name_en: string) => (
				<Typography color="dark-sub" size="sm">
					{area_name_en || ""}
				</Typography>
			),
		},
		{
			title: "Building Name",
			dataIndex: "building_name_en",
			key: "building_name_en",
			render: (building_name_en: string) => (
				<Typography color="dark-sub" size="sm">
					{building_name_en || ""}
				</Typography>
			),
		},
		{
			title: "Property Name",
			dataIndex: "project_name_en",
			key: "project_name_en",
			render: (project_name_en: string) => (
				<Typography color="dark-sub" size="sm">
					{project_name_en || ""}
				</Typography>
			),
		},
		{
			title: "Transaction Amount",
			dataIndex: "transactionAmount",
			key: "transactionAmount",
			render: (transactionAmount: number) => (
				<Typography color="dark-sub" size="sm">
					{`AED ${Intl.NumberFormat("en", { notation: "standard" }).format(transactionAmount) || ""}`}
				</Typography>
			),
			width: '17%'
		},
		{
			title: "Transaction Date",
			dataIndex: "transactionDate",
			key: "transactionDate",
			render: (transactionDate: string) => (
				<Typography color="dark-sub" size="sm">
					{convertDate(transactionDate, "dd M,yy") || ""}
				</Typography>
			),
		},
	];

	// Rent Table Columns
	const rentColumns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "6%",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (name: string, record: any) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{`Area: ${record.area_name_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`ID: ${record.area_id}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Actual Area: ${record.actual_area}` || "N/A"}
					</Typography>

					<div className="d-flex mt-1">
						<CalenderIcon className="mr-2" />
						<Typography color="dark-sub" size="sm">
							{`Added: ${convertDate(record.addedDate, "dd MM yy")}` || "N/A"}
						</Typography>
					</div>

					<div className="d-flex mt-1">
						<CalenderIcon className="mr-2" />
						<Typography color="dark-sub" size="sm">
							{`Transaction: ${convertDate(record.transactionDate, "dd MM yy")}` || "N/A"}
						</Typography>
					</div>
				</>
			),
		},
		{
			title: "Ejari",
			dataIndex: "ejari_bus_property_type_en",
			key: "ejari_bus_property_type_en",
			render: (ejari_bus_property_type_en: string, record: any) => (
				<>
					<Typography color="dark-main" size="sm">
						{`ID: ${record.ejari_property_type_id}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Type: ${record.ejari_property_type_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Sub Type: ${record.ejari_property_sub_type_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Sub Type ID: ${record.ejari_property_sub_type_id}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Bus Type: ${ejari_bus_property_type_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Bus Type ID: ${record.ejari_bus_property_type_id}` || "N/A"}
					</Typography>
				</>
			),
		},
		{
			title: "Project",
			dataIndex: "project_name_en",
			key: "project_name_en",
			render: (project_name_en: string, record: any) => (
				<>
					{record?.project_name_en && (
						<Typography color="dark-main" size="sm">
							{`Name: ${project_name_en}` || "N/A"}
						</Typography>
					)}

					{record?.master_project_en && (
						< Typography color="dark-main" size="sm" >
							{`Master: ${record.master_project_en}` || "N/A"}
						</Typography>
					)}

					{record?.project_number && (
						<Typography color="dark-main" size="sm">
							{`Number: ${record.project_number}` || "N/A"}
						</Typography>
					)}

					{record?.property_usage_en && (
						<Typography color="dark-main" size="sm">
							{`Usage: ${record.property_usage_en}` || "N/A"}
						</Typography>
					)}

					{record?.no_of_prop && (
						<Typography color="dark-main" size="sm">
							{`No. of Properties: ${record.no_of_prop}` || "N/A"}
						</Typography>
					)}
				</>

			),
		},
		{
			title: "Contract",
			dataIndex: "contract_amount",
			key: "contract_amount",
			render: (contract_amount: number, record: any) => (
				<>
					<Typography color="dark-main" size="sm">
						{`Amount (AED): ${Intl.NumberFormat("en").format(contract_amount)}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Annual Amount (AED): ${Intl.NumberFormat("en").format(record.annual_amount)}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`ID: ${record.contract_id}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Start Date: ${convertDate(record.contract_start_date, "dd-mm-yy")}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`End Date: ${convertDate(record.contract_end_date, "dd-mm-yy")}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Reg Type: ${record.contract_reg_type_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Reg Type ID: ${record.contract_reg_type_id}` || "N/A"}
					</Typography>
				</>
			),
		},
		{
			title: "Nearest",
			dataIndex: "nearest_landmark_en",
			key: "nearest_landmark_en",
			render: (nearest_landmark_en: string, record: any) => (
				<>
					<Typography color="dark-main" size="sm">
						{`Landmark: ${nearest_landmark_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Metro: ${record.nearest_metro_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Mall: ${record.nearest_mall_en}` || "N/A"}
					</Typography>
				</>
			),
		},
		{
			title: "Others",
			dataIndex: "other_details_en",
			key: "other_details_en",
			render: (other_details_en: string, record: any) => (
				<>
					<Typography color="dark-main" size="sm">
						{`Status: ${record.status === 1 ? "Active" : "Inactive"}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Tenant Type: ${record.tenant_type_en}` || "N/A"}
					</Typography>

					<Typography color="dark-main" size="sm">
						{`Tenant Type ID: ${record.tenant_type_id}` || "N/A"}
					</Typography>
				</>
			),
		}
	];

	return (
		<Table
			dataSource={tableData}
			columns={isTypeSale ? columns : rentColumns}
			pagination={false}
			scroll={{ x: 991 }}
			loading={tableLoading}
			rowKey={(record: any) => `dld-transaction-resp-table-${record.id}`}
			locale={{ emptyText: emptyText }}
		/>
	);
}
