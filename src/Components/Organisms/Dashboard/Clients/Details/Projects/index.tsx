import { useMemo, type FC } from 'react';
import { Segmented } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { useConditionFetchData } from 'hooks';
import Typography from '@atoms/Headings';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectModule } from '@modules/Project';
import { ProjectTypes } from '@modules/Project/types';
import ProjectsCard from '@organisms/Projects/Card';
import { ProjectStateType } from '@modules/ProjectState/types';
import { ProjectStateModule } from '@modules/ProjectState';
import { Pagination } from '@atoms/Pagination';
import { CardShimmer } from '@atoms/CardShimmer';
import CustomEmpty from '@atoms/CustomEmpty';

interface ClientProjectsProps {
  clientId: number;
}

const ClientProjects: FC<ClientProjectsProps> = ({ clientId }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
  const { readProject } = permissions;

  const module = useMemo(() => new ProjectModule(), []);
  const projectStateModule = useMemo(() => new ProjectStateModule(), []);

  const condition = useMemo(() => clientId > 0 && readProject === true, [readProject, clientId]);

  const { data, onRefresh, meta, loading } = useConditionFetchData<ProjectTypes[]>({
    method: module.getAllRecords,
    initialQuery: { clientId, perPage: 10, isClosed: false },
    condition,
  });

  const { data: projectStates } = useConditionFetchData<ProjectStateType[]>({
    method: () => projectStateModule.getPublishedRecords({ perPage: 100 }),
    condition
  });

  return (
    <>
      {readProject === true && (
        <>
          <div className='d-flex align-center'>
            <Typography color="dark-main" size="sm" weight="bold" className='mr-2'>
              Projects
            </Typography>
            <div style={{ overflow: "auto" }}>
              <Segmented
                defaultValue='isClosed'
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'isClosed' }
                ]}
                onChange={(value) => {
                  if (value === 'all') return onRefresh({ clientId, perPage: 10 })
                  onRefresh({ isClosed: false, clientId, perPage: 10 })
                }}
              />
            </div>
          </div>

          {/**Loading Shimmers */}
          {(!data && loading) && (
            <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: 10, justifyContent: "center" }}>
              {Array(3).fill(0).map((_item, index) => (
                <CardShimmer key={`shimmerItem-${index}`} />
              ))}
            </div>
          )}

          {(!loading && data?.length === 0) && (
            <CustomEmpty description='No Projects Found' />
          )}

          {(data && data?.length > 0) && (
            <>
              <ProjectsCard
                data={{
                  allProjects: data!,
                  onRefresh: () => onRefresh({ clientId, perPage: 10 }),
                  projectStates: projectStates!,
                }}
                permissions={permissions}
              />
              <Pagination
                total={meta?.total || 0}
                current={meta?.page || 1}
                defaultPageSize={meta?.pageCount || 10}
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={(page, perPage) => {
                  onRefresh({ page, perPage, clientId })
                }}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
export default ClientProjects;