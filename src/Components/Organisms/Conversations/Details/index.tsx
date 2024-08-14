import type { Dispatch, FC, SetStateAction } from 'react';
import { Avatar, Button, Tag, Image, Typography as AntdTypography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ProjectResourceTypes, ProjectTypes } from '@modules/Project/types';
import Typography from '@atoms/Headings';
import { UserPopover } from '@atoms/UserPopver';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { ProjectRoleEnum } from '@helpers/commonEnums';
import Skeletons from '@organisms/Skeletons';
import styles from './style.module.scss';
import { QueryType } from '@modules/Common/common.interface';
import MediaCard from '@organisms/Projects/Details/Sections/Tabs/Files/media';
import { ExternalIcon } from '@icons/external';
import CustomEmpty from '@atoms/CustomEmpty';

const { Text } = AntdTypography;

interface ConversationDetailProps {
  details: {
    data: ProjectTypes;
    files: {
      data: ProjectResourceTypes[]
      onRefresh: <QueryType = any>(query?: QueryType) => void
      meta: QueryType
    }
    loading: boolean;
  }
  setIsManageMediaOpen: Dispatch<SetStateAction<boolean>>
}

const ConversationDetail: FC<ConversationDetailProps> = ({ details, setIsManageMediaOpen }) => {
  const project = details?.data
  const loading = details?.loading
  const projectFiles = details?.files
  const members = project?.ProjectMembers

  return (
    <div className={styles.details}>
      {loading ? (
        <Skeletons items={2} />
      ) : (
        <>
          <div className={styles.details_card}>
            {/** Client */}
            <div className={styles.details_item}>
              <p className={styles.details_item_label}>
                Client
              </p>

              {project?.Client && (
                <div className={styles.details_item_value}>
                  {project?.Client?.logo ? (
                    <Image
                      src={`${RESOURCE_BASE_URL}${project?.Client?.logo}`}
                      alt={project?.Client?.name}
                      preview={false} width={24}
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <Avatar
                      size={24}
                      icon={<UserOutlined />}
                      style={{ border: '1px solid var(--color-border)' }}
                    />
                  )}

                  <p className="mb-0">
                    {project?.Client?.name}
                  </p>
                </div>
              )}
            </div>

            {/** Project Type */}
            <div className={styles.details_item}>
              <p className={styles.details_item_label}>
                Project Type
              </p>

              <p className={`${styles.details_item_value} mb-0`}>
                {project?.ProjectType?.title}
              </p>
            </div>

            {/** Project State */}
            <div className={styles.details_item}>
              <p className={styles.details_item_label}>
                Project State
              </p>

              <Tag color={project?.ProjectState?.bgColor}>
                <Text
                  style={{ width: '100%', maxWidth: 250, color: project?.ProjectState?.textColor }}
                  ellipsis={{ tooltip: project?.ProjectState?.title }}
                >
                  {project?.ProjectState?.title}
                </Text>
              </Tag>
            </div>

            {/** Reference Number*/}
            <div className={styles.details_item}>
              <p className={styles.details_item_label}>
                Reference Number
              </p>

              <p className={`${styles.details_item_value} mb-0`}>
                {project?.referenceNumber}
              </p>
            </div>

            {/** Submission By */}
            <div className={styles.details_item}>
              <p className={styles.details_item_label}>
                Submission By
              </p>

              {project?.SubmissionBy && (
                <div className={styles.details_item_value}>
                  {project?.SubmissionBy?.logo ? (
                    <Image
                      src={`${RESOURCE_BASE_URL}${project?.SubmissionBy?.logo}`}
                      alt={project?.SubmissionBy?.name}
                      preview={false} width={24}
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <Avatar
                      size={24}
                      icon={<UserOutlined />}
                      style={{ border: '1px solid var(--color-border)' }}
                    />
                  )}

                  <p className="mb-0">
                    {project?.SubmissionBy?.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.details_card}>
            <div className='d-flex align-center'>
              <Typography color='dark-sub'>Files</Typography>
              <Button
                type='link' onClick={() => setIsManageMediaOpen(true)}
                className='ml-auto font-size-normal color-dark-sub'
                style={{ padding: 0, margin: 0 }}
              >
                Manage
              </Button>
            </div>
            {projectFiles?.data?.length > 0 ? (
              <MediaCard
                data={projectFiles?.data}
                meta={projectFiles?.meta}
                onRefresh={projectFiles?.onRefresh}
                projectId={project?.id}
                fromChat
              />
            ) : (
              <CustomEmpty className='mt-1' description='No files' />
            )}
          </div>

          {/** Members */}
          <div className={styles.details_card}>
            <div className='d-flex align-center'>
              <Typography color='dark-sub' className='ml-2'>
                {`${members?.length} ${members?.length > 1 ? 'Members' : 'Member'}`}
              </Typography>
              <a
                className='ml-auto d-flex align-center'
                href={`/projects/${project?.slug}?id=${project?.id}`}
                target='_blank' rel='noreferrer'
              >
                <Typography color='dark-sub'>
                  Manage
                </Typography>
                <ExternalIcon className='mr-0' />
              </a>
            </div>
            {members?.length > 0 ? (
              <div className={styles.members}>
                {members?.map((member) => {
                  const { User, projectRole } = member
                  const isIncharge = projectRole === ProjectRoleEnum['projectIncharge']

                  return (
                    <div key={User?.uuid} className={styles.members_item}>
                      <UserPopover type='user' user={User} className='d-flex align-center'>
                        <Avatar
                          size={32} src={`${RESOURCE_BASE_URL}${User?.profile}`}
                          icon={<UserOutlined />}
                          style={{ border: '1px solid var(--color-border)' }}
                        />

                        <p className={styles.members_item_name}>
                          {`${User?.firstName} ${User?.lastName}`}
                        </p>

                        {isIncharge && (
                          <Tag color="blue" className='ml-2'>
                            Incharge
                          </Tag>
                        )}
                      </UserPopover>
                    </div>
                  )
                })}
              </div>
            ) : (
              <CustomEmpty className='mt-1' description='No members' />
            )}
          </div>
        </>
      )}
    </div>
  );
}
export default ConversationDetail;