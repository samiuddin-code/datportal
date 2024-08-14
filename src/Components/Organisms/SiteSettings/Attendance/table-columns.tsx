import { useEffect, useState } from "react";
import { message, Popconfirm, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { AttendanceType, UserAttendanceType } from "@modules/Attendance/types";
import { convertDate } from "@helpers/dateHandler";
import { capitalize, getTableRowNumber, isDateGreaterThan } from "@helpers/common";
import { AttendancePermissionSet } from "@modules/Attendance/permissions";
import { AttendanceModule } from "@modules/Attendance";
import { AttendanceEntryType, AttendancePayType, AttendanceStatus, attendanceStatusColor } from "@helpers/commonEnums";

interface _ActionComponentProps extends ActionComponentProps {
	record: AttendanceType,
	permissions: { [key in AttendancePermissionSet]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
	const {
		record, onEditIconClick, reloadTableData,
		permissions: { deleteAttendance }
	} = props;

	const [actionState, setActionState] = useState({
		confirmLoading: false,
		openPopConfirm: false,
	});
	const module = new AttendanceModule();

	const handleDelete = () => {
		setActionState({
			...actionState,
			confirmLoading: true,
		});

		if (deleteAttendance === false) {
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

export default function TableComponent(props: TableProps & { tableData: AttendanceType[] }) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, meta } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AttendancePermissionSet]: boolean };

	const [metaT, setMetaT] = useState({
		page: meta?.page || 1,
		perPage: meta?.perPage || 25
	})

	useEffect(()=>{
		setMetaT({
			page: meta?.page || 1,
			perPage: meta?.perPage || 25
		})
	},[meta])

	const module = new AttendanceModule();


	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			// render: (text: string, record: AttendanceType, index: number) => index + 1,
			render: (_text: string, _record: {}, index: number) => getTableRowNumber(index, metaT),
			width: "5%",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: AttendanceType) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{record?.User?.firstName + " " + record?.User?.lastName}
				</Typography>
			),
		},
		{
			title: "Date",
			dataIndex: "checkIn",
			key: "checkIn",
			render: (text: string, record: AttendanceType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.isOnLeave ? "(Not applicable)" : convertDate(record.checkIn, "dd M,yy")}
					</Typography>
				</>
			),
		},
		{
			title: "Check in",
			dataIndex: "checkIn",
			key: "checkIn",
			render: (text: string, record: AttendanceType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.isOnLeave ? "(Not applicable)" : convertDate(record.checkIn, "dd M,yy-t")?.substring(15,)}
					</Typography>
				</>
			),
		},
		{
			title: "Check out",
			dataIndex: "checkOut",
			key: "checkOut",
			render: (text: string, record: AttendanceType) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{record.isOnLeave ? "(Not applicable)" : convertDate(record.checkOut, "dd M,yy-t")?.substring(15,)}
					</Typography>
				</>
			),
		},
		{
			title: "Status",
			dataIndex: "staus",
			key: "status",
			render: (text: number, record: AttendanceType) => (
				<>
					<Typography style={{ color: attendanceStatusColor[text - 1] }} size="sm" weight="bold">
						{isDateGreaterThan(new Date(), record.day) ? "-" : capitalize(AttendanceStatus[text])}
					</Typography>
				</>
			),
		},
		{
			title: "Note",
			dataIndex: "note",
			key: "note",
			render: (text: string) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
					</Typography>
				</>
			),
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (text: AttendanceEntryType) => (
				<>

					{Object.entries(AttendanceEntryType).map(([key, value]) => {
						return value == text && <Typography color="dark-main" size="sm" weight="bold">
							{capitalize(key.replace("_", " "))}
						</Typography>
					})}

				</>
			),
		},
		{
			title: "Actions",
			dataIndex: "actions",
			key: "actions",
			render: (text: string, record: AttendanceType) => (
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
				pagination={false}
				scroll={{ x: 991 }}
				loading={tableLoading}
				rowKey={(record: AttendanceType) => `Attendance-type-${record.id}`}
			/>
		</div>
	);
}
