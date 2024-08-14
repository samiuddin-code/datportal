import { useCallback, useEffect, useMemo, useState } from "react";
import { PayrollModal } from "./modal";
import TableComponent from "./table-columns";
import { CustomFilter, ExcelExport, PageHeader } from "../../../Atoms";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { Button, Empty, Select, message } from "antd";
import { ErrorCode403 } from "../../../Atoms/ErrorCodes";
import { PayrollPermissionsEnum } from "../../../../Modules/Payroll/permissions";
import { PayrollModule } from "../../../../Modules/Payroll";
import { PayrollType } from "../../../../Modules/Payroll/types";
import { useFetchData } from "hooks";
import Layout from "@templates/Layout";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { convertDate } from "@helpers/dateHandler";
import { getPermissionSlugs, isNumber } from "@helpers/common";
import { PayrollCycleModule } from "@modules/PayrollCycle";
import { PayrollCycleType } from "@modules/PayrollCycle/types";
import PayrollExport from "./Export";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: false,
    text: "Payroll",
  },
];

type AttendanceExportType = { [key: string]: string | number | boolean | any }

function Payroll() {
  const [excelData, setExcelData] = useState<AttendanceExportType[]>([]);
  // available permissions for this module
  const permissionSlug = getPermissionSlugs(PayrollPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in PayrollPermissionsEnum]: boolean };
  const { readPayroll, updatePayroll, readAllPayroll } = permissions;
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

  const module = new PayrollModule();
  const payrollCycleModule = new PayrollCycleModule();

  const { data: payrollCycle } = useFetchData<PayrollCycleType[]>({
    method: payrollCycleModule.getAllRecords,
    initialQuery: { perPage: 500 }
  });

  const [filters, setFilters] = useState({
    userId: undefined,
    fromDate: undefined,
    toDate: undefined,
    payrollCycleId: undefined,
    page: 1,
    perPage: 10
  });

  const { data, onRefresh, setData, loading, meta } = useFetchData<PayrollType[]>({
    method: module.getAllRecords,
    initialQuery: { ...filters }
  });

  const onSelected = (event: any) => {
    const { name, value } = event.target;

    const numberValues = [
      { key: "clientId", name: "Client", },
      { key: "projectRole", name: "Project Role" }
    ]

    if (numberValues.some((item) => item.key === name)) {
      const isValidNumber = isNumber(value);
      if (!isValidNumber) {
        message.error(`${numberValues.find((item) => item.key === name)?.name} should be a number`);
        return;
      }
    }

    // set the selected value in the state
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const [reset, setReset] = useState<boolean>(false);
  const onReset = useCallback((name: string, value: number | string | string[]) => {
    if (name) {
      setReset(true);
      setFilters({ ...filters, [name]: value });
    }
  }, [filters]);



  //   useEffect(() => {
  // 	if (reset) {
  // 	  onUpdate();
  // 	}
  // 	// after 2 seconds set reset clicked state to false
  // 	const timer = setTimeout(() => {
  // 	  setReset(false);
  // 	}, 2000);
  // 	return () => clearTimeout(timer);
  //   }, [reset]);


  const onCancelClick = () => {
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal,
      editType: "new",
    });
  };

  const onEditIconClick = (record: PayrollType) => {
    if (updatePayroll === false) {
      message.error("You don't have permission to update this record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      editType: "edit",
      recordId: record.id,
      openModal: true,
    });
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
    else if (filters.userId) {
      userModule.getRecordById(filters.userId).then((res) => {

        setUsers([res?.data?.data])
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }, [debouncedSearchTermUser])
  useEffect(() => {
    onUserSearch()
  }, [onUserSearch, filters.userId])

  //excel
  const getExcelData = useCallback(() => {
    if (data && data.length > 0) {
      const _data = data?.map((item) => {
        return {
          date: convertDate(item.addedDate, "dd M,yy"),
          employee: item.User.firstName + " " + item.User.lastName,
          fromDate: convertDate(item.PayrollCycle.fromDate, "dd M,yy"),
          toDate: convertDate(item.PayrollCycle.toDate, "dd M,yy"),
          status: item.paid ? "Paid" : "Not paid",
          totalWorkingDays: item.totalWorkingDays,
          totalDaysWorked: item.totalDaysWorked,
          totalLates: item.totalLates,
          totalIncompletes: item.totalIncompletes,
          totalAbsences: item.totalAbsences,
          toBeDeductedFromLeaveCredits: item.toBeDeductedFromLeaveCredits,
          toBeDeductedFromCurrentSalary: item.toBeDeductedFromCurrentSalary,
          salaryAmount: item.salaryAmount,
          manualCorrection: item.manualCorrection,
          otherAmount: item.otherAmount,
          totalDeduction: item.totalDeduction,
          totalReceivable: item.totalReceivable,

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
    { label: "Employee", key: "employee" },
    { label: "From Date", key: "fromDate" },
    { label: "To Date", key: "toDate" },
    { label: "Status", key: "status" },
    { label: "Working Days", key: "totalWorkingDays" },
    { label: "Days Worked", key: "totalDaysWorked" },
    { label: "Lates", key: "totalLates" },
    { label: "Incomplete Days", key: "totalIncompletes" },
    { label: "Absences", key: "totalAbsences" },
    { label: "Deducted From Leave Credits", key: "toBeDeductedFromLeaveCredits" },
    { label: "Deducted From Current Salary", key: "toBeDeductedFromCurrentSalary" },
    { label: "Salary", key: "salaryAmount" },
    { label: "Manual Correction", key: "manualCorrection" },
    { label: "Other Amount", key: "otherAmount" },
    { label: "Total Deduction", key: "totalDeduction" },
    { label: "Receivable", key: "totalReceivable" },
  ]

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Payroll"
        // buttonText="Add Payroll"
        // onButtonClick={onCancelClick}
        breadCrumbData={breadCrumbsData}
        // showAdd={createPayroll === true ? true : false}
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
            {readAllPayroll && <div>
              <Select
                allowClear
                placeholder="Search for the employee"
                className="selectAntdCustom"
                onChange={(value) => {
                  const _temp = { ...filters, userId: value };
                  setFilters(_temp)
                  onRefresh(_temp)
                }}

                value={filters.userId ? filters.userId : undefined}
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
            </div>}


            <div>
              <Select
                options={payrollCycle?.map((state) => ({
                  label: `${convertDate(state.fromDate, 'dd M,yy')} - ${convertDate(state.toDate, 'dd M,yy')}`,
                  value: `${state.id}`,
                })) || []}
                placeholder="Payroll Cycle"
                showSearch allowClear
                optionFilterProp="label"
                style={{ width: "200px" }}
                className="selectAntdCustom"
                onClear={() => {
                  const _temp = {
                    ...filters,
                    payrollCycleId: undefined,
                  }
                  setFilters(_temp);
                  onRefresh(_temp)
                }}
                onSelect={(value) => {
                  const _temp = {
                    ...filters,
                    payrollCycleId: value,
                  }
                  setFilters(_temp);
                  onRefresh(_temp)
                }}
              />
            </div>

            <CustomFilter
              type="datepicker"
              label="Date"
              name="dateRange"
              onChange={(values: any) => {
                const _temp = {
                  ...filters,
                  fromDate: values ? values[0]?._d?.toISOString().substring(0, 10) : undefined,
                  toDate: values ? values[1]?._d?.toISOString().substring(0, 10) : undefined
                }
                setFilters(_temp);
              }}
              onReset={() => {
                const _temp = {
                  ...filters,
                  fromDate: undefined,
                  toDate: undefined
                }
                setFilters(_temp);
                onRefresh(_temp)
              }}
              onUpdate={() => onRefresh(filters)}
            />

          </div>
        }
      />
      {(readPayroll === true && data) && (
        <TableComponent
          tableData={data}
          tableLoading={loading}
          onEditIconClick={onEditIconClick}
          reloadTableData={onRefresh}
          meta={meta}
          filters={filters}
        />
      )}

      {readPayroll === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}

      {currentEditType.openModal && (
        <PayrollModal
          record={currentEditType.recordId}
          type={currentEditType.editType}
          reloadTableData={onRefresh}
          onCancel={onCancelClick}
          openModal={currentEditType.openModal}
          permissions={permissions}
        />
      )}

      {isModalOpen && (
        <PayrollExport
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </Layout>
  );
}
export default Payroll;
