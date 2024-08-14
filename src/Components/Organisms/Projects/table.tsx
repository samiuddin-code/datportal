import { FC, Key, Dispatch, useEffect, useMemo, useState, useCallback, SetStateAction } from 'react';
import { Avatar, Table, Tag, Typography as AntdTypography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { ProjectTypes } from '../../../Modules/Project/types';
import { Typography } from '../../Atoms';
import { ProjectRoleEnum, taskPriority } from '../../../helpers/commonEnums';
import { convertDate } from '../../../helpers/dateHandler';
import { ProjectPermissionsEnum } from '../../../Modules/Project/permissions';
import { ProjectStateType } from '../../../Modules/ProjectState/types';
import { RESOURCE_BASE_URL } from '../../../helpers/constants';
import ActionsDropdown from './Card/actions';
import MembersTooltip from './Card/members-tooltip';
import ChangeStates from './Details/Sections/States';

import { ProjectEnableStatesType } from "../../../Modules/ProjectEnableStates/types";
import { ProjectStateModal } from '../Projects/Details/Sections/States/modal'
import styles from '../Common/styles.module.scss';
import { UserPermissionsEnum } from "../../../Modules/User/permissions";


const { Paragraph } = AntdTypography;

type PermissionType = { [key in ProjectPermissionsEnum]: boolean };

interface ProjectTableProps {
  data: {
    allProjects: ProjectTypes[]
    projectStates: ProjectStateType[]
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  permissions: PermissionType
  rowSelection: {
    selectedRowKeys: Key[]
    onChange: Dispatch<SetStateAction<Key[]>>
  }
}



const ProjectTable: FC<ProjectTableProps> = ({ data, permissions, rowSelection }) => {
  const { onRefresh, allProjects, projectStates } = data

  // Ensure projectStates is an array before sorting
  const sortedProjectStates = Array.isArray(projectStates) ? [...projectStates].sort((a, b) => a.title.localeCompare(b.title)) : [];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectTypes | null>(null);

  const handleManageStateClick = (record: ProjectTypes) => {
    setSelectedProject(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };



  const columns: ColumnsType<ProjectTypes> = [
    {
      title: 'Reference Number',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (referenceNumber) => (
        <Typography color="dark-sub" size="sm">
          {referenceNumber}
        </Typography>
      )
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => {
        const { priority } = record;
        return (
          <>
            <a
              href={`/projects/${record.slug}?id=${record.id}`}
              title="View Project Details"
            >
              <Typography color="dark-main" weight='semi'>
                {title}
              </Typography>
            </a>
            <Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              className="mt-1 color-dark-sub mb-0"
            >
              Slug: {record?.slug}
            </Paragraph>
            <div className="d-flex mt-1">
              <Tag
                color={taskPriority[priority as keyof typeof taskPriority].color}
                style={{ borderRadius: 15 }}
              >
                {taskPriority[priority as keyof typeof taskPriority].title}
              </Tag>
            </div>
          </>
        )
      },
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client: ProjectTypes['Client']) => (
        <div className="d-flex">
          <Avatar
            size="small"
            className="mr-2"
            src={`${RESOURCE_BASE_URL}${client?.logo}`}
            icon={<UserOutlined />}
          />
          <Typography color="dark-main" className="mt-1">
            {client?.name}
          </Typography>
        </div>
      ),
    },
    {
      title: "Members",
      dataIndex: "ProjectMembers",
      key: "ProjectMembers",
      render: (ProjectMembers: ProjectTypes['ProjectMembers'], record) => {
        // Project Incharge
        const memberInCharge = ProjectMembers?.find((member) => member.projectRole === ProjectRoleEnum['projectIncharge'])
        // Support Engineers
        const supportEngineers = ProjectMembers?.filter((member) => member.projectRole === ProjectRoleEnum['supportEngineers'])
        // Clients and their representatives
        const allClients = record.ProjectClient

        return (
          <MembersTooltip
            allClients={allClients}
            memberInCharge={memberInCharge!}
            supportEngineers={supportEngineers!}
          >
            <div>
              <Avatar.Group maxCount={3} size={"small"} maxPopoverTrigger={'focus'}>
                {ProjectMembers?.map((member) => (
                  <Avatar
                    src={`${RESOURCE_BASE_URL}${member?.User?.profile}`}
                    icon={<UserOutlined />}
                  />
                ))}
              </Avatar.Group>
            </div>
          </MembersTooltip>
        )
      }
    },
    // {
    //   title: "State",
    //   dataIndex: "ProjectState",
    //   key: "ProjectState",
    //   render: (_projectState: ProjectTypes['ProjectState'], record) => (
    //     <ChangeStates
    //       permissions={permissions}
    //       data={{
    //         projectStates: projectStates,
    //         project: {
    //           data: record,
    //           onRefresh: onRefresh
    //         }
    //       }}
    //       style={{ padding: "2px 8px" }}
    //     />
    //   ),
    // },
    
    // {
    //   title: 'State',
    //   dataIndex: 'ProjectState',
    //   key: 'ProjectState',
    //   render: (ProjectState: ProjectTypes['ProjectState'], record) => (
    //     <>
    //       <Paragraph
    //         ellipsis={{
    //           rows: 1,
    //           expandable: false,
    //         }}
    //         className="my-0 color-dark-sub"
    //       >
    //         <ul style={{ listStyle: 'none', padding: 0 }}>
    //           {projectStates.map((state) => (
    //             <li key={state.id} className="font-size-xs ml-0">{state.title}</li>
    //           ))}
    //         </ul>
    //       </Paragraph>

    //       <p
    //         className="color-dark-main font-weight-bold font-size-sm mb-0 ml-1 cursor-pointer"
    //         onClick={() => handleManageStateClick(record)}
    //       >
    //         Manage State
    //       </p>
    //     </>
    //   ),
    // },
    {
      title: 'State',
      dataIndex: 'ProjectState',
      key: 'ProjectState',
      render: (_, record) => {
        console.log("Record:", record);
        console.log("ProjectEnableStates:", record.ProjectEnableStates);

        const enableStates = record.ProjectEnableStates?.map((enableState) => enableState.pstateId) || [];
        console.log("Enable States:", enableStates);

        const assignedStates = projectStates.filter(state => enableStates.includes(state.id));
        console.log("Assigned States:", assignedStates);
    
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: false,
              }}
              className="my-0 color-dark-sub"
            >
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {assignedStates.map((state) => (
                  <li key={state.id} className="font-size-xs ml-0">{state.title}</li>
                ))}
              </ul>
            </Paragraph>
    
            <p
              className="color-dark-main font-weight-bold font-size-sm mb-0 ml-1 cursor-pointer"
              onClick={() => handleManageStateClick(record)}
            >
              Manage State
            </p>
          </>
        );
      },
    },
    
    {
      title: "Type",
      dataIndex: "ProjectType",
      key: "ProjectType",
      render: (ProjectType: ProjectTypes['ProjectType']) => (
        <Typography color="dark-main" className="mt-1">
          {ProjectType?.title}
        </Typography>
      ),
    },
    {
      title: "Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate: ProjectTypes['startDate'], record) => (
        <>
          <Typography color="dark-sub" size="sm">
            {`Start: ${convertDate(startDate, "dd MM yy")}` || "N/A"}
          </Typography>
          <Typography color="dark-sub" size="sm">
            {`End: ${convertDate(record?.endDate, "dd MM yy")}` || "N/A"}
          </Typography>
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <ActionsDropdown
          item={record} permissions={permissions}
          onRefresh={onRefresh}
        />
      )
    },
  ];

  
  return (
    <>
    <Table
      columns={columns}
      dataSource={allProjects}
      pagination={false}
      rowKey="id"
      rowSelection={rowSelection}
    />
    {/* Modal for managing project states */}
    <ProjectStateModal
    openModal={isModalVisible}
    onCancel={handleCloseModal}
    projectId={selectedProject?.id || 0}
    reloadTableData={onRefresh}
    permissions={permissions}
    currentForm="projectForm" // Provide the relevant form context
    type="edit" // Provide the relevant type
  />
  </>
  );
}
export default ProjectTable;