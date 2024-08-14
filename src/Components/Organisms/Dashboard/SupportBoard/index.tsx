import { useState, ChangeEvent, useEffect } from "react";
import { Avatar, Input, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { SearchOutlined, } from "@ant-design/icons";
import { CustomFilter, PageHeader } from "@atoms/";
import Layout from "@templates/Layout";
import { TaskSort } from "@helpers/commonEnums";
import { TaskPermissionsEnum } from "@modules/Task/permissions";
import { TaskMember, TaskQuery, TaskType } from "@modules/Task/types";
import { TaskModule } from "@modules/Task";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { useSearchParams } from "react-router-dom";
import { APIResponseObject } from "@modules/Common/common.interface";
import KanbanBoard from "./KanbanBoard";
import { TechSupportModal } from "../MyServices/TechSupport/create";
import { getPermissionSlugs } from "@helpers/common";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import styles from "./styles.module.scss";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Tech Support" },
];

const SupportBoard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const taskModule = new TaskModule();
  // get the saved searches id from the url 
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number>();
  const [taskMembers, setTaskMembers] = useState<TaskMember[]>([])
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [meta, setMeta] = useState<Array<APIResponseObject["meta"]>>(Array(3).fill({}));
  const [taskFilters, setTaskFilters] = useState<TaskQuery>({
    sortByField: 'order',
    sortOrder: 'asc',
    userIds: searchParams?.get("userIds") ? JSON.parse(searchParams?.get("userIds") || "") : []
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm"));

  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(TaskPermissionsEnum)
  const taskPermissions = userPermissions as { [key in TaskPermissionsEnum]: boolean };

  const fetchData = async (query?: TaskQuery) => {
    setIsLoading(true);
    try {
      const statuses = [1, 2, 3];
      const requests = statuses.map(status => taskModule.getTechSupportRequest({ status, ...query }));
      const results = await Promise.allSettled(requests);

      const tasks: TaskType[] = [];
      const meta: Array<APIResponseObject["meta"]> = Array(3).fill({});

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          tasks.push(...result.value.data.data);
          meta[index] = result.value.data.meta;
        }
      });

      setTasks(tasks);
      setMeta(meta);
    } catch (error) {
      console.error(error, 'Error fetching tasks');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isFirstRender) {
      if (searchParams.get("taskId")) {
        setOpenDetailModal(!openDetailModal);
        setSelectedTask(Number(searchParams.get("taskId")))
      }
      setIsFirstRender(false)
    }
  }, [])

  useEffect(() => {
    fetchData({ ...taskFilters });
  }, [])

  useEffect(() => {
    const allUsers: TaskMember[] = [];
    tasks.forEach(task => {
      task.TaskMembers.forEach((member) => {
        if (!allUsers.some(user => user.User.id === member.User.id)) {
          allUsers.push(member);
        }
      })
    })
    setTaskMembers(allUsers);
  }, [tasks])

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Tech Support"
        breadCrumbData={breadCrumbsData}
        showAdd={taskPermissions.createTask}
        buttonText="Add New Request"
        onButtonClick={() => setOpenTaskModal(!openTaskModal)}
        filters={
          <div>
            <Input
              allowClear
              value={searchTerm || ""}
              placeholder="Search this board"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event?.target?.value);
                if (event.target.value) {
                  searchParams.set("searchTerm", event?.target?.value.toLowerCase())
                  setSearchParams(searchParams);
                } else {
                  searchParams.delete("searchTerm");
                  setSearchParams(searchParams);
                }
              }}
              style={{ width: 220, borderRadius: '0.25rem' }}
              suffix={<SearchOutlined />}
            />

            <div>
              <Avatar.Group maxCount={5}>
                {taskMembers.map((member) => (
                  <Tooltip
                    key={member.User.uuid}
                    overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                    title={`${member.User.firstName} ${member.User.lastName}`}
                  >
                    <Avatar
                      size={32}
                      onClick={() => {
                        let userIds = taskFilters.userIds;
                        if (!userIds?.some(user => user === member.User.id)) {
                          userIds?.push(member.User.id);
                        } else {
                          userIds = userIds?.filter(item => item !== member.User.id);
                        }
                        if (userIds?.length) {
                          searchParams.set("userIds", JSON.stringify(userIds));
                        } else {
                          searchParams.delete("userIds");
                        }
                        setSearchParams(searchParams);
                        fetchData({ ...taskFilters, userIds });
                        setTaskFilters({ ...taskFilters, userIds });
                      }}
                      style={{
                        border: taskFilters.userIds?.includes(member.User.id) ? '2px solid var(--color-primary-main)' : '0.5px solid var(--color-light-200)'
                        , cursor: 'pointer'
                      }}
                      src={RESOURCE_BASE_URL + member.User.profile}
                      icon={<UserOutlined />}
                    />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div>

            <div className={styles.sortBy}>
              <CustomFilter
                type="radio"
                label="Sort By"
                name="sortBy"
                options={Object.entries(TaskSort).map(([key, value]) => ({
                  label: key,
                  value: value,
                }))}
                value={taskFilters?.sortByField}
                onChange={(e) => setTaskFilters({ ...taskFilters, sortByField: e.target.value })}
                onReset={() => {
                  const _temp = { ...taskFilters, sortByField: undefined };
                  setTaskFilters(_temp);
                  fetchData(_temp);
                }}
                onUpdate={(taskFilter = taskFilters) => {
                  fetchData({
                    ...taskFilter,
                    sortByField: taskFilters.sortByField,
                    sortOrder: taskFilter.sortOrder
                  });
                }}
                withSort
              />
            </div>
          </div>
        }
      />
      <KanbanBoard
        tasks={tasks}
        setTasks={setTasks}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        searchTerm={searchTerm}
        meta={meta}
        setMeta={setMeta}
        openDetailModal={openDetailModal}
        setOpenDetailModal={setOpenDetailModal}
        setSelectedTask={setSelectedTask}
        isLoading={isLoading}
        module={taskModule}
      />

      {selectedTask && (
        <TaskDetailsModal
          openModal={openDetailModal}
          onCancel={() => {
            setOpenDetailModal(!openDetailModal);
            searchParams.delete("taskId");
            setSearchParams(searchParams)
          }}
          id={selectedTask}
          onUpdate={fetchData}
        />
      )}
      {openTaskModal && (
        <TechSupportModal
          reloadTableData={fetchData}
          onCancel={() => setOpenTaskModal(!openTaskModal)}
          openModal={openTaskModal}
          permissions={taskPermissions}
        />
      )}
    </Layout>
  );
};
export default SupportBoard;
