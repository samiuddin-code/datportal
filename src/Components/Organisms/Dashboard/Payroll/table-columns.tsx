import { useCallback, useEffect, useState } from "react";
import { Button, Collapse, Drawer, Dropdown, MenuProps, message, Popconfirm, Popover, Spin, Table, Tag, Tooltip } from "antd";
import { DollarCircleOutlined, CalculatorOutlined, ExportOutlined, CheckOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Deduction, PayrollType } from "../../../../Modules/Payroll/types";
import { PayrollPermissionsEnum } from "../../../../Modules/Payroll/permissions";
import { PayrollModule } from "../../../../Modules/Payroll";
import { APIResponseObject } from "@modules/Common/common.interface";
import { capitalize, formatCurrency, isDateInRange } from "@helpers/common";
import { convertDate, months, weekDays } from "@helpers/dateHandler";
import componentStyles from "./style.module.scss";
import { MoreIcon } from "@icons/index";
import { AttendanceStatus } from "@helpers/commonEnums";
import { CSVLink } from "react-csv";
import { AttendanceModule } from "@modules/Attendance";
import moment from "moment";
import { UserAttendance } from "@modules/Attendance/types";
import TableComponent from "@organisms/Dashboard/Attendance/table-columns";
import { useConditionFetchData, useFetchData } from "hooks";
import CustomEmpty from "@atoms/CustomEmpty";

interface _ActionComponentProps extends ActionComponentProps {
    record: PayrollType,
    permissions: { [key in PayrollPermissionsEnum]: boolean };
}

type AttendanceExportType = { [key: string]: string | number | boolean | any }

const ActionComponent = (props: _ActionComponentProps) => {
    const {
        record, onEditIconClick, reloadTableData,
        permissions: { deletePayroll, updatePayroll, readPayroll }
    } = props;
    const [isClicked, setIsClicked] = useState(false);

    const [excelData, setExcelData] = useState<AttendanceExportType[]>([]);

    const module = new PayrollModule();

    const getExcelData = useCallback(async () => {
        const module = new AttendanceModule();
        if (isClicked)
            module.getUserAttendance({
                year: moment(record?.PayrollCycle.toDate).year(),
                month: moment(record?.PayrollCycle.fromDate).add(10, 'd').month(),
                userId: record?.User.id
            })
                .then((res) => {
                    if (res.data.data && res.data.data.attendanceData.length > 0) {
                        const _data = res.data?.data?.attendanceData.map((item: any) => {
                            return {
                                date: convertDate(item?.day, "dd MM,yy"),
                                day: weekDays[(new Date(item.day).getDay())],
                                hours: item?.hoursWorked,
                                status: capitalize(AttendanceStatus[item.status]),
                                proRatedDeduction: item.proRatedDeduction,
                                note: item.note
                            }
                        })
                        setExcelData(_data);
                    }
                })
                .catch(err => console.log(err))


    }, [record.id, isClicked])
    // headers for the excel export
    const headers = [
        { label: "Date", key: "date" },
        { label: "Day", key: "day" },
        { label: "Hours", key: "hours" },
        { label: "Status", key: "status" },
        { label: "Pro Rated Deduction", key: "proRatedDeduction" },
        { label: "Note", key: "note" },
    ]

    useEffect(() => {
        getExcelData();
    }, [getExcelData])

    const handleMarkAsPaid = () => {
        if (updatePayroll === false) {
            message.error("You don't have permission to update this record, please contact your admin.");
            return;
        }
        module.markAsPaid({ ids: [record.id] }).then((res) => {
            reloadTableData();
        }).catch((err) => {
        });
    };

    const handleRecalculate = () => {
        if (updatePayroll === false) {
            message.error("You don't have permission to update this record, please contact your admin.");
            return;
        }

        module.recalculateRecord(record.id).then((res) => {
            reloadTableData();
        }).catch((err) => {
            message.error(err?.response?.data?.message);
        });
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: updatePayroll && (
                <Tooltip title="Edit">
                    <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => onEditIconClick(record)}>
                        <span >
                            <img src="/images/editicon.svg" alt="" />
                        </span>
                        Manual correction
                    </div>
                </Tooltip>
            ),
        },
        {
            key: '2',
            label: updatePayroll && (
                <Popconfirm
                    placement="top"
                    title="Are you sure?"
                    onConfirm={handleMarkAsPaid}
                    okText="Yes"
                    cancelText="No"
                >
                    <Tooltip title="Mark as paid">
                        <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} >
                            <DollarCircleOutlined style={{ color: "white" }} />
                            Mark as paid
                        </div>
                    </Tooltip>
                </Popconfirm>
            ),
        },
        {
            key: '3',
            label: updatePayroll && (
                <Tooltip title="Recalculate">
                    <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={handleRecalculate}>
                        <CalculatorOutlined style={{ color: "white" }} />
                        Recalculate
                    </div>
                </Tooltip>
            ),
        },
        {
            key: '4',
            label: readPayroll && (
                <Tooltip title="Export to Excel">
                    <div className={`${styles.actions} ${componentStyles.overlay_card_item}`} onClick={() => {

                        getExcelData()
                    }}>
                        <ExportOutlined style={{ color: "white" }} />
                        <CSVLink
                            filename={"Payroll" + " " + (record.User.firstName + " " + record.User.lastName)}
                            headers={headers}
                            data={excelData}
                            onClick={getExcelData}
                        >

                            <span style={{ color: 'black' }}>Export to Excel</span>
                        </CSVLink>
                    </div>
                </Tooltip>
            ),
        },

    ]


    return (
        <Dropdown menu={{ items }} trigger={["click"]}>
            <span onClick={() => {
                setIsClicked(true)
            }} style={{ cursor: "pointer", padding: '5px' }}>
                <MoreIcon
                    height={25} width={25} color="#7e869a"
                />
            </span>
        </Dropdown>
    );
};


export default function TableComponentPayroll(props: TableProps & { tableData: PayrollType[], meta: APIResponseObject["meta"], filters: any }) {
    const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
    const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
    const permissions = userPermissions as { [key in PayrollPermissionsEnum]: boolean };
    const [drawer, setDrawer] = useState<{
        open: boolean,
        selected?: PayrollType
    }>({
        open: false,
        selected: undefined
    });
    const payrollModule = new PayrollModule()
    const handleMarkAsPaid = (id?: number) => {
        if (id)
            payrollModule.markAsPaid({ ids: [id] }).then((res) => {
                reloadTableData();
                setDrawer({
                    ...drawer,
                    selected: {
                        ...drawer.selected!,
                        paid: true
                    }
                })
            }).catch((err) => {
            });
    };
    const module = new AttendanceModule();
    const { data, onRefresh, setData, loading } = useConditionFetchData<UserAttendance>({
        method: module.findUserAttendanceForPayroll,
        initialQuery: {
            fromDate: drawer.selected?.PayrollCycle.fromDate,
            toDate: drawer.selected?.PayrollCycle.toDate,
            userId: drawer.selected?.User.id
        },
        condition: (drawer?.selected)
    });

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (text: string, record: {}, index: number) => index + 1,
            width: "80px",
        },
        {
            title: "Employee",
            dataIndex: "employee",
            key: "employee",
            render: (employee: string, record: PayrollType) => (
                <Typography color="dark-sub" size="sm">
                    {record.User.firstName + " " + record.User.lastName}
                </Typography>
            ),
            width: "200px"
        },
        {
            title: "Period",
            dataIndex: "fromDate",
            key: "fromDate",
            render: (fromDate: Date, record: PayrollType) => (
                <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Typography color="dark-sub" size="sm">
                            {convertDate(record.PayrollCycle.fromDate, "dd M,yy") + " - " + convertDate(record.PayrollCycle.toDate, "dd M,yy")}
                        </Typography>
                        {isDateInRange(new Date(), record.PayrollCycle.fromDate, record.PayrollCycle.toDate) ?
                            <Tag color="green">Current</Tag>
                            : null}
                    </div>
                    <Typography className="cursor-pointer" size="sm" color="primary-main"
                        onClick={() => setDrawer({
                            selected: record,
                            open: true
                        })}>
                        View Report
                    </Typography>
                </div>
            ),
            width: "180px"
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: PayrollType) => (
                record.processing ? <Spin /> :
                    <Typography color={record.paid ? "primary-main" : "dark-sub"} size="sm">
                        {record.paid ? "Paid" : "Not paid"}
                    </Typography>
            ),
            width: "100px"
        },
        {
            title: "Deductions",
            dataIndex: "Deductions",
            key: "Deductions",
            render: (Deductions: Deduction[], record: PayrollType) => (
                Deductions.length ?
                    <Popover
                        content={
                            <div className="font-size-sm">{Deductions.map(deduction => (
                                <div>{deduction.title}:  {deduction.amount.toFixed(2)} AED</div>
                            ))}
                            </div>}
                        title="Deductions">
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-main)', cursor: 'pointer' }}>
                            {Deductions.length + " deductions"}
                        </div>
                    </Popover>
                    :
                    <Typography color="dark-sub" size="sm">
                        No deductions
                    </Typography>
            ),
            width: "160px"
        },
        {
            title: "Summary",
            dataIndex: "summary",
            key: "summary",
            render: (summary: string, record: PayrollType) => (
                <div>
                    <Typography color="dark-sub" size="sm">
                        {"Total days in cycle: " + record.totalDays}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Working days: " + record.totalWorkingDays}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Days worked: " + record.totalDaysWorked}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Lates: " + record.totalLates}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Incompletes: " + record.totalIncompletes}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Absences: " + record.totalAbsences}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Deduction from leave credits: " + record.toBeDeductedFromLeaveCredits}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Deduction from salary: " + record.toBeDeductedFromCurrentSalary}
                    </Typography>
                </div>
            ),
            width: "280px"
        },
        {
            title: "Payment",
            dataIndex: "payment",
            key: "payment",
            render: (payment: string, record: PayrollType) => (
                <div>
                    <Typography color="dark-sub" size="sm">
                        {"Salary: " + record.salaryAmount + " AED"}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Manual Correction: " + record.manualCorrection + " AED"}
                    </Typography>
                    <Typography color="dark-sub" size="sm">
                        {"Other amount: " + record.otherAmount + " AED"}
                    </Typography>
                    <Typography color={record.totalDeduction ? "red-yp" : "dark-sub"} size="sm">
                        {"Deductions: " + formatCurrency(record.totalDeduction)}
                    </Typography>
                    <Typography color="dark-sub" size="sm" weight="bold">
                        {"Receivable: " + formatCurrency(record.totalReceivable)}
                    </Typography>
                </div>
            ),
            width: "280px"
        },
        {
            title: "Date",
            dataIndex: "addedDate",
            key: "addedDate",
            render: (addedDate: string, record: PayrollType) => (
                <>
                    <Typography color="dark-sub" size="sm" >
                        {`Added: ${convertDate(addedDate, "dd M,yy")}`}
                    </Typography>
                </>
            ),
            width: "100px"
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (text: string, record: PayrollType) => (
                <ActionComponent
                    record={record}
                    onEditIconClick={onEditIconClick}
                    reloadTableData={reloadTableData}
                    permissions={permissions}
                />
            ),
            width: "100px"
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
                rowKey={(record: PayrollType) => `Payroll-${record.id}`}
            />
            <Drawer
                width={window.innerWidth > 768 ? "75%" : "100%"}
                title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>{"Payroll Report of " + drawer.selected?.User.firstName + " " + drawer.selected?.User.lastName + " for the Month of " + months[moment(drawer?.selected?.PayrollCycle?.fromDate).add(10, 'd')?.month()][1]}</div>
                    {drawer.selected?.paid ? <p className="color-primary-main"><CheckOutlined /> Paid</p> : <Button onClick={() => handleMarkAsPaid(drawer.selected?.id)} size="small">Mark as paid</Button>}
                </div>}
                placement="right"
                onClose={() => setDrawer({ ...drawer, open: false })}
                open={drawer.open}>
                <div style={{ padding: '1rem 0 0 1rem', display: 'flex', gap: '1rem' }}>
                    <div
                        style={{
                            //  width: '25%', 
                            width: window.innerWidth > 768 ? '25%' : '100%',
                            marginTop: '1rem'
                        }}
                    >
                        <Typography color="dark-main" size="normal" weight="bold" style={{ marginBottom: '1rem' }}>
                            {"Summary"}
                        </Typography>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Total days in cycle: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalDays}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Working days: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalWorkingDays}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Days worked: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalDaysWorked}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Lates: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalLates}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Incompletes: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalIncompletes + " days"}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Absences: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.totalAbsences}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Deduction from leave credits: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.toBeDeductedFromLeaveCredits}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Deduction from salary: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.toBeDeductedFromCurrentSalary + " days"}</Typography>
                        </div>

                        <Typography color="dark-main" size="normal" weight="bold" style={{ margin: '3rem 0 1rem 0' }}>
                            {"Payment"}
                        </Typography>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Salary: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.salaryAmount + " AED"}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Manual Correction: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.manualCorrection + " AED"}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm">Other amount: </Typography> <Typography color="dark-sub" size="sm">{drawer.selected?.otherAmount + " AED"}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color={drawer.selected?.totalDeduction ? "red-yp" : "dark-sub"} size="sm">Deductions: </Typography> <Typography color={drawer.selected?.totalDeduction ? "red-yp" : "dark-sub"} size="sm">{drawer.selected?.totalDeduction.toFixed(2) + " AED"}</Typography>
                        </div>
                        <div className={componentStyles.drawerElement}>
                            <Typography color="dark-sub" size="sm" weight="bold">Receivable: </Typography> <Typography color="dark-sub" size="sm" weight="bold">{drawer.selected?.totalReceivable.toFixed(2) + " AED"}</Typography>
                        </div>

                        {(drawer.selected?.Deductions.length) && <Collapse style={{ margin: '3rem 0 1rem 0' }} defaultActiveKey={['0']} >
                            <Collapse.Panel header={<div style={{ padding: '0 0.25rem' }}>Deductions</div>} key="0">
                                <div style={{ padding: '0.5rem' }} className="font-size-sm color-dark-sub">{drawer.selected?.Deductions.map(deduction => (
                                    <div>- {deduction.title}:  {deduction.amount.toFixed(2)} AED</div>
                                ))}
                                </div>
                            </Collapse.Panel>
                        </Collapse>}
                    </div>
                    <div style={{ width: '75%' }}>
                        <TableComponent
                            tableData={data ? data : {} as any}
                            tableLoading={loading}
                            reloadTableData={() => { }}
                            emptyText={<CustomEmpty
                                description={"No records found"} />}
                        />
                    </div>

                </div>
            </Drawer>
        </div>
    );
}
