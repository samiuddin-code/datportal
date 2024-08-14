import { useState, type FC, useMemo } from 'react';
import { Tabs, TabsProps } from 'antd';
import StickyBox from 'react-sticky-box';
import { Typography } from '../../../../../Atoms';
import { useFetchData } from '../../../../../../hooks';
import { TaskModule } from '../../../../../../Modules/Task';
import { TaskQuery, TaskType } from '../../../../../../Modules/Task/types';
import TaskCard from './card';
import { TabType } from './types';
import styles from './styles.module.scss';

import { TaskPermissionsEnum } from "../../../../../../Modules/Task/permissions";

interface TaskOverviewProps {
}

const TaskOverview: FC<TaskOverviewProps> = () => {
  const [tab, setTab] = useState<TabType>("assigned_to_me");
  const module = useMemo(() => new TaskModule(), []);

  const { data, onRefresh, loading } = useFetchData<TaskType[]>({
    method: module.getAllRecords,
    initialQuery: { type: "myTask" }
  });

  const onRefreshTasks = useMemo(() => {
    return () => onRefresh<TaskQuery>({
      type: tab === "assigned_by_me" ? "assignedTask" : "myTask"
    })
  }, [tab, onRefresh]);

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox
      offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}
      className={styles.tabBar_header}
    >
      <Typography
        weight="bold"
        color="dark-main"
        size="normal"
        className='mr-8'>
        Tasks
      </Typography>
      <DefaultTabBar {...props} className='mb-0' />
    </StickyBox>
  );

  return (
    <Tabs
      className={styles.taskOverview}
      activeKey={tab}

      onChange={(key) => {
        const _key = key as TabType;
        setTab(key as TabType)
        onRefresh<TaskQuery>({
          type: _key === "assigned_by_me" ? "assignedTask" : "myTask"
        });
      }}
      renderTabBar={renderTabBar}
      items={[
        {
          label: "Assigned To Me",
          key: "assigned_to_me",
          children: <TaskCard data={data!} loading={loading} onRefresh={onRefreshTasks}/>,
        },
        {
          label: "Assigned By Me",
          key: "assigned_by_me",
          children: <TaskCard data={data!} loading={loading} onRefresh={onRefreshTasks}/>,
        },
      ]}
      style={{
        paddingBottom: "0.2rem",
      }}
    />
  );
}
export default TaskOverview;