import { FC, useState } from 'react';
import { Avatar, Skeleton, Tooltip } from 'antd';
import { UserOutlined } from "@ant-design/icons";
import { RESOURCE_BASE_URL } from '../../../../../../helpers/constants';
import { TaskType } from '../../../../../../Modules/Task/types';
import { taskPriority } from '../../../../../../helpers/commonEnums';
import { convertDate } from '../../../../../../helpers/dateHandler';
import { CustomEmpty } from '../../../../../Atoms';
import styles from './styles.module.scss';
import { TaskDetailsModal } from '../../../TaskBoard/TaskDetailsModal';


interface TaskCardProps {
  data: TaskType[]
  onRefresh: <QueryType = any>(query?: QueryType | undefined) => void
  loading: boolean
}

const TaskCard: FC<TaskCardProps> = ({ data, loading, onRefresh }) => {
  const [detailModal, setDetailModal] = useState({ open: false, id: 0 });

  return (
    <div className={styles.tasks}>
      {loading && (
        <Skeleton active paragraph={{ rows: 5 }} />
      )}

      {!loading && data?.length === 0 && (
        <CustomEmpty description='No tasks found'
          imageStyle={{ height: 200 }}
        />
      )}

      {!loading && data?.map((item, index) => (
        <div
          key={`${item?.id}-${index}`} className={styles.kanbanItem}
          onClick={() => setDetailModal({ open: true, id: item?.id })}
        >
          <p className='mb-0'>{item?.title}</p>
          <div className={styles.kanbanItemBottom}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <div
                className={styles.priorityPill}
                style={{
                  backgroundColor: taskPriority[item.priority as keyof typeof taskPriority].color
                }}
              >
                {taskPriority[item.priority as keyof typeof taskPriority].title}
              </div>
              <p className={styles.taskEndOn}>
                {convertDate(item?.taskEndOn || "", "dd MM,yy")}
              </p>
            </div>
            <div className={styles.kanbanItemBottomBottom}>
              <Avatar.Group>
                {item.TaskMembers.map((member) => (
                  <Tooltip
                    key={member.User.uuid}
                    title={`${member.User.firstName} ${member.User.lastName}`}
                  >
                    <Avatar
                      size={25}
                      style={{ border: '1px solid var(--color-light-200)' }}
                      src={RESOURCE_BASE_URL + member.User.profile}
                      icon={<UserOutlined />}
                    />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div>
          </div>
        </div>
      ))}

      {(detailModal.open && detailModal.id !== 0) && (
        <TaskDetailsModal
          openModal={detailModal.open}
          onCancel={() => setDetailModal({ open: false, id: 0 })}
          id={detailModal.id} onUpdate={onRefresh}
        />
      )}
    </div>
  )
};

export default TaskCard;