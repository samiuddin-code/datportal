import { useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { LeaveTypeType } from "../../../../Modules/LeaveType/types";
import { LeaveTypePermissionSet } from "../../../../Modules/LeaveType/permissions";
import { LeaveTypeModule } from "../../../../Modules/LeaveType";
import { APIResponseObject } from "@modules/Common/common.interface";
import { capitalize } from "@helpers/common";

interface _ActionComponentProps extends ActionComponentProps {
	record: LeaveTypeType,
	permissions: { [key in LeaveTypePermissionSet]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteLeaveType }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new LeaveTypeModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteLeaveType === false) {
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

export default function TableComponent(props: TableProps & { tableData: LeaveTypeType[], meta: APIResponseObject["meta"], filters: any }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in LeaveTypePermissionSet]: boolean };

	const module = new LeaveTypeModule();
	const onIsPublishedChange = (checked: boolean, recordId: number) => {
		return module.updateRecord({ isPublished: checked }, recordId);
	};

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
			title: "Slug",
			dataIndex: "slug",
			key: "slug",
			render: (text: string, record: LeaveTypeType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.slug}
					</Typography>
				</>
			),
		},
		{
			title: "Paid",
			dataIndex: "isPaid",
			key: "slug",
			render: (isPaid: string, record: LeaveTypeType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{`${(isPaid) ? "Yes" : "No"}`}
					</Typography>
				</>
			),
		},
		{
			title: "Threshold",
			dataIndex: "threshold",
			key: "threshold",
			render: (text: string, record: LeaveTypeType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.threshold}
					</Typography>
				</>
			),
		},
		{
			title: "Threshold type",
			dataIndex: "thresholdType",
			key: "thresholdType",
			render: (text: string, record: LeaveTypeType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{capitalize(record.thresholdType)}
					</Typography>
				</>
			),
		},
		{
			title: "Published",
			dataIndex: "isPublished",
			key: "isPublished",
			render: (checked: boolean | undefined, record: LeaveTypeType) => (
				<Switch
					checked={checked}
					onChange={onIsPublishedChange}
					recordId={record.id}
					allowChange={permissions.updateLeaveType}
				/>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: LeaveTypeType) => (
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
				rowKey={(record: LeaveTypeType) => `LeaveType-${record.id}`}
			/>
		</div>
	);
}
