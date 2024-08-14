import { CustomEmpty, PageHeader } from "@atoms/";
import Layout from "@templates/Layout";
import styles from "./styles.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CashAdvanceDrawer } from "./CashAdvanceDrawer";
import { Pagination, message } from "antd";
import { useFetchData } from "hooks";
import { CashAdvanceType } from "@modules/CashAdvance/types";
import { CashAdvanceModule } from "@modules/CashAdvance";
import { CashAdvanceModal } from "./create";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { CashAdvancePermissionsEnum } from "@modules/CashAdvance/permissions";
import { CashAdvanceCard } from "./card";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";
import { CardShimmer } from "@atoms/CardShimmer";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
  {
    text: "Home",
    isLink: true,
    path: "/",
  },
  {
    isLink: true,
    text: "My Services",
    path: "/myservices",
  },
  {
    isLink: false,
    text: "Cash Advance Request",
  },
];

const CashAdvance = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(CashAdvancePermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in CashAdvancePermissionsEnum]: boolean };
  const { createCashAdvance } = permissions;

  const [currentEditType, setcurrentEditType] = useState<{
    recordId: number;
    openModal: boolean;
  }>({
    recordId: 0,
    openModal: false,
  });
  const [openDrawer, setOpenDrawer] = useState(false);

  const module = useMemo(() => new CashAdvanceModule(), []);

  const [filters] = useState({
    page: 1,
    perPage: 6
  });

  const { data, onRefresh, loading, meta } = useFetchData<CashAdvanceType[]>({
    method: module.getOwnRecords,
    initialQuery: { ...filters }
  });

  const onCancelClick = () => {
    if (createCashAdvance === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal
    });
  };

  //user search
  const [searchTermUser] = useState("");
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
        heading="Cash Advance Request"
        breadCrumbData={breadCrumbsData}
        showAdd={createCashAdvance === true ? true : false}
        buttonText="New Request"
        onButtonClick={onCancelClick}
      />
      <section className={styles.container}>
        {loading ? (
          [...new Array(6)].map((_, index) => <CardShimmer key={`shimmer${index}`} />)
        ) : (
          data?.length !== 0 ? (
            data?.map((cashAdvance, index) => (
              <CashAdvanceCard
                key={`cashAdvance-${index}`}
                cashAdvance={cashAdvance}
                onClick={() => {
                  setcurrentEditType({ ...currentEditType, recordId: cashAdvance.id });
                  setOpenDrawer(true);
                }}
              />
            ))
          ) : (
            <div style={{ margin: 'auto' }}>
              <CustomEmpty description="No requests found for the given filters" />
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
        <CashAdvanceDrawer
          openDrawer={openDrawer}
          onClose={() => setOpenDrawer(false)}
          permissions={permissions}
          record={currentEditType.recordId}
          reloadTableData={onRefresh}
        />
      )}
      <CashAdvanceModal
        reloadTableData={onRefresh}
        onCancel={onCancelClick}
        openModal={currentEditType.openModal}
        permissions={permissions}
      />
    </Layout>
  );
};
export default CashAdvance;