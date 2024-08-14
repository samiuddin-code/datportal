import { type FC } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { CustomEmpty, Typography } from '../../../../../Atoms';
import styles from './styles.module.scss';
import { ProjectTypes } from '@modules/Project/types';
import { convertDate } from '@helpers/dateHandler';
import moment from 'moment';
import { Tag, Tooltip } from 'antd';
import { LinkOutlined } from "@ant-design/icons";

interface ProjectsCardProps {
  data?: ProjectTypes[],
  title: string,
  link?: string,
  showStatus?: boolean
}



const ProjectsCard: FC<ProjectsCardProps> = ({ data, title, showStatus, link }) => {

  return (
    <div
      style={{
        width: 'calc(50% - 1rem)',
        display: 'flex'
      }}>
      <ProCard
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Typography
              weight="bold"
              color="dark-main"
              size="sm"
            >
              {title}
            </Typography>
            {link && <a href={link}><LinkOutlined /></a>}
          </div>
        )}
        extra="Deadline"
        style={{ width: "100%" }}
      >
        {data?.length ? data?.map((project, index) => (
          <a
            href={`/projects/${project.slug}?id=${project.id}`}
            key={`active_projects__item-${index}`}
            className={styles.active_projects__item}
          >

            <div className={styles.active_projects__item__title}>

              {project.referenceNumber} | {project.title} &nbsp;
              <Tooltip title={project.ProjectState.title}>
                {showStatus ? <Tag style={{
                  fontSize: 'var(--font-size-xxs)',
                  background: project.ProjectState.bgColor,
                  color: project.ProjectState.textColor,
                  border: 'none',
                  borderRadius: '1rem'
                }}>{project.ProjectState.title.slice(0, 15)}</Tag> : null}
              </Tooltip>
            </div>
            <div className={styles.active_projects__item__date}>
              {moment(project.endDate).fromNow()}
            </div>
          </a>
        )) : <CustomEmpty description={`No ${title} Found`} />}
      </ProCard>
    </div>
  );
}
export default ProjectsCard;