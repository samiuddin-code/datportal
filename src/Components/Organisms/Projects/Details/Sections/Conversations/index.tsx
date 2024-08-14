import {
  useMemo, type FC, useState, Dispatch, SetStateAction,
  useCallback, useRef, useEffect, Fragment, type KeyboardEvent
} from 'react';
import {
  Divider, message, Spin, Upload, Button, UploadProps,
  Image, Drawer, notification, Mentions
} from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { LoadingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { CustomEmpty, Typography } from '@atoms/';
import { ExpandIcon, ExternalIcon, SendIcon } from '@icons/';
import { ProjectModule } from '@modules/Project';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectConversationTypes, ProjectTypes } from '@modules/Project/types';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import styles from './styles.module.scss';
import { PlayNotificationSound, handleError } from '@helpers/common';
import { disConnectWebSocket, getWebSocket } from '@helpers/chat.gateway';
import InfiniteScroll from "react-infinite-scroll-component";
import { QueryType } from '@modules/Common/common.interface';
import api from "@services/axiosInstance";
import PreviewFile from '@atoms/PreviewFile';
import ConversationCards from './card';
import TokenService from '@services/tokenService';

type ProjectConversationResponseTypes = {
  data: ProjectConversationTypes[];
  meta: QueryType;
  loading: boolean;
}

interface ProjectConversationProps {
  conversations: ProjectConversationResponseTypes
  setProjectConversations: Dispatch<SetStateAction<ProjectConversationResponseTypes>>
  onRefresh: <Query = any>(query?: Query & QueryType) => void
  projectId: number
  projectMembers: ProjectTypes['ProjectMembers']
  permissions: { [key in ProjectPermissionsEnum]: boolean }
}

type AddConversationType = {
  message: string;
}

type ConversationsStateType = {
  content: string;
  loading: boolean;
}

type SelectedFileTypes = {
  path: string
  open: boolean
}

const ProjectConversations: FC<ProjectConversationProps> = (props) => {
  const {
    setProjectConversations, conversations: { data, meta, loading },
    projectId, onRefresh, permissions, projectMembers
  } = props;
  const currentUser = TokenService.getUserData();

  const [messageApi, contextHolderMessage] = message.useMessage();
  const [notificationApi, contextHolderNotification] = notification.useNotification();

  const module = useMemo(() => new ProjectModule(), []);
  /** Whether there's more data to be fetched or not in the conversations */
  const hasMore = useMemo(() => data?.length! < meta?.total!, [data, meta])

  /** Project Members For Mentions */
  const projectMembersOptions = useMemo(() => {
    return projectMembers?.map((member) => {
      const name = `${member?.User?.firstName} ${member?.User?.lastName}`
      const userId = member?.User?.id
      return { label: name, value: `[${name}](${userId})` }
    });
  }, [projectMembers]);

  const [conversations, setConversations] = useState<ConversationsStateType>({
    content: '', loading: false,
  })
  const [fileList, setFileList] = useState<UploadProps["fileList"]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFileTypes>({
    path: '', open: false
  })
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<boolean>();
  interactionRef.current = hasUserInteracted;

  const handleInteraction = () => {
    setHasUserInteracted(true);
    document.removeEventListener('click', handleInteraction);
  };

  /**Function to add a conversation
   * @param {AddConversationType} values values of the conversation to be added
   */
  const onAddConversation = (values: AddConversationType) => {
    if (!values.message) {
      message.error('Please enter a conversation');
      return;
    }
    if (!projectId) return;

    if (permissions.updateProject === true) {
      setConversations((prev) => ({ ...prev, loading: true }));
      module.addProjectConversation({ ...values, projectId: projectId }).then((res) => {
        const newMessage = res?.data?.data;
        setConversations({ content: '', loading: false })
        setProjectConversations((prev) => ({
          ...prev,
          data: [newMessage, ...prev.data]
        }))
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || 'Something went wrong');
        setConversations((prev) => ({ ...prev, loading: false }));
      })
    } else {
      message.error('You do not have permission to add conversations');
    }
  }

  /**Function to remove a conversation
   * @param {number} conversationId id of the conversation to be deleted
   */
  const onRemoveConversation = (conversationId: number) => {
    if (permissions.updateProject === true) {
      module.removeProjectConversations(conversationId).then((res) => {
        message.success(res?.data?.message || 'conversation deleted successfully');
        onRefresh<{ projectId: number }>({ projectId: projectId });
        // remove the conversation from the list
        setProjectConversations((prev) => ({
          ...prev,
          data: prev.data.filter((item) => item.id !== conversationId)
        }))
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || 'Something went wrong');
      })
    } else {
      message.error('You do not have permission to delete conversations');
    }
  }

  /** Upload file to server */
  const fileUpload: UploadProps['customRequest'] = async (options) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    fmData.append("files[]", file);

    try {
      if (permissions.updateProject === true) {
        await api.post(`project/uploadConversationFiles/${projectId}`, fmData, config);

        onSuccess && onSuccess({ status: 200 });
        setFileList([]);
        onRefresh({ projectId: projectId })
      } else {
        setFileList([]);
        throw new Error("You do not have permission to upload files")
      }
    } catch (err: any) {
      const errorMessage = handleError(err);
      setFileList([]);

      if (errorMessage === "You do not have permission to upload files") {
        messageApi.open({
          key: "permission", type: "error",
          duration: 5, content: errorMessage,
        });
      } else {
        messageApi.open({
          key: "error", type: "error",
          content: errorMessage,
        });
      }

      onError && onError(new Error('Upload failed'))
    }
  };

  /** Get next conversations */
  const onGetNextConversations = useCallback(() => {
    if (meta?.page! < meta?.pageCount!) {
      const dataLength = data?.length || 0;
      const lastMessageId = data?.[dataLength - 1]?.id;
      const params = {
        projectId: projectId,
        before: lastMessageId
      }
      setProjectConversations((prev) => ({ ...prev, loading: true }));
      onRefresh(params);
    }
  }, [data, meta, projectId])

  const updateConversation = (message: ProjectConversationTypes) => {
    if (message && message.projectId) {
      const _Project = message.Project
      const _User = message.User

      if (message.projectId === projectId) {
        setProjectConversations((prev) => ({
          ...prev,
          loading: false,
          // remove the duplicate data
          data: [message, ...prev.data.filter(ele => ele.id !== message.id)]
        }));
      }

      // Alert the user that there's a new message in a different project
      if (message.projectId !== projectId) {
        notificationApi.info({
          placement: "bottomLeft",
          message: `New Message`,
          description: (
            <p className='mb-0'>
              New message from <b>{_User?.firstName} {_User?.lastName}</b> in {""}
              <a
                href={`/chats?projectId=${message?.projectId}`}
                target='_blank' rel='noreferrer'
              >
                <b>{_Project?.referenceNumber} | {_Project?.title}</b>
                <ExternalIcon height={18} width={18} cursor={'pointer'} />
              </a>
            </p>
          )
        });
      }

      if (interactionRef.current && message.userId !== currentUser?.id) {
        PlayNotificationSound();
      }
    }
  }

  /** Handle Keyboards events */
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && isShiftPressed) {
      event.preventDefault();

      if (conversations.content.trim() === '') return;
      onAddConversation({ message: conversations?.content });
    } else if (event.key === 'Shift') {
      setIsShiftPressed(true);
    }
  };

  /** Handle Keyboards events */
  const handleKeyUp = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Shift') {
      setIsShiftPressed(false);
    }
  };

  // Scroll to bottom of the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [data?.length]);

  // Real time chat
  useEffect(() => {
    let socketConnection = getWebSocket();
    socketConnection.on('chat', (message: ProjectConversationTypes) => {
      updateConversation(message);
    });

    return () => {
      socketConnection.disconnect();
      disConnectWebSocket();
    }
  }, [])

  // Handle user interaction
  useEffect(() => {
    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
    }
  }, []);

  return (
    <>
      <Fragment key='messageAlert'>
        {contextHolderMessage}
      </Fragment>
      <Fragment key='notificationAlert'>
        {contextHolderNotification}
      </Fragment>
      <ProCard
        title={(
          <>
            <div className='d-flex align-center justify-space-between w-100'>
              <Typography color='primary-main' size='normal' weight='bold'>
                Conversations
              </Typography>
              <a href={`/chats?projectId=${projectId}`} target='_blank' rel='noreferrer'>
                <ExpandIcon
                  height={18} width={18}
                  cursor={'pointer'}
                />
              </a>
            </div>
            <Divider className={styles.divider} />
          </>
        )}
        headStyle={{ display: 'unset', padding: 0 }}
        bodyStyle={{ padding: 0 }}
        className={styles.conversations}
        ref={chatContainerRef}
      >
        {(!loading && data?.length === 0) && (
          <CustomEmpty description="No conversations yet" />
        )}

        <div
          className={styles.conversations_wrapper}
          style={{
            height: data?.length !== 0 ? 365 : 'unset',
            widows: '100%',
          }}
        >
          {data?.length > 0 && (
            <InfiniteScroll
              dataLength={data ? data.length : 0} height={365}
              hasMore={hasMore} inverse={true}
              loader={loading && (
                <div className={styles.conversations_loader}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                </div>
              )}
              next={onGetNextConversations}
              endMessage={data.length === meta?.total && (
                <p className='font-size-xs color-dark-sub' style={{ textAlign: 'center' }}>
                  End of conversations
                </p>
              )}
              className={styles.conversations_scroll}
            >
              {data?.map((conversation) => (
                <ConversationCards
                  key={conversation.id}
                  data={conversation}
                  setSelectedFile={setSelectedFile}
                  onRemoveConversation={onRemoveConversation}
                  projectMembers={projectMembers}
                />
              ))}
            </InfiniteScroll>
          )}

          <div className={styles.conversations_form}>
            <div className={styles.conversations_form_wrapper}>
              <div className={styles.conversations_form_input_wrapper}>
                <div style={{ width: 30 }}>
                  <Image
                    preview={false} width={30} height={30}
                    className={styles.conversations_form_avatar}
                    src={`${RESOURCE_BASE_URL}${currentUser?.profile}`}
                    alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                    style={{ objectFit: "cover", borderRadius: "100%" }}
                  />
                </div>

                <Upload
                  fileList={fileList}
                  customRequest={fileUpload}
                  showUploadList={false}
                  beforeUpload={(_file, fileList) => {
                    if (fileList.length > 0) {
                      setFileList(fileList);
                      return true
                    }
                    return false
                  }}
                >
                  <div className='px-1'>
                    <Button
                      size="small" type='text'
                      style={{ backgroundColor: 'transparent' }}
                      icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                    />
                  </div>
                </Upload>

                <Mentions
                  placeholder="Tips: (Shift + Enter to send) (@ to mention)"
                  className={`${styles.conversations_form_input} w-100`}
                  autoSize={{ minRows: 1, maxRows: 4 }} placement='top'
                  onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}
                  options={projectMembersOptions?.map((member) => ({
                    label: member.label, value: member.value,
                  }))}
                  value={conversations.content}
                  onChange={(value) => {
                    setConversations((prev) => ({
                      ...prev,
                      content: value?.replace(/\[(.*?)\]\(.*?\)/g, '$1')
                    }));
                  }}
                />

                {conversations.loading ? (
                  <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
                    className={styles.conversations_form_send_loader}
                  />
                ) : (
                  <SendIcon
                    className={styles.conversations_form_send}
                    onClick={() => onAddConversation({ message: conversations?.content })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </ProCard>

      {selectedFile.open && (
        <Drawer
          open={selectedFile.open}
          onClose={() => setSelectedFile({ path: '', open: false })}
          width={window.innerWidth > 700 ? 700 : "100%"}
          title="Preview File" placement="right"
          zIndex={9999}
        >
          <PreviewFile file={selectedFile.path} />
        </Drawer>
      )}
    </>
  );
}
export default ProjectConversations