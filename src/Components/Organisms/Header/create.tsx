import { FC, useState } from 'react';
import { message, Button } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { TaskPermissionsEnum } from '@modules/Task/permissions';
import { TaskModal } from './Task/modal';
import styles from './style.module.scss';

interface CreateTaskProps { }

const CreateTask: FC<CreateTaskProps> = () => {
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const taskPermissions = userPermissions as { [key in TaskPermissionsEnum]: boolean };

  return (
    <>
      <Button
        onClick={() => {
          if (taskPermissions?.createTask === true) {
            setOpenTaskModal(!openTaskModal)
          } else {
            message.error('You do not have permission to create task');
          }
        }
        }
        className={styles.create}
        type="primary"
      >
        Create Task
      </Button>
      {openTaskModal && (
        <TaskModal
          onCancel={() => setOpenTaskModal(!openTaskModal)}
          openModal={openTaskModal}
          permissions={taskPermissions}
        />
      )}
    </>
  );
}

export default CreateTask;