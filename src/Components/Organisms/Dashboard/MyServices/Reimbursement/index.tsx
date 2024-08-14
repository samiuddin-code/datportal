import { CustomEmpty, PageHeader } from "../../../../Atoms";
import Layout from "../../../../Templates/Layout";
import styles from "./styles.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReimbursementDrawer } from "./ReimbursementDrawer";
import { message } from "antd";
import { useFetchData } from "hooks";
import { ReimbursementType } from "@modules/Reimbursement/types";
import { ReimbursementModule } from "@modules/Reimbursement";
import { ReimbursementModal } from "./create";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { ReimbursementPermissionsEnum } from "@modules/Reimbursement/permissions";
import { ReimbursementCard } from "./card";
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
    text: "Reimbursements",
  },
];

const Reimbursements = () => {
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(ReimbursementPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ReimbursementPermissionsEnum]: boolean };
  const { createReimbursement } = permissions;

  const [currentEditType, setcurrentEditType] = useState<{
    recordId: number;
    openModal: boolean;
  }>({
    recordId: 0,
    openModal: false,
  });
  const [openDrawer, setOpenDrawer] = useState(false);

  const module = useMemo(() => new ReimbursementModule(), []);

  const { data, onRefresh, setData, loading } = useFetchData<ReimbursementType[]>({
    method: module.getOwnRecords,
    // initialQuery: { perPage: 25 }
  });

  const onCancelClick = () => {
    if (createReimbursement === false) {
      message.error("You don't have permission to create new record");
      return;
    }
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal
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
  }, [debouncedSearchTermUser])
  useEffect(() => {
    onUserSearch()
  }, [onUserSearch])

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Reimbursements"
        breadCrumbData={breadCrumbsData}
        showAdd={createReimbursement === true ? true : false}
        buttonText="New Reimbursement"
        onButtonClick={onCancelClick}
      />
      <section className={styles.container}>
        {loading ? (
          [...new Array(6)].map((_, index) => <CardShimmer key={`shimmer${index}`} />)
        ) : (
          data?.length !== 0 ? (
            data?.map((reimbursement, index) => (
              <ReimbursementCard
                key={index}
                reimbursement={reimbursement}
                onClick={() => {
                  setcurrentEditType({ ...currentEditType, recordId: reimbursement.id });
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
      {openDrawer && (
        <ReimbursementDrawer
          openDrawer={openDrawer}
          onClose={() => setOpenDrawer(false)}
          permissions={permissions}
          record={currentEditType.recordId}
          reloadTableData={onRefresh}
        />
      )}
      <ReimbursementModal
        reloadTableData={onRefresh}
        onCancel={onCancelClick}
        openModal={currentEditType.openModal}
        permissions={permissions}
      />
    </Layout>
  );
};
export default Reimbursements;