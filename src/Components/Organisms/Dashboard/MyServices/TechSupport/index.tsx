import { CustomEmpty, PageHeader } from "../../../../Atoms";
import Layout from "../../../../Templates/Layout";
import styles from "./styles.module.scss";
import { useMemo, useState } from "react";
import { Pagination } from "antd";
import { useFetchData } from "hooks";
import { TechSupportModal } from "./create";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { TechSupportCard } from "./card";
import { CardShimmer } from "@atoms/CardShimmer";
import { TaskPermissionsEnum } from "@modules/Task/permissions";
import { TaskModule } from "@modules/Task";
import { TaskType } from "@modules/Task/types";
import { TaskDetailsModal } from "@organisms/Dashboard/SupportBoard/TaskDetailsModal";
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
    text: "Tech Support Request",
  },
];

const TechSupport = () => {

  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(TaskPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in TaskPermissionsEnum]: boolean };
  const [selectedTask, setSelectedTask] = useState<number>();
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [currentEditType, setcurrentEditType] = useState<{
    recordId: number;
    openModal: boolean;
  }>({
    recordId: 0,
    openModal: false,
  });

  const [filters, setFilters] = useState({
    page: 1,
    perPage: 6,
    type: "assignedTask"
  });

  const module = useMemo(() => new TaskModule(), []);

  const { data, onRefresh, setData, loading, meta } = useFetchData<TaskType[]>({
    method: module.getTechSupportRequest,
    initialQuery: { ...filters }
  });

  const onCancelClick = () => {
    setcurrentEditType({
      ...currentEditType,
      openModal: !currentEditType.openModal
    });
  };

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Tech Support Request"
        breadCrumbData={breadCrumbsData}
        showAdd={true}
        buttonText="New Request"
        onButtonClick={onCancelClick}
      />
      <section className={styles.container}>
        {loading ? (
          [...new Array(6)].map((_, index) => <CardShimmer key={`shimmer${index}`} />)
        ) : (
          data?.length !== 0 ? (
            data?.map((task, index) => (
              <TechSupportCard
                onClick={() => {
                  setSelectedTask(task.id);
                  setOpenDetailModal(!openDetailModal);
                }}
                key={index}
                task={task}
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
      <TechSupportModal
        reloadTableData={onRefresh}
        onCancel={onCancelClick}
        openModal={currentEditType.openModal}
        permissions={permissions}
      />
      {selectedTask && <TaskDetailsModal
        openModal={openDetailModal}
        onCancel={() => {
          setOpenDetailModal(!openDetailModal);
        }}
        id={selectedTask}
        onUpdate={onRefresh}
      />}
    </Layout>
  );
};
export default TechSupport;