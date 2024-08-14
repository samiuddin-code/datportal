import { useCallback, useRef, ReactNode, FC, Dispatch, SetStateAction } from "react";
import { Avatar, Tooltip, message, Skeleton } from "antd";
import { UserOutlined, FileOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import { taskColumnLabels, taskPriority } from "@helpers/commonEnums";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from "immutability-helper";
import { TaskType } from "@modules/Task/types";
import { TaskModule } from "@modules/Task";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { convertDate } from "@helpers/dateHandler";
import { SetURLSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { APIResponseObject } from "@modules/Common/common.interface";


type KanbanBoardPropsTypes = {
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  tasks: TaskType[],
  setTasks: Dispatch<SetStateAction<TaskType[]>>,
  meta: Array<APIResponseObject["meta"]>,
  setMeta: Dispatch<SetStateAction<Array<APIResponseObject["meta"]>>>,
  searchTerm: string | null,
  openDetailModal: boolean,
  setOpenDetailModal: Dispatch<SetStateAction<boolean>>,
  setSelectedTask: Dispatch<SetStateAction<number | undefined>>,
  module: TaskModule,
  isLoading: boolean
};

type KanbanColumnProps = {
  status: number;
  children: ReactNode;
  changeTaskStatus: (id: number, status: number) => void;
};

type KanbanItemProps = {
  children: ReactNode
  item: TaskType;
  items: TaskType[];
  moveTask: (dragIndex: number, hoverIndex: number) => void;
}

const KanbanBoard = (props: KanbanBoardPropsTypes) => {
  const {
    searchParams, setSearchParams, tasks,
    setTasks, meta, setMeta, searchTerm,
    openDetailModal, setOpenDetailModal,
    setSelectedTask, module, isLoading
  } = props;
  const columns = [1, 2, 3];

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragRow = tasks![dragIndex];

    setTasks(update(tasks, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    }));

    module.updateOrder({ order: dragIndex }, dragRow.id).catch((err) => {
      if (err.message) {
        message.error(err.message);
      } else {
        message.error('Something went wrong');
      }
    });
  }, [tasks]);

  const changeTaskStatus = useCallback((index: number, status: number) => {
    const task = tasks![index];

    if (task.status === status) return;

    let newTasks = [...tasks!];
    newTasks[index].status = status;
    setTasks(newTasks);

    module.updateRecord({ status: status }, task.id).then((res) => {
    }).catch((err) => {
      if (err.message) {
        message.error(err.message);
      } else {
        message.error('Something went wrong');
      }
    });
  }, [tasks]);

  return (
    <DndProvider backend={HTML5Backend}>
      <section className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column}
            status={column}
            changeTaskStatus={changeTaskStatus}>
            <div className={styles.column}>
              <div className={styles.columnHead}>
                {taskColumnLabels[column as keyof typeof taskColumnLabels]} ({Number(meta[column - 1]?.total) ? Number(meta[column - 1]?.total) : ""})
              </div>
              <div>
                {/* meta[column-1] subtracting one because array index is 0,1,2 and column is 1,2,3 */}
                <InfiniteScroll
                  dataLength={tasks.filter(item => item.status === column).length}
                  next={() => {
                    module.getAllRecords({ status: column, page: Number(meta[column - 1]?.page) + 1 })
                      .then((res) => {
                        setTasks([
                          ...tasks,
                          ...res.data.data,
                        ]);
                        const _temp = meta
                        _temp[column - 1] = res.data.meta;
                        setMeta(_temp);
                      })
                  }}
                  hasMore={Number(meta[column - 1]?.pageCount) > Number(meta[column - 1]?.page)}
                  loader={<Skeleton active />}
                  height={'70vh'}
                  scrollThreshold={0.75}
                  className="infinite-scroll-wrap"

                >
                  {isLoading ?
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Array(3).fill(0).map((_, index) => (
                        <Skeleton.Input key={index} size="large" active style={{ height: '3.5vw', width: '100%', borderRadius: '0.25rem' }} />
                      ))}
                    </div>
                    : tasks?.filter(item => (item.status === column))
                      .filter(task => searchTerm ? task?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) : true)
                      .map(item => (
                        <KanbanItem
                          key={item.id}
                          item={item} items={tasks}
                          moveTask={moveTask}
                        >
                          <div className={styles.kanbanItem} onClick={() => {
                            setSelectedTask(item.id);
                            setOpenDetailModal(!openDetailModal);
                            searchParams.set("taskId", item.id.toString())
                            setSearchParams(searchParams);
                          }}>
                            <div>{item.title}</div>
                            <div className={styles.kanbanItemBottom}>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                                <div
                                  className={styles.priorityPill}
                                  style={{
                                    backgroundColor: taskPriority[item.priority as keyof typeof taskPriority].color
                                  }}>
                                  {taskPriority[item.priority as keyof typeof taskPriority].title}
                                </div>
                                <div
                                  style={{ color: 'var(--color-light-300)', fontSize: 'var(--font-size-xs)' }}
                                >
                                  {convertDate(item?.taskEndOn || "", "dd MM,yy")}
                                </div>
                                {item._count.Resources > 0 && <div className={styles.file}>
                                  <FileOutlined />&nbsp;{item._count.Resources}
                                </div>}
                              </div>
                              <div className={styles.kanbanItemBottomBottom}>
                                <Avatar.Group>
                                  {item.TaskMembers.map((member) => (
                                    <Tooltip
                                      overlayInnerStyle={{ borderRadius: '0.25rem', fontSize: 'var(--font-size-sm)' }}
                                      placement={item.status === 3 ? "left" : "bottom"}
                                      key={member.User.uuid}
                                      title={member.User.firstName + " " + member.User.lastName}>
                                      <Avatar
                                        size={25}
                                        style={{ border: '0.5px solid var(--color-light-200)' }}
                                        src={RESOURCE_BASE_URL + member.User.profile}
                                        icon={<UserOutlined />}
                                      />
                                    </Tooltip>
                                  ))}
                                </Avatar.Group>
                              </div>
                            </div>
                          </div>
                        </KanbanItem>
                      ))}
                </InfiniteScroll>
              </div>
            </div>
          </KanbanColumn>
        ))}
      </section>
    </DndProvider>
  )
}
export default KanbanBoard;


const KanbanColumn: FC<KanbanColumnProps> = ({ status, changeTaskStatus, children }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "card",
    drop(item: { index: number }) {
      // console.log("item dropped index", item.index);
      // console.log("status", status);
      // change the status of the task here	
      changeTaskStatus(item.index, status)
    }
  });
  drop(ref);
  return <div style={{ flexGrow: 1 }} ref={ref}> {children}</div>;
};

const KanbanItem: FC<KanbanItemProps> = ({ children, item, items, moveTask }) => {
  const ref = useRef<HTMLDivElement>(null);
  const index = items.indexOf(item);

  const [, drop] = useDrop({
    accept: "card",
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: { index: number; }) => {
      moveTask(item.index, index)
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;

  drop(drag(ref));

  return (
    <div ref={ref} style={{ opacity }}>
      {children}
    </div>
  );
};