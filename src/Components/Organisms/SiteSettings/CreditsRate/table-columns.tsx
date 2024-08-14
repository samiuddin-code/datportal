import { Table, Tag } from "antd";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { CreditsRate } from "../../../../Modules/CreditsRate/types";
import { convertDate } from "../../../../helpers/dateHandler";
import { CountryTypes } from "../../../../Modules/Country/types";

export default function TableComponent(props: TableProps & { tableData: CreditsRate[] }) {
	const { tableData, tableLoading } = props;

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "60px",
		},
		{
			title: "Credits",
			dataIndex: "credits",
			key: "credits",
			render: (credits: string) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{credits}
				</Typography>
			),
		},
		{
			title: "Rate",
			dataIndex: "rate",
			key: "rate",
			render: (rate: number, record: CreditsRate) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{`${record.currency.symbol} ${rate.toFixed(2)}`}
				</Typography>
			),
		},
		{
			title: "Rate Per Credit",
			dataIndex: "ratePerCredit",
			key: "ratePerCredit",
			render: (ratePerCredit: number) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{ratePerCredit.toFixed(4)}
				</Typography>
			),
		},
		{
			title: "Country",
			dataIndex: "country",
			key: "country",
			render: (country: Partial<CountryTypes>) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{country.name}
				</Typography>
			),
		},

		{
			title: "Active",
			dataIndex: "isActive",
			key: "isActive",
			render: (isActive: boolean | undefined, record: CreditsRate) => (
				<div>
					{isActive === true ? <Tag color="#00A884">Active</Tag> : <Tag color="#f50">Inactive</Tag>}
				</div>
			),
		},
		{
			title: "Date Added",
			dataIndex: "addedDate",
			key: "addedDate",
			render: (addedDate: string | number | Date) => {
				return (
					<Typography color="dark-sub" size="sm">
						{convertDate(addedDate, "dd M,yy-t")}
					</Typography>
				);
			},
			width: "200px",
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={false}
				loading={tableLoading}
				rowKey={(record: CreditsRate) => `credits-rate-${record.id}`}
			/>
		</div>
	);
}
