import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PublicHolidayType } from "../../../../Modules/PublicHoliday/types";
import { PublicHolidayPermissionSet } from "../../../../Modules/PublicHoliday/permissions";
import { PublicHolidayModule } from "../../../../Modules/PublicHoliday";
import { APIResponseObject } from "@modules/Common/common.interface";
import { convertDate } from "@helpers/dateHandler";
import { handleError } from "@helpers/common";

interface _ActionComponentProps extends ActionComponentProps {
	record: PublicHolidayType,
	permissions: { [key in PublicHolidayPermissionSet]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deletePublicHoliday }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new PublicHolidayModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deletePublicHoliday === false) {
			message.error("You don't have permission to delete this record, please contact your admin.");
			setActionState({
				...actionState,
				openPopConfirm: false,
			});
			return;
		}

		module.deleteRecord(record.id).then((res) => {
			setActionState({
				...actionState,
				openPopConfirm: false,
				confirmLoading: false,
			});
			reloadTableData();
			message.success(res.data?.message)
		}).catch((err) => {
			setActionState({
				...actionState,
				confirmLoading: false,
			});
			let errors = handleError(err);
			message.error(errors);
		});
	};

	const showPopconfirm = () => {
		setActionState({
			...actionState,
			openPopConfirm: true,
		});
	};

	return (
		<div className={styles.actions}>
			{/* <span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span> */}
			<Popconfirm
				open={actionState.openPopConfirm}
				placement="top"
				title="Are you sure?"
				onConfirm={handleDelete}
				onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
				okButtonProps={{ loading: actionState.confirmLoading }}
				okText="Yes"
				cancelText="No"
				onOpenChange={(visible) => {
					if (!visible) {
						setActionState({ ...actionState, openPopConfirm: false });
					}
				}}
			>
				<DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
			</Popconfirm>
		</div>
	);
};

export default function TableComponent(props: TableProps & { tableData: PublicHolidayType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in PublicHolidayPermissionSet]: boolean };

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: {}, index: number) => index + 1,
			width: "5%",
		},
		{
			title: "Title",
			dataIndex: "localization",
			key: "localization",
			render: (text: string, record: any) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record.title}
				</Typography>
			),
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (text: string, record: PublicHolidayType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{convertDate(text, 'M dd,yy')}
					</Typography>
				</>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: PublicHolidayType) => (
				<ActionComponent
					record={record}
					onEditIconClick={onEditIconClick}
					reloadTableData={reloadTableData}
					permissions={permissions}
				/>
			),
		},
	];

	return (
		<div className={styles.antdTableWrapper}>
			<Table
				sticky
				dataSource={tableData}
				columns={columns}
				pagination={{
					current: meta?.page,
					total: meta?.total,
					hideOnSinglePage: true,
					pageSize: meta?.perPage,
					onChange(page, pageSize) {
						reloadTableData({ ...filters, page: page, perPage: pageSize })
					},
				}}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: PublicHolidayType) => `public-holiday-${record.id}`}
			/>
		</div>
	);
}
