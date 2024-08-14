import { Table } from "antd";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { UserAttendance, UserAttendanceType } from "@modules/Attendance/types";
import { convertDate, weekDays } from "@helpers/dateHandler";
import { capitalize, isDateGreaterThan } from "@helpers/common";
import { AttendancePermissionSet } from "@modules/Attendance/permissions";
import { AttendanceModule } from "@modules/Attendance";
import { AttendanceStatus, attendanceStatusColor } from "@helpers/commonEnums";
import moment from "moment";

export default function TableComponent(props: {
	tableData: UserAttendance,
	onEditIconClick?: (editType: "new" | "edit", date?: Date, id?: number | null) => void;
	tableLoading: boolean;
	reloadTableData: (query?: { [key: string]: any; }) => void;
	emptyText?: React.ReactNode
}
) {
	const { tableData, tableLoading, onEditIconClick, reloadTableData, emptyText } = props;
	const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
	const permissions = userPermissions as { [key in AttendancePermissionSet]: boolean };

    let holidays : number[] = [];
    tableData.workingHour?.hours?.forEach((ele) => {
        if(ele.closed){
            holidays.push(ele.day)
        }
    })

	const columns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			render: (text: string, record: UserAttendance["attendanceData"], index: number) => index + 1,
			width: "7.5%",
		},
		{
			title: "Date",
			dataIndex: "day",
			key: "day",
			render: (text: Date, record: UserAttendanceType) => (
				<>
				<div className="d-flex">
				<Typography className="cursor-pointer" color={onEditIconClick ? "primary-main" : "dark-main"} size="sm" weight="bold"
					onClick={() => {
						if (onEditIconClick)
							onEditIconClick(record.recordId ? "edit" : "new", text, record.recordId)
					}
					}>
					{convertDate(text, "dd M,yy")}
				</Typography>
				<small className="pl-2 color-dark-sub">
				{`
					${(record.checkIn) ? "["+moment(record.checkIn).format("hh:mm A") : ""}
					${(record.checkOut) ? " - " + moment(record.checkOut).format("hh:mm A")+"]" : ""}
					`}
				</small>
				</div>
					{ record.ModifiedBy &&
					<small style={{color: 'var(--color-dark-sub)', fontSize: "0.6rem"}}>
						<span>Modified on </span>
						<span>	{ record.modifiedDate && convertDate(record.modifiedDate, "dd M,yy")}</span>
						<span> by </span>
						<span className="inline-block">{record.ModifiedBy?.firstName + " " + record.ModifiedBy?.lastName+ " "}</span>
					</small>
					}
				<div>

				</div>
				</>
			),
			width: "250px",
		},
		{
			title: "Day",
			dataIndex: "day",
			key: "day",
			render: (text: Date) => (
				<Typography color="dark-main" size="sm" weight="bold">
					{weekDays[(new Date(text).getDay())]}
				</Typography>
			),
		},
		{
			title: "Hours worked",
			dataIndex: "hoursWorked",
			key: "hoursWorked",
			render: (text: number) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text ? (text + " hours") : "N/A"}
					</Typography>
				</>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (text: number, record: UserAttendanceType) => (
				<>
					<Typography style={{ color: attendanceStatusColor[text - 1] }} size="sm" weight="bold">
						{isDateGreaterThan(new Date(), record.day) ? "-" : capitalize(AttendanceStatus[text])}
					</Typography>
				</>
			),
		},
		{
			title: "Pro Rated Deduction",
			dataIndex: "proRatedDeduction",
			key: "proRatedDeduction",
			render: (text: number) => (
				<>
					<Typography color="dark-main" size="sm" weight="bold">
						{text}
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
					<Typography color="dark-main" size="xs" weight="normal">
						{text}
					</Typography>
				</>
			),
			width: "200px"
		},
		(permissions.updateAttendance) ?
			{
				title: "Actions",
				dataIndex: "actions",
				key: "actions",
				render: (text: string, record: UserAttendanceType) => (
					permissions.updateAttendance && !isDateGreaterThan(new Date(), record.day) &&
					<div className={styles.actions}>
						<span onClick={() => {
							if (onEditIconClick)
								onEditIconClick(record.recordId ? "edit" : "new", record.day, record.recordId)
						}}>
							<img src="/images/editicon.svg" alt="" />
						</span>
					</div>
				),
				width: "100px"
			} : {},
	];

	return (
		<div style={{	maxHeight: "calc(100vh - 80px)",
			clear: "both",
			maxWidth: "100%",
			overflow: "auto"}}>
			<Table
				sticky
				dataSource={tableData?.attendanceData}
				columns={columns as any}
				scroll={{ x: 991 }}
				pagination={false}
				loading={tableLoading}
				rowKey={(record: any) => `Attendance-type-${record.day}`}
				locale={{
					emptyText
				}}
			/>
		</div>
	);
}
