import { useMemo, type FC } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { CustomEmpty, Typography } from '../../../../../Atoms';
import styles from './styles.module.scss';
import { ProjectModule } from '@modules/Project';
import { useFetchData } from 'hooks';
import { ProjectTypes } from '@modules/Project/types';
import { convertDate } from '@helpers/dateHandler';
import moment from 'moment';

interface DelayedProjectsProps {
  data?: ProjectTypes[]
 }


const DelayedProjects: FC<DelayedProjectsProps> = ({data}) => {
  // const module = useMemo(() => new ProjectModule(), []);
  // const { data } = useFetchData<ProjectTypes[]>({
  //   method: module.getAllRecords,
  //   initialQuery: {
  //     delayed: true
  //   }
  // });
  return (
    <div
      style={{
        width: 'calc(50% - 1rem)',
        display: 'flex'
      }}>
      <ProCard
        title={(
          <Typography
            weight="bold"
            color="dark-main"
            size="normal">
            Delayed Projects
          </Typography>
        )}
        extra="Delayed By"
        style={{ width: "100%" }}
      >
        {data?.length ? data?.map((project, index) => (
          <a
          href={`/projects/${project.slug}?id=${project.id}`}
          target='_blank'
            key={`delayed_projects__item-${index}`}
            className={styles.delayed_projects__item}
          >
            <div className={styles.delayed_projects__item__title}>
              {project.title}
            </div>
            <div className={styles.delayed_projects__item__date}>
            {moment(new Date()).diff(project.endDate, 'days')} days
            </div>
          </a>
        )) : <CustomEmpty description='No projects found' />}
      </ProCard>
    </div>
  );
}
export default DelayedProjects;