import { useCallback, useEffect, useMemo, useState } from "react";
import { AttendanceModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomEmpty, PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Button, DatePicker, Empty, Segmented, Select, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import Layout from "@templates/Layout";
import { useFetchData } from "hooks";
import { useDebounce } from "@helpers/useDebounce";
import { AttendanceStatus } from "@helpers/commonEnums";
import { AttendancePermissionSet } from "@modules/Attendance/permissions";
import { AttendanceModule } from "@modules/Attendance";
import { UserAttendance } from "@modules/Attendance/types";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import styles from './styles.module.scss';
import { CalendarOutlined, BarsOutlined, DownOutlined } from '@ant-design/icons';
import CalendarComponent from "./Calendar";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { convertDate, weekDays } from "@helpers/dateHandler";
import TokenService from "@services/tokenService";
import AttendanceExport from "./Export";

const { MonthPicker, YearPicker } = DatePicker;

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/", },
  { isLink: false, text: "Attendance" },
];

type AttendanceExportType = { [key: string]: string | number | boolean | any }
type AttendanceViewAsType = "table" | "calendar"

function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = TokenService.getUserData()
  const [selectedCellDate, setSelectedCellDate] = useState<string>();
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(AttendancePermissionSet)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in AttendancePermissionSet]: boolean };
  const { readAttendance, createAttendance, updateAttendance, readAllAttendance } = permissions;

  const [attendanceViewAs, setAttendanceViewAs] = useState<AttendanceViewAsType>(() => {
    const viewAs = localStorage.getItem("attendanceViewAs");
    if (viewAs === "calendar") {
      return "calendar";
    }
    return "table";
  })

  // Function to handle view as change
  const onViewAsChange = (value: AttendanceViewAsType) => {
    localStorage.setItem("attendanceViewAs", value);
  }
  const [currentEditType, setcurrentEditType] = useState<{
    editType: "new" | "edit";
    recordId: number;
    openModal: boolean;
  }>({
    editType: "new",
    recordId: 0,
    openModal: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [excelData, setExcelData] = useState<AttendanceExportType[]>([]);

  const [calendarFilters, setCalendarFilters] = useState<{ type?: number, year?: number, month?: number, userId?: number }>({
    type: undefined,
    year: Number(searchParams.get("year")) || moment(new Date()).year(),
    month: Number(searchParams.get("month")) || moment(new Date()).month(),
    userId: localStorage.getItem("attendanceUser") ? (readAllAttendance ? Number(JSON.parse(localStorage?.getItem("attendanceUser") || "")) : user.id) : user.id
  })

  const module = new AttendanceModule();

  const { data, onRefresh, setData, loading } = useFetchData<UserAttendance>({
    method: module.getUserAttendance,
    initialQuery: calendarFilters
  });

  const onCancelClick = () => {
    if (createAttendance === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
    });
  };

  const onCellClick = (editType: "new" | "edit", date?: Date, id?: number | null) => {
    if (updateAttendance === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    if (id)
      setcurrentEditType({
        ...currentEditType,
        editType: editType,
        recordId: id,
        openModal: true,
      });
    else {
      setcurrentEditType({
        editType: "new",
        recordId: 0,
        openModal: true,
      });
    }

    if (date) {
      setSelectedCellDate((new Date(date)).toISOString())
    }
  };

  //user search
  const [searchTermUser, setSearchTermUser] = useState("");
  const debouncedSearchTermUser = useDebounce(searchTermUser, 500);
  const [users, setUsers] = useState<UserTypes[]>([]);
  const userModule = useMemo(() => new UserModule(), []);
  const onUserSearch = useCallback(() => {
    if (debouncedSearchTermUser) {
      userModule.getAllRecords({ name: debouncedSearchTermUser }).then((res) => {

        setUsers((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = res?.data?.data?.filter((item: UserTypes) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
    else if (calendarFilters.userId) {
      userModule.getRecordById(calendarFilters.userId).then((res) => {

        setUsers([res?.data?.data])
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }, [debouncedSearchTermUser])
  useEffect(() => {
    onUserSearch()
  }, [onUserSearch, calendarFilters.userId])

  const getExcelData = useCallback(() => {
    if (data && data.attendanceData.length > 0) {
      const _data = data?.attendanceData.map((item) => {
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
  }, [data])

  useEffect(() => {
    getExcelData();
  }, [getExcelData])

  // headers for the excel export
  const headers = [
    { label: "Date", key: "date" },
    { label: "Day", key: "day" },
    { label: "Hours", key: "hours" },
    { label: "Status", key: "status" },
    { label: "Pro Rated Deduction", key: "proRatedDeduction" },
    { label: "Note", key: "note" },
  ]

  return (
    <Layout
      permissionSlug={permissionSlug}>
      <PageHeader
        heading="Attendance"
        buttonText="Add Attendance"
        onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        showAdd={createAttendance === true ? true : false}
        excelExport={
          <Button
            style={{ marginRight: 15, display: "flex", alignItems: "center" }}
            onClick={() => setIsModalOpen(true)}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18" height="18"
                fill="none"
                viewBox="0 0 24 24" className='mr-1'
              >
                <path
                  fill="#42526E"
                  d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2zm1.06 10.33c0 .41-.34.75-.75.75s-.75-.34-.75-.75V9.31l-7.72 7.72c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 010-1.06l7.72-7.72h-3.02c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.83c.41 0 .75.34.75.75v4.83z"
                ></path>
              </svg>
            }
          >
            Export to Excel
          </Button>
        }
        filters={
          <div >
            <div>
              <Select
                allowClear
                placeholder="Search for the employee"
                className="selectAntdCustom"
                disabled={readAllAttendance ? false : true}
                onChange={(value) => {
                  const _tempCalendar = { ...calendarFilters, userId: value };
                  setCalendarFilters(_tempCalendar)
                  if (value) {
                    localStorage.setItem("attendanceUser", String(value));
                    onRefresh(_tempCalendar);

                  } else {
                    localStorage.removeItem("attendanceUser")
                    setData(undefined)
                  }
                  // !shouldFetch && setShoudFetch(true);
                }}

                value={calendarFilters.userId ? calendarFilters.userId : undefined}
                showSearch
                onSearch={(value) => setSearchTermUser(value)}
                optionFilterProp="label"
                options={users?.map((item) => {
                  return {
                    label: item.firstName + " " + item.lastName,
                    value: item.id,
                  }
                })}
                notFoundContent={
                  <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{
                      height: 100,
                    }}
                    description={
                      <span>
                        No data found, Please search for the employee
                      </span>
                    }
                  />
                }
              />
            </div>

            <div>
              <label>
                <MonthPicker
                  onChange={(value) => {
                    const selectedMonth = value?.month();
                    const selectedYear = calendarFilters.year ? calendarFilters.year : moment(new Date()).year();

                    const _temp = {
                      ...calendarFilters,
                      month: selectedMonth,
                      year: selectedYear
                    };
                    setCalendarFilters(_temp);
                    onRefresh(_temp);

                    if (selectedMonth) {
                      searchParams.set("month", selectedMonth.toString());
                    } else if (selectedMonth === 0) {
                      searchParams.set("month", "0");
                    }
                    searchParams.set('year', selectedYear.toString());
                    setSearchParams(searchParams);
                  }}
                  className={styles.monthPicker}
                  suffixIcon={<DownOutlined />}
                  clearIcon={false}
                  format={"MMMM"}
                  placeholder="Month"
                  value={(calendarFilters.month !== undefined && calendarFilters.month !== null) ? moment(new Date()).month(calendarFilters.month) : undefined}
                />
              </label>

            </div>
            <div>
              <label>
                <YearPicker
                  onChange={(value) => {
                    const selectedYear = value?.year();

                    const _temp = {
                      ...calendarFilters,
                      year: selectedYear
                    };

                    setCalendarFilters(_temp);
                    onRefresh(_temp);

                    selectedYear && searchParams.set('year', selectedYear.toString());
                    setSearchParams(searchParams);
                  }}
                  placeholder="Year"
                  className={styles.yearPicker}
                  suffixIcon={<DownOutlined />}
                  clearIcon={false}
                  value={calendarFilters.year ? moment(new Date()).year(calendarFilters.year) : undefined}
                  disabledDate={(date) => date > moment(new Date())}
                />
              </label>
            </div>
            {/** View as grid or table */}
            <div className={styles.view_as} style={{ overflow: "auto" }}>
              <Segmented
                options={[
                  {
                    label: 'Table',
                    value: 'table',
                    icon: <BarsOutlined />,
                  },
                  {
                    label: 'Calendar',
                    value: 'calendar',
                    icon: <CalendarOutlined />,
                  },
                ]}
                onChange={(value) => {
                  setAttendanceViewAs(value as AttendanceViewAsType)
                  onViewAsChange(value as AttendanceViewAsType)
                }}
                value={attendanceViewAs}
              />
            </div>

          </div>
        }
      />

      {readAttendance === true && attendanceViewAs === "table" && (
        <TableComponent
          tableData={data ? data : {} as any}
          tableLoading={loading}
          onEditIconClick={onCellClick}
          reloadTableData={() => onRefresh(calendarFilters)}
          emptyText={<CustomEmpty
            description={calendarFilters.userId ? "No records found" : "Please select an employee to get started"} />}

        />
      )}

      {readAttendance === true && attendanceViewAs === "calendar" && (calendarFilters.month || calendarFilters.month === 0) && calendarFilters.year && (
        (data ?
          <CalendarComponent onCellClick={onCellClick} data={data} month={calendarFilters.month} year={calendarFilters.year} />
          : <Empty description="Please select an employee to get started" />)
      )}
      {readAttendance === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {currentEditType.openModal && (
        <AttendanceModal
          record={currentEditType.recordId}
          type={currentEditType.editType}
          reloadTableData={() => onRefresh(calendarFilters)}
          onCancel={onCancelClick}
          openModal={currentEditType.openModal}
          permissions={permissions}
          employeeId={calendarFilters.userId}
          date={selectedCellDate ? selectedCellDate : null}
        />
      )}

      {isModalOpen && (
        <AttendanceExport
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </Layout>
  );
}
export default Attendance;