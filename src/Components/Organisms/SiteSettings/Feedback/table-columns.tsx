import { Rate, Table, Typography } from "antd";
import styles from "../Common/styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { FeedbackType } from "../../../../Modules/Feedback/types";
const { Paragraph } = Typography;

export default function TableComponent(props: TableProps & { tableData: FeedbackType[] }) {
	const { tableData, tableLoading } = props;

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: FeedbackType) => (
				record?.AddedBy ? <Typography color="dark-main" style={{fontWeight: 'bold', color: 'var(--color-dark-main)'}}>
					{record?.AddedBy?.firstName + " " + record?.AddedBy?.lastName}
				</Typography> : ""
			),
		},
		{
			title: "Rating",
			dataIndex: "rating",
			key: "rating",
			render: (text: number) => (
				<>
					<Rate value={text} disabled />
				</>
			),
		},
		{
			title: "Comment",
			dataIndex: "comment",
			key: "comment",
			render: (text: string) => (
				<>
					<Paragraph ellipsis={{ rows: 1, expandable: true, symbol: 'more' }} style={{color: 'var(--color-dark-main)'}}>
						{text}
					</Paragraph>
				</>
			),
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				// pagination={t}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: FeedbackType) => `feedback-${record.id}`}
			/>
		</div>
	);
}
