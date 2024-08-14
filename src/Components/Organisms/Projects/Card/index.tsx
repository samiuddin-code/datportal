import { useMemo, type FC } from 'react';
import { Avatar, Tag, Tooltip, message } from 'antd';
import { UserOutlined, FileOutlined } from '@ant-design/icons';
import { ProjectRoleEnum, taskPriority } from '@helpers/commonEnums';
import { convertDate } from '@helpers/dateHandler';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectStateType } from '@modules/ProjectState/types';
import ActionsDropdown from './actions';
import MembersTooltip from './members-tooltip';
import styles from './styles.module.scss';
import ChangeStates from '../Details/Sections/States';
import { ProjectModule } from '@modules/Project';

interface ProjectsCardProps {
  data: {
    allProjects: ProjectTypes[]
    projectStates: ProjectStateType[]
    onRefresh: <QueryType = any>(query?: QueryType) => void
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
}

const ProjectsCard: FC<ProjectsCardProps> = ({ data, permissions }) => {
  const { onRefresh, allProjects, projectStates } = data

  return (
    <div className={styles.projects}>
      {allProjects?.map((item, index) => {
        const { ProjectMembers, ProjectClient } = item
        // Project Incharge
        const memberInCharge = ProjectMembers?.find((member) => member.projectRole === ProjectRoleEnum['projectIncharge'])
        // Support Engineers
        const supportEngineers = ProjectMembers?.filter((member) => member.projectRole === ProjectRoleEnum['supportEngineers'])
        // Clients and their representatives
        const allClients = ProjectClient

        return (
          <a
            key={`project-${index}`}
            href={`/projects/${item.slug}?id=${item.id}`}
            className={styles.project_item}
          >
            <div className={styles.project_item_header}>
              <div className={styles.project_item_header_left}>
                <span className={styles.project_item_header_id}>
                  {item.referenceNumber}
                </span>

                <Tag
                  className={styles.project_item_header_priority}
                  color={taskPriority[item.priority as keyof typeof taskPriority].color}
                >
                  {taskPriority[item.priority as keyof typeof taskPriority].title}
                </Tag>
              </div>

              <div className={styles.project_item_header_actions}>
                {/** Change Status */}
                <ChangeStates
                  permissions={permissions}
                  data={{
                    projectStates: projectStates,
                    project: {
                      data: item,
                      onRefresh: onRefresh
                    }
                  }}
                  style={{ padding: "3px 5px" }}
                />

                {/** Dropdown for more actions */}
                <ActionsDropdown item={item} onRefresh={onRefresh} permissions={permissions} />
              </div>
            </div>
            <div className={styles.project_item_body}>
              <h3 className={styles.project_item_body_title}>
                {item.title}
              </h3>
            </div>

            <div className={styles.project_item_footer}>
              <div className={styles.project_item_footer_left}>
                {/** Project Members Popover */}
                <MembersTooltip
                  allClients={allClients}
                  memberInCharge={memberInCharge!}
                  supportEngineers={supportEngineers}
                >
                  <div className={styles.project_item_footer_members}>
                    {/** Project Incharge */}
                    {memberInCharge?.User && (
                      <div className={styles.project_item_footer_members_incharge}>
                        <Avatar
                          size={25}
                          style={{ border: '1px solid var(--color-light-200)' }}
                          src={`${RESOURCE_BASE_URL}${memberInCharge?.User?.profile}`}
                          icon={<UserOutlined />}
                        />
                      </div>
                    )}

                    {/** Support Engineers */}
                    {supportEngineers?.length > 0 && (
                      <div className={styles.project_item_footer_members_support}>
                        <Avatar.Group>
                          {supportEngineers?.map((member) => (
                            <Avatar
                              key={`project-member-${member.User.id}`}
                              size={25}
                              style={{ border: '1px solid var(--color-light-200)', marginTop: '5px' }}
                              src={RESOURCE_BASE_URL + member.User.profile}
                              icon={<UserOutlined />}
                            />
                          ))}
                        </Avatar.Group>
                      </div>
                    )}

                    {/** Clients and their representatives */}
                    {allClients?.length > 0 && (
                      <div className={styles.project_item_footer_members_clients}>
                        <Avatar.Group>
                          {allClients?.map((member) => (
                            <Avatar
                              key={`project-member-${member.Client.id}`}
                              size={25}
                              style={{ border: '1px solid var(--color-light-200)' }}
                              src={`${RESOURCE_BASE_URL}${member.Client.logo}`}
                              icon={<UserOutlined />}
                            />
                          ))}
                        </Avatar.Group>
                      </div>
                    )}
                  </div>
                </MembersTooltip>

                <div className={styles.project_item_footer_date}>
                  <span className={styles.project_item_footer_date_start}>
                    {convertDate(item.startDate, "M dd,yy")}
                  </span>
                  <span className={styles.project_item_footer_date_separator}>
                    -
                  </span>
                  <span className={styles.project_item_footer_date_end}>
                    {convertDate(item.endDate, "M dd,yy")}
                  </span>
                </div>
              </div>

              <div className={styles.project_item_footer_counts}>
                <Tooltip
                  title={`${item._count?.Resources} Files in this project`}
                  placement='left'
                >
                  <span className={styles.project_item_footer_counts_files}>
                    <FileOutlined style={{ color: 'var(--color-light-300)' }} />
                    {item._count?.Resources}
                  </span>
                </Tooltip>

                {/* <Tooltip
                  title={`${item._count?.projectComments} Comments on this project`}
                  placement='left'
                >
                  <span className={styles.project_item_footer_counts_comments}>
                    <MessageIcon
                      stroke='var(--color-light-300)'
                      height={17} width={17}
                    />
                    {item._count?.projectComments}
                  </span>
                </Tooltip>

                <span className={styles.project_item_footer_counts_tasks}>
                  {item._count?.tasks || 0} Tasks
                </span> */}
              </div>
            </div>
          </a >
        )
      })}
    </div >
  );
}
export default ProjectsCard;