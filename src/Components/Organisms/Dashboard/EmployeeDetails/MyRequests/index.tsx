import styles from "./styles.module.scss";
import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from "react";
import { Empty, Skeleton, } from "antd";
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
import { CarReservationDrawer } from "../../MyServices/CarReservation/CarReservationDrawer";
import { CarReservationCard } from "../../MyServices/CarReservation/card";
import { LeaveRequestCard } from "../../MyServices/LeaveRequest/card";
import { ReimbursementCard } from "../../MyServices/Reimbursement/card";
import { CashAdvanceCard } from "../../MyServices/CashAdvance/card";
import { LeaveRequestType } from "@modules/LeaveRequest/types";
import { ReimbursementType } from "@modules/Reimbursement/types";
import { CashAdvanceType } from "@modules/CashAdvance/types";
import { LeaveRequestDrawer } from "../../MyServices/LeaveRequest/LeaveRequestDrawer";
import { ReimbursementDrawer } from "../../MyServices/Reimbursement/ReimbursementDrawer";
import { CashAdvanceDrawer } from "../../MyServices/CashAdvance/CashAdvanceDrawer";
import InfiniteScroll from "react-infinite-scroll-component";
import { APIResponseObject } from "@modules/Common/common.interface";

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

const MyRequests = ({ userId, activeFilter }: { userId: number, activeFilter: 'all' | 'open' | 'closed' }) => {
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
  } = useFetchData<CarReservationType[]>({
    method: carReservationModule.getAllRecords,
    initialQuery: { userId: userId }
  });
  const {
    data: leaveRequestData,
    onRefresh: leaveRequestRefresh,
    setData: leaveRequestSetData,
    meta: leaveRequestMeta,
    setMeta: leaveRequestSetMeta
  } = useFetchData<LeaveRequestType[]>({
    method: leaveRequestModule.getAllRecords,
    initialQuery: { userId: userId }
  });
  const {
    data: reimbursementData,
    onRefresh: reimbursementRefresh,
    setData: reimbursementSetData,
    meta: reimbursementMeta,
    setMeta: reimbursementSetMeta
  } = useFetchData<ReimbursementType[]>({
    method: reimbursementModule.getAllRecords,
    initialQuery: { userId: userId }
  });
  const {
    data: cashAdvanceData,
    onRefresh: cashAdvanceRefresh,
    setData: cashAdvanceSetData,
    meta: cashAdvanceMeta,
    setMeta: cashAdvanceSetMeta
  } = useFetchData<CashAdvanceType[]>({
    method: cashAdvanceModule.getAllRecords,
    initialQuery: { userId: userId }
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

  useEffect(() => {
    if (["closed", "open"].includes(activeFilter)) {
      carReservationRefresh({ fetchOpenRequest: activeFilter === "open" ? true : false })
      leaveRequestRefresh({ fetchOpenRequest: activeFilter === "open" ? true : false })
      reimbursementRefresh({ fetchOpenRequest: activeFilter === "open" ? true : false })
      cashAdvanceRefresh({ fetchOpenRequest: activeFilter === "open" ? true : false })
    }
    else {
      carReservationRefresh()
      leaveRequestRefresh()
      reimbursementRefresh()
      cashAdvanceRefresh()
    }
  }, [activeFilter])

  return (
    <section className={styles.container}>
      {Object.entries(drawer).map(([key, value]) => (
        <div className={styles.requestContainer} key={key}>
          <div className={styles.containerTitle}>{value.title}</div>
          <InfiniteScroll
            dataLength={value.data?.length || 0}
            next={() => {
              value.module.getAllRecords({ page: Number(value.meta?.page) + 1, userId: userId })
                .then((res) => {
                  value.setData([...value.data!, ...res.data.data]);
                  value.setMeta(res.data.meta);
                })
            }}
            hasMore={Number(value.meta?.pageCount) > Number(value.meta?.page)}
            loader={<Skeleton active />}
            height={'34vh'}
            // scrollThreshold={0.75}
            className={"infinite-scroll-wrap"}
          >
            <div className={styles.cardContainer}>
              {(value.data && value.data.length > 0) ? value.data.map((item, index) => (
                <Fragment key={index}>
                  {value.card(item as ModuleCombinedType, () => setDrawer({
                    ...drawer, [key]: {
                      ...drawer[key as keyof typeof drawer],
                      open: true, recordId: item.id
                    }
                  }))}
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
    </section>

  );
};
export default MyRequests;