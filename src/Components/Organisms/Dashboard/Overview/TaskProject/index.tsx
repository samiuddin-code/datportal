import { useState, FC, useMemo } from 'react';
import { Tabs, TabsProps, Table, Typography, Spin, Pagination } from 'antd';
import StickyBox from 'react-sticky-box';
import moment from 'moment';

import styles from './styles.module.scss';
import { TabType } from '../Cards/Tasks/types';
import { TaskModule } from '@modules/Task';
import { TaskQuery, TaskType } from '@modules/Task/types';
import { useFetchData } from 'hooks';

interface TaskOverviewProps {
  style?: React.CSSProperties; // Allow custom styles
}

// Enums for status and priority labels
const taskColumnLabels = {
  1: "To Do",
  2: "In Progress",
  3: "Done",
};
const techSupportColumnLabels = {
  1: "Open",
  2: "In Progress",
  3: "Closed",
};

const TaskProject: FC<TaskOverviewProps> = ({ style }) => {
  const [tab, setTab] = useState<TabType>("assigned_to_me");
  const module = useMemo(() => new TaskModule(), []);

  const { data = [], onRefresh, loading, error } = useFetchData<TaskType[]>({
    method: module.getAllRecords,
    initialQuery: { type: "myTask" }
  });

  const onRefreshTasks = useMemo(() => {
    return () => onRefresh<TaskQuery>({
      type: tab === "assigned_by_me" ? "assignedTask" : "myTask"
    });
  }, [tab, onRefresh]);

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox
      offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}
      className={styles.tabBar_header}
    >
      <DefaultTabBar {...props} className='mb-0' />
    </StickyBox>
  );

  const formatDate = (date: string) => {
    return moment(date).format('MMM D, h:mm a');
  };

  const columns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Project ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => taskColumnLabels[status as keyof typeof taskColumnLabels] || techSupportColumnLabels[status as keyof typeof techSupportColumnLabels] || status,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => taskColumnLabels[priority as keyof typeof taskColumnLabels] || techSupportColumnLabels[priority as keyof typeof techSupportColumnLabels] || priority,
    },
    {
      title: 'Added Date',
      dataIndex: 'addedDate',
      key: 'addedDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Start Date',
      dataIndex: 'taskStartFrom',
      key: 'taskStartFrom',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'End Date',
      dataIndex: 'taskEndOn',
      key: 'taskEndOn',
      render: (date: string) => formatDate(date),
    },
  ];

  const renderTable = () => (
    <div className={styles.scrollableTableContainer}>
      <div className={styles.tableHeader}>
    
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id" // Ensure each row has a unique key
        pagination={false} // Hide the default pagination
        bordered
        scroll={{ y: 400 }} // Set fixed height for table content
        
      />
      <div className={styles.tableFooter}>
     
      </div>
    </div>
  );

  return (
    <Tabs
      className={styles.taskOverview}
      activeKey={tab}
      onChange={(key) => {
        const _key = key as TabType;
        setTab(_key);
        onRefresh<TaskQuery>({
          type: _key === "assigned_by_me" ? "assignedTask" : "myTask"
        });
      }}
      renderTabBar={renderTabBar}
      items={[
        {
          label: (
            <div className={styles.tabLabelWithPagination}>
              <Typography.Text>Assigned To Me</Typography.Text>
            
            </div>
          ),
          key: "assigned_to_me",
          children: loading ? (
            <div className={styles.spinnerContainer}>
              <Spin size="large" />
            </div>
          ) : (
            renderTable()
          ),
          
        },
    


   
        {
          label: (
            <div className={styles.tabLabelWithPagination}>
              <Typography.Text>Assigned By Me</Typography.Text>
            
            </div>
          ),
          key: "assigned_by_me",
          children: loading ? (
            <div className={styles.spinnerContainer}>
              <Spin size="large" />
            </div>
          ) : (
            renderTable()
          ),
        },
        {
          label: (
            <div className={styles.tabLabelWithPagination}>
          
              <Pagination
          className={styles.paginationTab}
          size="small"
          total={data.length}
          showSizeChanger={false}
          pageSize={10}
        />
            </div>
          ),
          key: "assigned_by_me",
          children: loading ? (
            <div className="spinner-container">
              <div className={styles.spinnerContainer}>
              <Spin size="large" />
            </div>
              
 
              
            </div>
          ) : (
            renderTable()
          ),
        },
      ]}
      style={{
        paddingBottom: "0.2rem",
        ...style, // Apply passed style here
      }}
    />
  );
}

export default TaskProject;
