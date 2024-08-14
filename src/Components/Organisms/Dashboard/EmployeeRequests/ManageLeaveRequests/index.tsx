import { CustomEmpty, CustomFilter, PageHeader } from "@atoms/";
import Layout from "@templates/Layout";
import styles from "./styles.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { message, Pagination } from "antd";
import { useFetchData } from "hooks";
import { LeaveRequestType } from "@modules/LeaveRequest/types";
import { LeaveRequestModule } from "@modules/LeaveRequest";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { LeaveRequestPermissionsEnum } from "@modules/LeaveRequest/permissions";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { LeaveRequestCard } from "@organisms/Dashboard/MyServices/LeaveRequest/card";
import { LeaveRequestDrawer } from "@organisms/Dashboard/MyServices/LeaveRequest/LeaveRequestDrawer";
import { capitalize, getPermissionSlugs } from "@helpers/common";
import { LeaveRequestStatus } from "@helpers/commonEnums";
import { CardShimmer } from "@atoms/CardShimmer";


const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: true,
    text: "Employee Requests",
    path: "/employee-requests/?all",
  },
  {
    isLink: false,
    text: "Leave Request",
  },
];

type FiltersType = {
  userId?: number,
  fetchOpenRequest?: boolean,
  status?: number,
  fromDate?: string,
  toDate?: string,
  page: number,
  perPage: number
}

const ManageLeaveRequest = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(LeaveRequestPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in LeaveRequestPermissionsEnum]: boolean };
  const [filters, setFilters] = useState<FiltersType>({
    userId: undefined,
    fetchOpenRequest: true,
    status: undefined,
    fromDate: undefined,
    toDate: undefined,
    page: 1,
    perPage: 6
  })

  const [currentEditType, setcurrentEditType] = useState<{ recordId: number }>({ recordId: 0 });
  const [openDrawer, setOpenDrawer] = useState(false);

  const module = useMemo(() => new LeaveRequestModule(), []);

  const { data, onRefresh, loading, meta } = useFetchData<LeaveRequestType[]>({
    method: module.getAllRecords,
    initialQuery: { perPage: filters.perPage, page: filters.page, fetchOpenRequest: true }
  });


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
  }, [debouncedSearchTermUser])

  useEffect(() => {
    onUserSearch()
  }, [onUserSearch])

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Leave Requests"
        breadCrumbData={breadCrumbsData}
        filters={<div style={{ marginTop: '1.5rem' }}>
          <div>
            <CustomFilter
              type="radio"
              label="User"
              name="userId"
              withSearch={true}
              options={users?.map((item) => ({
                label: item.firstName + " " + item.lastName,
                value: item.id.toString(),
              }))}
              onChange={(event) => {
                const _temp = { ...filters, userId: event.target.value };
                setFilters(_temp);
              }}
              value={filters.userId?.toString()}
              onReset={() => {
                const _temp = { ...filters, userId: undefined };
                setFilters(_temp);
                onRefresh(_temp);
                // Reset search term
                setSearchTermUser("")
              }}
              onUpdate={() => onRefresh(filters)}
              // START: For search
              // loading={clients.loading}
              searchTerm={searchTermUser}
              onSearch={(event) => setSearchTermUser(event.currentTarget.value)}
            // END: For search
            />
          </div>
          <div >
            <CustomFilter
              type="radio"
              label="Status"
              name="status"
              withSearch={false}
              options={Object.entries(LeaveRequestStatus).map(([key, value]) => {
                return {
                  label: capitalize(value.status.replaceAll("_", " ")),
                  value: key,
                }
              })}
              onChange={(event) => {
                const _temp = { ...filters, status: event.target.value };
                setFilters(_temp);
              }}
              value={filters.status?.toString()}
              onReset={() => {
                const _temp = { ...filters, status: undefined };
                setFilters(_temp);
                onRefresh(_temp);
              }}
              onUpdate={() => onRefresh(filters)}
            />
          </div>
          <div>
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
          <div style={{
            backgroundColor: filters.fetchOpenRequest ? "var(--color-dark-main)" : undefined,
            color: filters.fetchOpenRequest ? "var(--color-inactive)" : undefined
          }}
            onClick={() => {
              const _temp = { ...filters, fetchOpenRequest: filters.fetchOpenRequest ? undefined : true };
              setFilters(_temp)
              onRefresh(_temp)
            }}
            className={styles.onlyMyTask}>
            Open Requests Only
          </div>

        </div>}
      />
      <section className={styles.container}>
        {loading ? (
          [...new Array(6)].map((_, index) => <CardShimmer key={`shimmer${index}`} />)
        ) : (
          data?.length !== 0 ? (
            data?.map((leaveRequest, index) => (
              <LeaveRequestCard
                key={index}
                leaveRequest={leaveRequest}
                onClick={() => {
                  setcurrentEditType({ ...currentEditType, recordId: leaveRequest.id });
                  setOpenDrawer(true);
                }}
              />
            ))
          ) : (
            <div style={{ margin: 'auto' }}>
              <CustomEmpty
                description="No requests found for the given filters, please modify the search criteria"
              />
            </div>
          )
        )}
      </section>
      <Pagination
        hideOnSinglePage
        current={meta?.page}
        total={meta?.total}
        pageSize={meta?.perPage || 0}
        onChange={(page, pageSize) => {
          onRefresh({ ...filters, page: page, perPage: pageSize })
        }}
        style={{ alignSelf: "flex-end" }}
      />
      {openDrawer && (
        <LeaveRequestDrawer
          openDrawer={openDrawer}
          onClose={() => setOpenDrawer(false)}
          permissions={permissions}
          record={currentEditType.recordId}
          reloadTableData={onRefresh}
        />
      )}
    </Layout>
  );
};
export default ManageLeaveRequest;