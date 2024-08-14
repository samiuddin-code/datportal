import { useMemo, type FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import Layout from '@templates/Layout';
import { ErrorCode403, ErrorCode404 } from '@atoms/ErrorCodes';
import BreadCrumbs from '@atoms/BreadCrumbs';
import { useConditionFetchData, useFetchData } from 'hooks';
import { ProjectModule } from '@modules/Project';
import { ProjectResourceTypes, ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectStateModule } from '@modules/ProjectState';
import { ProjectStateType } from '@modules/ProjectState/types';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import AllSections from './Sections';
import { TransactionsPermissionsEnum } from '@modules/Transactions/permissions';
import { PermitsPermissionsEnum } from '@modules/Permits/permissions';

interface ProjectDetailsProps { }

const breadCrumbsData = [
  { text: "Home", isLink: true, path: "/" },
  { text: "Projects", isLink: true, path: "/projects?all=true" },
];

const ProjectDetails: FC<ProjectDetailsProps> = () => {
  const [searchParams] = useSearchParams();
  const permissionSlug = Object.values(ProjectPermissionsEnum).map((value) => value);
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
  const { readProject, deleteProject, updateProject } = permissions;

  const [fetchFiles, setFetchFiles] = useState(false);

  // get the slug from the url
  const slug = window.location.pathname.split("/")[2];

  const module = useMemo(() => new ProjectModule(), []);
  const projectStateModule = useMemo(() => new ProjectStateModule(), []);

  // Project Details Fetch condition
  const condition = useMemo(() => !!slug && readProject === true, [slug, readProject]);

  // Project Files Fetch condition
  const projectFilesCondition = useMemo(() => {
    return (!!searchParams.get("id") && readProject === true && fetchFiles === true)
  }, [readProject, fetchFiles]);

  // Project Details Fetch 
  const { data, loading, onRefresh, error } = useConditionFetchData<ProjectTypes>({
    method: () => module.getRecordBySlug(slug),
    condition: condition,
  });

  // Project State Fetch
  const {
    data: projectStates, onRefresh: onRefreshProjectStates,
    loading: loadingProjectStates
  } = useFetchData<ProjectStateType[]>({
    method: projectStateModule.getPublishedRecords,
    initialQuery: { perPage: 50 }
  });

  // Project Files Fetch
  const {
    data: projectFiles, onRefresh: onRefreshProjectFiles,
    loading: loadingProjectFiles, meta: projectFilesMeta
  } = useConditionFetchData<ProjectResourceTypes[]>({
    method: module.getProjectResources,
    initialQuery: { projectId: searchParams.get("id"), perPage: 12 },
    condition: projectFilesCondition
  })

  /**Function to delete a project
   * @param {number} id id of the project to be deleted
   */
  const onDelete = (id: number) => {
    if (deleteProject === true) {
      module.deleteRecord(id).then(() => {
        message.success("Project deleted successfully")
        // redirect to projects page
        window.location.href = "/projects?all=true"
      }).catch((err) => {
        const errorMessages = err.response.data.message || "Something went wrong!"
        message.error(errorMessages)
      })
    } else {
      message.error("You don't have permission to delete this project, Please contact your admin")
    }
  };

  /**Function to edit project detail 
   * @param {ProjectTypes} values updated values of the project
   * @param {number} id id of the project to be updated
  */
  const onEdit = (values: Partial<ProjectTypes>, id: number) => {
    if (updateProject === true) {
      module.updateRecord(values, id).then((res) => {
        const { data } = res;
        message.success(data.message);
        onRefresh();
      }).catch((err) => {
        const errorMessages = err.response.data.message || "Something went wrong!"
        message.error(errorMessages)
      })
    } else {
      message.error("You don't have permission to update this project, Please contact your admin")
    }
  };

  const finalBreadCrumbsData = useMemo(() => {
    if (data && !loading) {
      return [...breadCrumbsData, { text: data.title, isLink: false }];
    }
    return breadCrumbsData;
  }, [data, loading]);

  /**
   * Note: This is a hack to fetch the data when the condition is true
   * This is because the useConditionFetchData hook will only fetch the data when the condition is true
   * and the condition is only true when the slug is not null and the user has permission to read the project
   * And since the read permission is fetched from the API, it will be undefined at first and the condition will be false
   * So we need to fetch the data again when read permission is fetched from the API and it is true so that the condition will be true
   */
  useEffect(() => {
    if (condition) {
      onRefresh();
    }
  }, [condition]);

  // console.log("ProjectDetails", { data, loading, error });

  return (
    <Layout
      permissionSlug={[
        ...permissionSlug, InvoicePermissionsEnum.READ,
        InvoicePermissionsEnum.CREATE, InvoicePermissionsEnum.UPDATE,
        TransactionsPermissionsEnum.READ, TransactionsPermissionsEnum.CREATE,
        TransactionsPermissionsEnum.UPDATE, PermitsPermissionsEnum.READ,
        PermitsPermissionsEnum.CREATE, PermitsPermissionsEnum.UPDATE
      ]}
    >
      <BreadCrumbs data={finalBreadCrumbsData} />
      {(readProject === true && data && !loading) && (
        <AllSections
          permissions={permissions}
          onDelete={onDelete} onEdit={onEdit}
          setFetchFiles={setFetchFiles}
          data={{
            project: {
              data: data as ProjectTypes,
              onRefresh: onRefresh,
              loading: loading,
            },
            projectFiles: {
              data: projectFiles as ProjectResourceTypes[],
              onRefresh: onRefreshProjectFiles,
              loading: loadingProjectFiles,
              meta: projectFilesMeta
            },
            projectStates: {
              data: projectStates as ProjectStateType[],
              onRefresh: onRefreshProjectStates,
              loading: loadingProjectStates,
            }
          }}
        />
      )}
      {(readProject === false && !loading && !data) && (
        <ErrorCode403
          mainMessage="You don't have permission to view this data"
        />
      )}
      {(error === "Cannot read properties of null (reading 'id')" && !loading) && (
        <ErrorCode404
          mainMessage="Project not found"
          subMessage="Please check the URL or contact your administrator"
        />
      )}
    </Layout>
  );
}
export default ProjectDetails;