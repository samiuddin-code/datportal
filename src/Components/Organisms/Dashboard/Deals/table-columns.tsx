import { Empty, Spin } from "antd";
import ComponentStyles from "./styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { PropertyDealTypes } from "../../../../Modules/Properties/types";
import DealCard from "./card";

export default function TableComponent(props: TableProps & { tableData: PropertyDealTypes[] }) {
	const { tableData, onEditIconClick, reloadTableData, tableLoading } = props;

	return (
		<div style={{ width: "100%", display: "flex" }}>
			{tableLoading ? (
				<Spin size="large" style={{ margin: "auto" }} />
			) : (
				<>
					{tableData?.length > 0 ? (
						<div className={ComponentStyles.cards}>
							{tableData.map((deal) => (
								<DealCard
									key={`deals-${deal.id}`}
									data={deal}
									reloadTableData={reloadTableData}
									onEditIconClick={onEditIconClick}
								/>
							))}
						</div>
					) : (
						<Empty description="No deals found" style={{ margin: "auto" }} />
					)}
				</>
			)}
		</div>
	);
}
