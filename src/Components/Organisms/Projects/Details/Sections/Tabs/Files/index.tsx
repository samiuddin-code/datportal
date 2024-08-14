import { useState, type FC } from 'react';
import { Button, Tabs, TabsProps } from 'antd';
import { ProjectResourceTypes, ProjectTypes } from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { QueryType } from '@modules/Common/common.interface';
import MediaCard from './media';
import LinksTab from './links';
import FilesUploader from './uploader';
import styles from './styles.module.scss';
import StickyBox from 'react-sticky-box';
import ManageMedia from './manage-media';

interface FilesTabProps {
  data: {
    project: {
      data: ProjectTypes
      onRefresh: <QueryType = any>(query?: QueryType) => void
    }
    projectFiles: {
      data: ProjectResourceTypes[]
      onRefresh: <QueryType = any>(query?: QueryType) => void
      meta: QueryType
      loading: boolean
    }
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
  /** Function to edit project detail
  * @param {ProjectTypes} values updated values of the project
  * @param {number} id id of the project to be updated
  */
  onEdit: (values: Partial<ProjectTypes>, id: number) => void
}

type TabKeyTypes = "documents" | "links"

const FilesTab: FC<FilesTabProps> = ({ data, permissions, onEdit }) => {
  const { project, projectFiles } = data;

  const [tabKey, setTabKey] = useState<TabKeyTypes>("documents");
  const [isManageMediaOpen, setIsManageMediaOpen] = useState(false);

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox
      offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}
      className={styles.tabBar_header}
    >
      <DefaultTabBar
        {...props} className='mb-0' style={{ fontSize: 'var(--font-size-md)' }}
      />

      {tabKey !== "links" && (
        <Button
          type='link' onClick={() => setIsManageMediaOpen(true)}
          className='ml-auto font-size-sm color-dark-main'
          style={{ paddingBottom: '0px' }}
        >
          Manage
        </Button>
      )}
    </StickyBox>
  );

  return (
    <section>
      <Tabs
        type="card" renderTabBar={renderTabBar}
        className={"files-tab"}
        items={[
          {
            label: 'Documents',
            key: 'documents',
            children: (
              <MediaCard
                data={projectFiles?.data}
                meta={projectFiles?.meta}
                onRefresh={projectFiles?.onRefresh}
                projectId={project?.data?.id}
              />
            ),
          },
          {
            label: 'Links',
            key: 'links',
            children: (
              <LinksTab
                onEdit={onEdit}
                project={{
                  data: project?.data,
                  onRefresh: project?.onRefresh
                }}
              />
            ),
          },
        ]}
        onChange={(key) => setTabKey(key as TabKeyTypes)}
      />
      {/** Show upload section only when the tab is not links */}
      {tabKey !== "links" && (
        <FilesUploader
          data={{ project, projectFiles }}
          permissions={permissions}
        />
      )}

      {/** Show manage media modal only when the tab is not links */}
      {(tabKey !== "links") && (
        <ManageMedia
          projectId={project?.data?.id}
          isManageMediaOpen={isManageMediaOpen}
          setIsManageMediaOpen={setIsManageMediaOpen}
          shareFiles
          media={{
            loading: projectFiles?.loading,
            data: projectFiles?.data,
            onRefresh: projectFiles?.onRefresh,
            meta: projectFiles?.meta,
          }}
        />
      )}
    </section>
  );
}
export default FilesTab;