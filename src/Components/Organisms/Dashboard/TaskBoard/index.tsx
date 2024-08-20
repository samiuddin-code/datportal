import { useState, ChangeEvent, useEffect, FC } from "react";
import { message, Input, Button, Avatar, Tooltip } from "antd";
import { Select } from "antd";

import {
  SearchOutlined, DatabaseOutlined, TableOutlined, UserOutlined
} from "@ant-design/icons";
import { CustomFilter, PageHeader } from "@atoms/";
import Layout from "@templates/Layout";
import styles from "./styles.module.scss";
import { TaskSort } from "@helpers/commonEnums";
import { TaskPermissionsEnum } from "@modules/Task/permissions";
import { TaskMember, TaskQuery, TaskType } from "@modules/Task/types";
import { TaskModule } from "@modules/Task";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { TaskModal } from "../../Header/Task/modal";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import { useSearchParams } from "react-router-dom";
import { APIResponseObject } from "@modules/Common/common.interface";
import { useDebounce } from "@helpers/useDebounce";
import { ProjectModule } from "@modules/Project";
import { ProjectTypes } from "@modules/Project/types";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import useLocalStorage from "@helpers/useLocalStorage";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { getPermissionSlugs } from "@helpers/common";

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { isLink: false, text: "Tasks" },
];

type SearchResultsTypes<T> = {
  data: T[];
  loading: boolean;
};

type TaskViewType = "board" | "table";

const TaskBoard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [taskView, setTaskView] = useLocalStorage<TaskViewType>("taskView", "board");
  const taskModule = new TaskModule();
  const projectModule = new ProjectModule();
  // get the saved searches id from the url 
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number>();
  const [taskMembers, setTaskMembers] = useState<TaskMember[]>([])
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [meta, setMeta] = useState<Array<APIResponseObject["meta"]>>(Array(3).fill({}));
  const [tableMeta, setTableMeta] = useState<APIResponseObject["meta"]>();
  const [taskFilters, setTaskFilters] = useState<TaskQuery>({
    type: searchParams.get("type") as TaskQuery["type"] || undefined,
    sortByField: 'order',
    sortOrder: 'asc',
    projectId: searchParams?.get("projectId") ? Number(searchParams?.get("projectId")) : undefined,
    userIds: searchParams?.get("userIds") ? JSON.parse(searchParams?.get("userIds") || "") : []
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm"));
  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  // Project Debounce
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);
  // Client Search Results
  const [projectOptions, setProjectOptions] = useState<SearchResultsTypes<ProjectTypes>>({
    data: [], loading: false,
  });
  // Project Search
  const onProjectSearch = () => {
    if (debouncedSearchTermProject) {
      setProjectOptions({ ...projectOptions, loading: true })
      projectModule.getAllRecords({ title: debouncedSearchTermProject }).then((res) => {

        const { data } = res?.data;

        setProjectOptions((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.filter((item) => {
            return !prev?.data.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return {
            data: [...prev.data, ...filteredData],
            loading: false,
          }
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
    else if (taskFilters.projectId && isFirstRender) {
      setProjectOptions({ ...projectOptions, loading: true })
      projectModule.getRecordById(taskFilters.projectId).then((res) => {
        setProjectOptions({ ...projectOptions, data: [res.data.data] })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }

  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  // available permissions for the properties page
  const permissionSlug = getPermissionSlugs(TaskPermissionsEnum)
  const taskPermissions = userPermissions as { [key in TaskPermissionsEnum]: boolean };

  const fetchData = async (query?: TaskQuery) => {
    setIsLoading(true);
    try {
      if (taskView === "board") {
        const statuses = [1, 2, 3];
        const requests = statuses.map(status => taskModule.getAllRecords({ status, ...query }));
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
      } else if (taskView === "table") {
        const res = await taskModule.getAllRecords({
          page: tableMeta?.page,
          perPage: tableMeta?.perPage,
          ...query,
          ...taskFilters,
          addedBy: taskFilters.addedBy // Ensure this is included for "Assigned By Me" filter
        });
        setTasks([...res.data.data]);
        setTableMeta(res.data.meta);
      }
    } catch (error) {
      console.error(error, 'Error fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  useEffect(() => {
    if (isFirstRender) {
      if (searchParams.get("taskId")) {
        setOpenDetailModal(!openDetailModal);
        setSelectedTask(Number(searchParams.get("taskId")))
      }

      setIsFirstRender(false)
    }
    else if (!isFirstRender) {
      if (taskFilters.type) {
        searchParams.set("type", taskFilters.type)
        setSearchParams(searchParams);
      }
      else {
        searchParams.delete("type");
        setSearchParams(searchParams);
      }
      fetchData({ ...taskFilters })
    }

  }, [taskFilters.type])

  useEffect(() => {
    onProjectSearch();
  }, [debouncedSearchTermProject]);

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

  useEffect(() => {
    fetchData({ type: taskFilters.type, projectId: taskFilters.projectId })
  }, [taskView, tableMeta?.page, tableMeta?.perPage])

  const componentMap: { [key in TaskViewType]: FC<any> } = {
    "board": KanbanBoard,
    "table": TaskTable
  };
  useEffect(() => {
    fetchData({ ...taskFilters });
  }, [taskFilters]);  
  
  const ViewComponent = componentMap[taskView];

  return (
    <Layout permissionSlug={permissionSlug}>
      <PageHeader
        heading="Tasks"
        breadCrumbData={breadCrumbsData}
        showAdd={taskPermissions.createTask}
        buttonText="Add New Task"
        onButtonClick={() => setOpenTaskModal(!openTaskModal)}
        filters={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              allowClear
              value={searchTerm || ""}
              placeholder="Search this board"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const value = event?.target?.value;
                setSearchTerm(value);
                if (value) {
                  searchParams.set("searchTerm", value.toLowerCase());
                } else {
                  searchParams.delete("searchTerm");
                }
                setSearchParams(searchParams);
              }}
              style={{ width: 220, borderRadius: '0.25rem', marginRight: '16px' }}
              suffix={<SearchOutlined />}
            />
            <CustomFilter
              type="radio"
              label="Project"
              name="projectId"
              withSearch={true}
              options={projectOptions?.data?.map((item) => ({
                label: `${item.referenceNumber} | ${item.title}`,
                value: `${item.id}`,
              }))}
              onChange={(e) => setTaskFilters({ ...taskFilters, projectId: Number(e.target.value) })}
              value={taskFilters?.projectId?.toString()}
              defaultValue={searchParams?.get("projectId")!}
              onReset={() => {
                searchParams.delete("projectId");
                setSearchParams(searchParams);
                const _temp = { ...taskFilters, projectId: undefined };
                setTaskFilters(_temp);
                fetchData(_temp);
              }}
              onUpdate={(taskFilter = taskFilters) => {
                fetchData({
                  ...taskFilter,
                  projectId: taskFilters.projectId,
                });
                if (taskFilters?.projectId) searchParams.set("projectId", taskFilters?.projectId?.toString());
                setSearchParams(searchParams);
              }}
              loading={projectOptions.loading}
              searchTerm={searchTermProject}
              onSearch={(event) => setSearchTermProject(event.currentTarget.value)}
            />
    <Select
  value={taskFilters.type || ""}
  style={{ width: 180, marginRight: '16px' }}
  onChange={(value) => {
    const validValues: ("myTask" | "assignedTask" | "assignedTask" | undefined)[] = ["myTask", "assignedTask", "assignedTask", undefined];
    const filterValue = validValues.includes(value as "myTask" | "assignedTask" | "assignedTask") ? value as "myTask" | "assignedTask" | "assignedTask" : undefined;

    const updatedSearchParams = new URLSearchParams(searchParams);
    if (filterValue) {
      updatedSearchParams.set("type", filterValue);
    } else {
      updatedSearchParams.delete("type");
    }
    setSearchParams(updatedSearchParams.toString());

    setTaskFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, type: filterValue };
      fetchData(updatedFilters);  // Ensure fetchData is called with updated filters
      return updatedFilters;
    });
  }}
>
  <Select.Option
    value="myTask"
    style={{
      backgroundColor: taskFilters.type === 'myTask' ? "var(--color-dark-main)" : undefined,
      color: taskFilters.type === 'myTask' ? "var(--color-inactive)" : undefined,
    }}
  >
    Assigned For Me
  </Select.Option>
  <Select.Option
    value="assignedTask"
    style={{
      backgroundColor: taskFilters.type === 'assignedTask' ? "var(--color-dark-main)" : undefined,
      color: taskFilters.type === 'assignedTask' ? "var(--color-inactive)" : undefined,
    }}
  >
    Assigned By Me
  </Select.Option>
  <Select.Option
    value="" // This represents "All Tasks"
    style={{
      backgroundColor: !taskFilters.type ? "var(--color-dark-main)" : undefined,
      color: !taskFilters.type ? "var(--color-inactive)" : undefined,
    }}
  >
    All Tasks
  </Select.Option>
</Select>






            <div>
              <Avatar.Group maxCount={5}>
                {taskMembers.map((member) => (
                  <Tooltip
                    overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                    key={member.User.uuid}
                    title={`${member.User.firstName} ${member.User.lastName}`}
                  >
                    <Avatar
                      size={32}
                      onClick={() => {
                        let userIds = taskFilters.userIds || [];
                        if (!userIds.includes(member.User.id)) {
                          userIds.push(member.User.id);
                        } else {
                          userIds = userIds.filter(id => id !== member.User.id);
                        }
                        if (userIds.length) {
                          searchParams.set("userIds", JSON.stringify(userIds));
                        } else {
                          searchParams.delete("userIds");
                        }
                        setSearchParams(searchParams);
                        fetchData({ ...taskFilters, userIds });
                        setTaskFilters({ ...taskFilters, userIds });
                      }}
                      style={{
                        border: taskFilters.userIds?.includes(member.User.id)
                          ? '2px solid var(--color-primary-main)'
                          : '0.5px solid var(--color-light-200)',
                        cursor: 'pointer'
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
                    sortOrder: taskFilter.sortOrder,
                  });
                }}
                withSort
              />
              <div>
                {taskView === "table" && (
                  <Button onClick={() => setTaskView("board")} icon={<DatabaseOutlined style={{ fontSize: 20 }} />} />
                )}
                {taskView === "board" && (
                  <Button onClick={() => setTaskView("table")} icon={<TableOutlined style={{ fontSize: 20 }} />} />
                )}
              </div>
            </div>
          </div>
        }
      />
      <ViewComponent
        tasks={tasks}
        setTasks={setTasks}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        openDetailModal={openDetailModal}
        setOpenDetailModal={setOpenDetailModal}
        setSelectedTask={setSelectedTask}
        meta={taskView === "board" ? meta : tableMeta}
        setMeta={taskView === "board" ? setMeta : setTableMeta}
        searchTerm={taskView === "board" ? searchTerm : undefined}
        isLoading={taskView === "board" ? isLoading : undefined}
        module={taskView === "board" ? taskModule : undefined}
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
        <TaskModal
          onCancel={() => setOpenTaskModal(!openTaskModal)}
          openModal={openTaskModal}
          permissions={taskPermissions}
          onUpdate={fetchData}
        />
      )}
    </Layout>
  );
};
export default TaskBoard;
