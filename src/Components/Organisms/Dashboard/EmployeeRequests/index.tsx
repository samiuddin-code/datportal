import { PageHeader } from "../../../Atoms";
import Layout from "../../../Templates/Layout";
import styles from "./styles.module.scss";
import { Dispatch, Fragment, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Select, Skeleton, message } from "antd";
import { useFetchData } from "hooks";
import { CarReservationType } from "@modules/CarReservation/types";
import { CarReservationModule } from "@modules/CarReservation";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { CarReservationPermissionsEnum } from "@modules/CarReservation/permissions";
import { LeaveRequestPermissionsEnum } from "@modules/LeaveRequest/permissions";
import { ReimbursementPermissionsEnum } from "@modules/Reimbursement/permissions";
import { CashAdvancePermissionsEnum } from "@modules/CashAdvance/permissions";
import { LeaveRequestModule } from "@modules/LeaveRequest";
import { ReimbursementModule } from "@modules/Reimbursement";
import { CashAdvanceModule } from "@modules/CashAdvance";
import { CarReservationDrawer } from "../MyServices/CarReservation/CarReservationDrawer";
import { CarReservationCard } from "../MyServices/CarReservation/card";
import { LeaveRequestCard } from "../MyServices/LeaveRequest/card";
import { ReimbursementCard } from "../MyServices/Reimbursement/card";
import { CashAdvanceCard } from "../MyServices/CashAdvance/card";
import { LeaveRequestType } from "@modules/LeaveRequest/types";
import { ReimbursementType } from "@modules/Reimbursement/types";
import { CashAdvanceType } from "@modules/CashAdvance/types";
import { LeaveRequestDrawer } from "../MyServices/LeaveRequest/LeaveRequestDrawer";
import { ReimbursementDrawer } from "../MyServices/Reimbursement/ReimbursementDrawer";
import { CashAdvanceDrawer } from "../MyServices/CashAdvance/CashAdvanceDrawer";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";
import { useDebounce } from "@helpers/useDebounce";
import InfiniteScroll from "react-infinite-scroll-component";
import { getPermissionSlugs } from "@helpers/common";
import { APIResponseObject } from "@modules/Common/common.interface";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: true,
    text: "Employee Requests",
    path: "/employee-requests",
  },
];

type DrawerType<T, M> = {
  [K in keyof T]: {
    open: boolean;
    recordId: number;
    data?: T[K][];
    title: string;
    card: (item: T[K], onClick: () => void) => JSX.Element;
    meta: APIResponseObject['meta'];
    setMeta: Dispatch<APIResponseObject['meta']>;
    setData: Dispatch<SetStateAction<T[K][] | undefined>>;
    module: M;
  };
};

type ModulesType = {
  carReservation: CarReservationType;
  leaveRequest: LeaveRequestType;
  reimbursement: ReimbursementType;
  cashAdvance: CashAdvanceType;
}

type ModuleClassType = CarReservationModule | LeaveRequestModule | ReimbursementModule | CashAdvanceModule
type ModuleCombinedType = CarReservationType & LeaveRequestType & ReimbursementType & CashAdvanceType;

type MyDrawerType = DrawerType<ModulesType, ModuleClassType>;

const EmployeeRequests = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(CarReservationPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const carReservationPermissions = userPermissions as { [key in CarReservationPermissionsEnum]: boolean };
  const leaveRequestPermissions = userPermissions as { [key in LeaveRequestPermissionsEnum]: boolean };
  const reimbursementPermissions = userPermissions as { [key in ReimbursementPermissionsEnum]: boolean };
  const cashAdvancePermissions = userPermissions as { [key in CashAdvancePermissionsEnum]: boolean };

  const carReservationModule = useMemo(() => new CarReservationModule(), []);
  const leaveRequestModule = useMemo(() => new LeaveRequestModule(), []);
  const reimbursementModule = useMemo(() => new ReimbursementModule(), []);
  const cashAdvanceModule = useMemo(() => new CashAdvanceModule(), []);

  const {
    data: carReservationData,
    onRefresh: carReservationRefresh,
    setData: carReservationSetData,
    meta: carReservationMeta,
    setMeta: carReservationSetMeta,
    loading: carReservationLoading
  } = useFetchData<CarReservationType[]>({
    method: carReservationModule.getAllRecords,
    initialQuery: { fetchOpenRequest: true }
  });
  const {
    data: leaveRequestData,
    onRefresh: leaveRequestRefresh,
    setData: leaveRequestSetData,
    meta: leaveRequestMeta,
    setMeta: leaveRequestSetMeta,
    loading: leaveRequestLoading
  } = useFetchData<LeaveRequestType[]>({
    method: leaveRequestModule.getAllRecords,
    initialQuery: { fetchOpenRequest: true },
  });
  const {
    data: reimbursementData,
    onRefresh: reimbursementRefresh,
    setData: reimbursementSetData,
    meta: reimbursementMeta,
    setMeta: reimbursementSetMeta,
    loading: reimbursementLoading
  } = useFetchData<ReimbursementType[]>({
    method: reimbursementModule.getAllRecords,
    initialQuery: { fetchOpenRequest: true }
  });
  const {
    data: cashAdvanceData,
    onRefresh: cashAdvanceRefresh,
    setData: cashAdvanceSetData,
    meta: cashAdvanceMeta,
    setMeta: cashAdvanceSetMeta,
    loading: cashAdvanceLoading
  } = useFetchData<CashAdvanceType[]>({
    method: cashAdvanceModule.getAllRecords,
    initialQuery: { fetchOpenRequest: true }
  });

  const [drawer, setDrawer] = useState<MyDrawerType>({
    carReservation: {
      open: false,
      recordId: 0,
      data: carReservationData,
      title: 'Car Reservation Requests',
      card: (carReservation, onClick) => CarReservationCard({ carReservation, onClick, isFullWidth: true }),
      meta: carReservationMeta,
      setMeta: carReservationSetMeta,
      setData: carReservationSetData,
      module: carReservationModule
    },
    leaveRequest: {
      open: false,
      recordId: 0,
      data: leaveRequestData,
      title: 'Leave Requests',
      card: (leaveRequest, onClick) => LeaveRequestCard({ leaveRequest, onClick, isFullWidth: true }),
      meta: leaveRequestMeta,
      setMeta: leaveRequestSetMeta,
      setData: leaveRequestSetData,
      module: leaveRequestModule
    },
    reimbursement: {
      open: false,
      recordId: 0,
      data: reimbursementData,
      title: 'Reimbursement Requests',
      card: (reimbursement, onClick) => ReimbursementCard({ reimbursement, onClick, isFullWidth: true }),
      meta: reimbursementMeta,
      setMeta: reimbursementSetMeta,
      setData: reimbursementSetData,
      module: reimbursementModule
    },
    cashAdvance: {
      open: false,
      recordId: 0,
      data: cashAdvanceData,
      title: 'Cash Advance Requests',
      card: (cashAdvance, onClick) => CashAdvanceCard({ cashAdvance, onClick, isFullWidth: true }),
      meta: cashAdvanceMeta,
      setMeta: cashAdvanceSetMeta,
      setData: cashAdvanceSetData,
      module: cashAdvanceModule
    },
  });

  const handleDrawerClose = (drawerType: keyof typeof drawer) => {
    setDrawer(prevDrawer => ({
      ...prevDrawer,
      [drawerType]: {
        ...prevDrawer[drawerType],
        open: false,
        recordId: 0
      }
    }));
  };

  useEffect(() => {
    if (carReservationData && leaveRequestData && reimbursementData && cashAdvanceData) {
      setDrawer({
        carReservation: { ...drawer.carReservation, data: carReservationData, meta: carReservationMeta },
        leaveRequest: { ...drawer.leaveRequest, data: leaveRequestData, meta: leaveRequestMeta },
        reimbursement: { ...drawer.reimbursement, data: reimbursementData, meta: reimbursementMeta },
        cashAdvance: { ...drawer.cashAdvance, data: cashAdvanceData, meta: cashAdvanceMeta },
      })
    }
  }, [carReservationData, leaveRequestData, reimbursementData, cashAdvanceData])

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
        heading="Employee Requests"
        breadCrumbData={breadCrumbsData}
        filters={<div style={{ marginTop: '1.5rem' }}>
          <div style={{ minWidth: "15%" }}>
            <Select
              allowClear
              placeholder="Search for the user"
              className="selectAntdCustom"
              onChange={(value) => {
                carReservationRefresh({ userId: value })
                leaveRequestRefresh({ userId: value })
                cashAdvanceRefresh({ userId: value })
                reimbursementRefresh({ userId: value })
              }}
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
                      No data found, Please search for the manager
                    </span>
                  }
                />
              }
            />
          </div>
        </div>}
      />
      <section className={styles.container}>
        {Object.entries(drawer).map(([key, value]) => (
          <div className={styles.requestContainer}>
            <div className={styles.head}>
              <div className={styles.containerTitle}>{value.title}</div>
              <Button size="small" href={"/employee-requests/" + value.title.toLowerCase().replaceAll(" ", "-")}>Manage</Button>
            </div>
            <InfiniteScroll
              dataLength={value.data?.length || 0}
              next={() => {
                value.module.getAllRecords({ page: Number(value.meta?.page) + 1, fetchOpenRequest: true })
                  .then((res) => {
                    value.setData([...value.data!, ...res.data.data]);
                    value.setMeta(res.data.meta);
                  })
              }}
              hasMore={Number(value.meta?.pageCount) > Number(value.meta?.page)}
              loader={<Skeleton active />}
              height={'40vh'}
              // scrollThreshold={0.75}
              className={"infinite-scroll-wrap"}

            >
              <div className={styles.cardContainer}>
                {(carReservationLoading || cashAdvanceLoading || leaveRequestLoading || reimbursementLoading) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Skeleton.Input size="large" active style={{ height: '115px', width: '100%', borderRadius: '0.25rem' }} />
                    <Skeleton.Input size="large" active style={{ height: '115px', width: '100%', borderRadius: '0.25rem' }} />
                  </div>
                ) : (value.data && value.data.length > 0) ? value.data.map((item, index) => (
                  <Fragment key={index}>
                    {value.card(item as ModuleCombinedType, () => {
                      setDrawer({
                        ...drawer,
                        [key]: {
                          ...drawer[key as keyof typeof drawer],
                          open: true, recordId: item.id
                        }
                      })
                    })}
                  </Fragment>
                )) : (
                  <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{ height: 100 }}
                    description={<span>No open requests</span>}
                  />
                )}
              </div>
            </InfiniteScroll>
          </div>
        ))}
      </section>

      {drawer.carReservation.open && (
        <CarReservationDrawer
          openDrawer={drawer.carReservation.open}
          onClose={() => handleDrawerClose('carReservation')}
          permissions={carReservationPermissions}
          record={drawer.carReservation.recordId}
          reloadTableData={carReservationRefresh}
        />
      )}
      {drawer.leaveRequest.open && (
        <LeaveRequestDrawer
          openDrawer={drawer.leaveRequest.open}
          onClose={() => handleDrawerClose('leaveRequest')}
          permissions={leaveRequestPermissions}
          record={drawer.leaveRequest.recordId}
          reloadTableData={leaveRequestRefresh}
        />
      )}
      {drawer.reimbursement.open && (
        <ReimbursementDrawer
          openDrawer={drawer.reimbursement.open}
          onClose={() => handleDrawerClose('reimbursement')}
          permissions={reimbursementPermissions}
          record={drawer.reimbursement.recordId}
          reloadTableData={reimbursementRefresh}
        />
      )}
      {drawer.cashAdvance.open && (
        <CashAdvanceDrawer
          openDrawer={drawer.cashAdvance.open}
          onClose={() => handleDrawerClose('cashAdvance')}
          permissions={cashAdvancePermissions}
          record={drawer.cashAdvance.recordId}
          reloadTableData={cashAdvanceRefresh}
        />
      )}
    </Layout>
  );
};
export default EmployeeRequests;