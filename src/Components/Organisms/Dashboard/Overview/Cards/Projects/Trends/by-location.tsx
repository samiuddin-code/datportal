import type { FC } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Typography } from '../../../../../../Atoms';
import styles from '../styles.module.scss';

interface ProjectTrendsByLocationProps { }

const tempProjectsTrends = [
  {
    name: 'Dubai',
    value: 10,
  },
  {
    name: 'Abu Dhabi',
    value: 20,
  },
  {
    name: 'Sharjah',
    value: 30,
  },
  {
    name: 'Other Emirates',
    value: 40,
  },
]

const ProjectTrendsByLocation: FC<ProjectTrendsByLocationProps> = () => {
  return (
    <ProCard
      title={(
        <Typography
          weight="bold"
          color="dark-main"
          size="normal">
          Project Trends by Location
        </Typography>
      )}
      style={{ width: "100%" }}
      extra="New Projects"
    >
      {tempProjectsTrends.map((project, index) => (
        <div
          key={`project-trend_by_location__item-${index}`}
          className={styles.project_trend_by_location__item}
        >
          <div className={styles.project_trend_by_location__item__title}>
            {project.name}
          </div>
          <div className={styles.project_trend_by_location__item__value}>
            {project.value}
          </div>
        </div>
      ))}
    </ProCard>
  );
}
export default ProjectTrendsByLocation;
