import { FC, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { CustomEmpty, Pagination } from "@atoms/";
import { ErrorCode403 } from "@atoms/ErrorCodes";
import { useConditionFetchData, useFetchData } from "hooks";
import { ProjectQueryTypes, ProjectTypes } from "@modules/Project/types";
import { ProjectModule } from "@modules/Project";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { RootState } from "Redux/store";
import { ProjectStateType } from "@modules/ProjectState/types";
import { ProjectStateModule } from "@modules/ProjectState";
import ProjectsCard from "@organisms/Projects/Card";
import { QueryType } from "@modules/Common/common.interface";

interface MyProjectsProps {
  userId: number;
  activeFilter: 'all' | 'open' | 'closed'
}

const MyProjects: FC<MyProjectsProps> = ({ userId, activeFilter }) => {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
  const { readProject } = permissions;

  const module = useMemo(() => new ProjectModule(), []);
  const projectStateModule = useMemo(() => new ProjectStateModule(), []);

  const { data, meta, onRefresh } = useConditionFetchData<ProjectTypes[]>({
    method: module.getAllRecords,
    condition: userId !== 0,
    initialQuery: { userIds: [userId] }
  });

  const { data: projectStates } = useFetchData<ProjectStateType[]>({
    method: projectStateModule.getAllRecords,
  });

  const onUpdate = useCallback((query?: QueryType<ProjectQueryTypes>) => {
    const params = {
      ...query,
      userIds: [userId],
    }

    onRefresh<QueryType<ProjectQueryTypes>>(params);
  }, [onRefresh]);

  // Function to handle pagination change
  const onPaginationChange = (page: number, pageSize: number) => onUpdate({ page, perPage: pageSize });
  useEffect(() => {
    if (["closed", "open"].includes(activeFilter)) {
      onUpdate({ isClosed: activeFilter === "open" ? false : true })
    } else {
      onUpdate()
    }
  }, [activeFilter])

  return (
    <>
      {readProject === true && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data?.length === 0 ? (
            <div style={{ marginTop: "50px" }}>
              <CustomEmpty description="No Projects found" />
            </div>
          ) : (
            <ProjectsCard
              data={{
                allProjects: data!,
                onRefresh: onUpdate as any,
                projectStates: projectStates!,
              }}
              permissions={permissions}
            />
          )}
          <Pagination
            total={meta?.total!}
            current={meta?.page!}
            defaultPageSize={25}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPaginationChange}
          />
        </div>
      )}
      {readProject === false && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}
    </>
  );
}
export default MyProjects;
