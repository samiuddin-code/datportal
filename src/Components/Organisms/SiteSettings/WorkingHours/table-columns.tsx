import { useMemo, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { WorkingHourType } from "../../../../Modules/WorkingHours/types";
import { WorkingHourPermissionSet } from "../../../../Modules/WorkingHours/permissions";
import { WorkingHoursModule } from "../../../../Modules/WorkingHours";
import { APIResponseObject } from "@modules/Common/common.interface";
import openingHourStyles from "./styles.module.scss"

interface _ActionComponentProps extends ActionComponentProps {
	record: WorkingHourType,
	permissions: { [key in WorkingHourPermissionSet]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteWorkingHour }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new WorkingHoursModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteWorkingHour === false) {
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
		}).catch((err) => {
			setActionState({
				...actionState,
				confirmLoading: false,
			});
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
			<span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span>
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

export default function TableComponent(props: TableProps & { tableData: WorkingHourType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in WorkingHourPermissionSet]: boolean };

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
			dataIndex: "title",
			key: "title",
			render: (title: string, record: WorkingHourType) => (
				<>
					<Typography color="dark-main" size="normal" weight="bold">
						{title}
					</Typography>
					<div className={openingHourStyles.container}>
						{record.hours.map((ele, index) => <div key={"opening-hours" + index + Math.random() * 9999}>
							<div className={openingHourStyles.wrapper}>
								<span className={openingHourStyles.title}>{ele.name}</span>
								{
									(ele.closed) ?
										<span className={openingHourStyles.closed}>Closed</span>
										:
										<>
											<span>{ele.open} - {ele.close}</span>
											<span>{ele.totalHours} hours</span>
										</>
								}
							</div>
						</div>)}
					</div>
				</>
			),
			width: "80%"
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: WorkingHourType) => (
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
				rowKey={(record: WorkingHourType) => `working-hour-${record.id}`}
			/>
		</div>
	);
}
