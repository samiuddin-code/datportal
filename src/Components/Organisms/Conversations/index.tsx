import {
  FC, useCallback, useEffect, useMemo, useRef, useState, KeyboardEvent
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Layout as AntLayout, Menu, Avatar, message, Skeleton, Drawer,
  UploadProps, Image, Upload, Button, Spin, Tooltip, Mentions,
  Typography as AntdTypography
} from 'antd';
import {
  PaperClipOutlined, LoadingOutlined, CloseOutlined,
  LeftCircleOutlined, RightCircleOutlined
} from '@ant-design/icons';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import Layout from '@templates/Layout';
import { CustomEmpty, CustomInput, Typography } from '@atoms/';
import { ExternalIcon, GroupIcon, RefreshIcon, SendIcon } from '@icons/';
import PreviewFile from '@atoms/PreviewFile';
import { useConditionFetchData, useFetchData } from 'hooks';
import { ProjectModule } from '@modules/Project';
import {
  ProjectConversationQueryTypes, ProjectConversationTypes, ProjectListForChatTypes,
  ProjectResourceTypes, ProjectTypes
} from '@modules/Project/types';
import { QueryType } from '@modules/Common/common.interface';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { PlayNotificationSound, getPermissionSlugs, handleError } from '@helpers/common';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { useDebounce } from '@helpers/useDebounce';
import { disConnectWebSocket, getWebSocket } from '@helpers/chat.gateway';
import { RootState } from 'Redux/store';
import ConversationCards from './card';
import api from "@services/axiosInstance";
import TokenService from '@services/tokenService';
import ConversationDetail from './Details';
import ManageMedia from '@organisms/Projects/Details/Sections/Tabs/Files/manage-media';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  AddConversationType, ConversationTypes, ConversationsStateType,
  DetailsType, SelectedFileType, UpdateProjectsListProps
} from './types';
import styles from './styles.module.scss';
import moment from 'moment';

const { Header, Sider, Content, Footer } = AntLayout;
const { Text, Title } = AntdTypography;

const AllConversations: FC = () => {
  // available permissions
  const permissionSlug = getPermissionSlugs(ProjectPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in ProjectPermissionsEnum]: boolean };
  const [messageApi, contextHolder] = message.useMessage();
  const currentUser = TokenService.getUserData();
  const [searchParams, setSearchParams] = useSearchParams()
  const projectIdFromURL = searchParams.get("projectId")

  const [selectedProject, setSelectedProject] = useState<ProjectListForChatTypes>();
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isManageMediaOpen, setIsManageMediaOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [projectConversations, setProjectConversations] = useState<ConversationTypes>({
    data: [], meta: {}, loading: { default: true, reload: false }, showEndMessage: false
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const interactionRef = useRef<boolean>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  interactionRef.current = hasUserInteracted;

  const [conversations, setConversations] = useState<ConversationsStateType>({
    content: '', loading: false
  })
  const [fileList, setFileList] = useState<UploadProps["fileList"]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFileType>({ path: '', open: false })
  const [details, setDetails] = useState<DetailsType>({ collapsed: false, fetched: false });
  const [collapsed, setCollapsed] = useState(false);

  /** Project Module instance for API calls */
  const module = useMemo(() => new ProjectModule(), []);

  /** Project Files and details fetch condition */
  const detailsCondition = useMemo(() => {
    return !!selectedProject?.slug && details.fetched;
  }, [details.fetched, selectedProject?.slug]);

  /** Whether there's more data to be fetched or not in the conversations */
  const hasMore = useMemo(() => {
    const conversations = projectConversations
    return conversations?.data?.length! < conversations?.meta?.total!;
  }, [projectConversations?.data?.length, projectConversations?.meta?.total]);

  // Project List Fetch
  const {
    data: projectsList, onRefresh: onRefreshProjectList, loading: loadingProjectsList,
    setData: setProjectsList
  } = useFetchData<ProjectListForChatTypes[]>({ method: module.getProjectListForChat });

  // Project Details Fetch
  const {
    data: selectedProjectDetails, onRefresh,
    loading: selectedProjectDetailsLoading
  } = useConditionFetchData<ProjectTypes>({
    method: () => module.getRecordBySlug(selectedProject?.slug!),
    condition: detailsCondition,
  });

  // Project Files Fetch
  const {
    data: projectFiles, onRefresh: onRefreshProjectFiles,
    loading: loadingProjectFiles, meta: projectFilesMeta
  } = useConditionFetchData<ProjectResourceTypes[]>({
    method: module.getProjectResources,
    initialQuery: { projectId: selectedProject?.id, perPage: 12 },
    condition: detailsCondition
  })

  /** Project Members For Mentions */
  const projectMembersOptions = useMemo(() => {
    return selectedProject?.ProjectMembers?.map((member) => {
      const name = `${member?.User?.firstName} ${member?.User?.lastName}`
      const userId = member?.User?.id
      return { label: name, value: `[${name}](${userId})` };
    });
  }, [selectedProject?.ProjectMembers]);

  const projectMembers = useMemo(() => {
    return selectedProject?.ProjectMembers?.map((member) => member?.User?.firstName);
  }, [selectedProject?.ProjectMembers]);

  const firstThreeMembers = useMemo(() => projectMembers?.slice(0, 3), [projectMembers]);

  const otherMembersCount = useMemo(() => {
    return projectMembers?.length! - firstThreeMembers?.length!;
  }, [firstThreeMembers, projectMembers]);

  /** Get project conversations */
  const onGetProjectConversations = useCallback((query?: Partial<ProjectConversationQueryTypes>, type: "reload" | "default" = "default") => {
    const projectId = query?.projectId!;

    const params = { projectId: projectId, ...query };

    setProjectConversations((prev) => ({
      ...prev!,
      loading: type === "default" ? { default: true, reload: false } : { default: false, reload: true },
    }));

    module.getProjectConversations(params).then((res) => {
      const { data, meta } = res?.data

      // remove the duplicate data
      const uniqueData = data.filter((item) => {
        return !projectConversations?.data?.some((prevItem) => prevItem.id === item.id)
      })

      const finalData = type === "default" ? data : [...projectConversations?.data!, ...uniqueData];

      setProjectConversations((prev) => ({
        ...prev,
        data: finalData, meta: meta,
        loading: { default: false, reload: false },
        showEndMessage: finalData.length === meta?.total
      }))
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong!");
      setProjectConversations((prev) => ({
        ...prev,
        loading: { default: false, reload: false }
      }))
    });
  }, [projectConversations]);

  /**Function to add a conversation
   * @param {AddConversationType} values values of the conversation to be added
   */
  const onAddConversation = useCallback((values: AddConversationType) => {
    const projectId = selectedProject?.id!;
    if (!projectId) return;

    if (permissions.updateProject === true) {
      setConversations((prev) => ({ ...prev, loading: true }));
      module.addProjectConversation({ ...values, projectId: projectId }).then((res) => {
        setConversations({ loading: false, content: '' });
        let newMessage = res.data.data;
        if (newMessage && newMessage.projectId) {
          setProjectConversations((prev) => ({
            ...prev,
            loading: { default: false, reload: false },
            data: [newMessage, ...prev.data]
          }));
        }
      }).catch((err) => {
        const errorMessage = handleError(err);
        message.error(errorMessage || 'Something went wrong');
        setConversations((prev) => ({ ...prev, loading: false }));
      })
    } else {
      message.error('You do not have permission to add conversations');
    }
  }, [selectedProject?.id, permissions]);

  // create a new conversation object
  const createProjectConversations = (message: ProjectConversationTypes) => ({
    addedDate: message?.addedDate,
    message: message?.message,
    mediaCount: message?.Media?.length
  });

  // update the project conversations
  const updateProjectConversations = (message: ProjectConversationTypes) => {
    setProjectConversations((prev) => ({
      ...prev,
      loading: { default: false, reload: false },
      data: [message, ...prev.data.filter(ele => ele.id !== message.id)]
    }));
  };

  // update the project list
  const updateProjectsList = (props: UpdateProjectsListProps) => {
    const {
      message, _Project, _ProjectConversations, _ProjectMembers, unreadConversationCount
    } = props;

    let newProject = {
      id: _Project?.id,
      title: _Project?.title,
      slug: _Project?.slug,
      onHold: _Project?.onHold,
      referenceNumber: _Project?.referenceNumber,
      ProjectMembers: _ProjectMembers,
      ProjectConversation: _ProjectConversations,
      unreadConversationCount: (message?.projectId === Number(projectIdFromURL)) ? 0 : unreadConversationCount
    }

    setProjectsList((prev) => {
      let newProjectList = prev?.filter((project) => project.id !== message.projectId);
      return [newProject, ...newProjectList!]
    })
  };

  const updateConversation = (message: ProjectConversationTypes, selectedProjectData: ProjectListForChatTypes | undefined) => {
    const projectIdFromURL = selectedProjectData?.id;

    if (message && message.projectId) {
      const _ProjectConversations = createProjectConversations(message);
      const _Project = message.Project;
      const unreadConversationCount = message.unreadConversationCount || 0;
      const _ProjectMembers = message.Project.ProjectMembers;

      // update the conversation if the project is selected
      if (message.projectId === projectIdFromURL) {
        updateProjectConversations(message);
      }

      if (interactionRef.current && message.userId !== currentUser?.id) {
        PlayNotificationSound();
      }

      // Prepend the new message to the list of conversations (project list) if the project is not selected
      if (message.projectId !== projectIdFromURL) {
        updateProjectsList({
          message, _Project, _ProjectConversations, _ProjectMembers, unreadConversationCount
        });
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

  /**Function to remove a conversation
   * @param {number} conversationId id of the conversation to be deleted
   */
  const onRemoveConversation = useCallback((conversationId: number) => {
    const projectId = selectedProject?.id!;
    if (permissions.updateProject === true) {
      module.removeProjectConversations(conversationId).then((res) => {
        message.success(res?.data?.message || 'conversation deleted successfully');
        onGetProjectConversations({ projectId: projectId }, "reload");
        // remove the deleted conversation from the list of conversations
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
  }, [selectedProject?.id]);

  /** Upload file to server */
  const fileUpload: UploadProps['customRequest'] = useCallback(async (options: UploadRequestOption) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    fmData.append("files[]", file);

    const projectId = selectedProject?.id!;

    const handleSuccess = () => {
      onSuccess && onSuccess({ status: 200 });
      setFileList([]);
      onGetProjectConversations({ projectId: projectId }, "reload");
    };

    const handleErrors = (err: any) => {
      const errorMessage = handleError(err);
      setFileList([]);

      const messageType = errorMessage === "You do not have permission to upload files" ? "permission" : "error";
      messageApi.open({
        key: messageType, type: "error",
        duration: 5, content: errorMessage,
      });

      onError && onError(new Error('Upload failed'));
    };

    try {
      if (permissions.updateProject === true) {
        await api.post(`project/uploadConversationFiles/${projectId}`, fmData, config);
        handleSuccess();
      } else {
        throw new Error("You do not have permission to upload files");
      }
    } catch (err) {
      handleErrors(err);
    }
  }, [selectedProject?.id]);

  /** Get next conversations */
  const onGetNextConversations = useCallback(() => {
    const conversations = projectConversations
    if (conversations?.meta?.page! < conversations?.meta?.pageCount!) {
      const dataLength = conversations?.data?.length || 0;
      const lastMessageId = conversations?.data?.[dataLength - 1]?.id;
      const params = {
        projectId: selectedProject?.id!,
        before: lastMessageId
      }
      onGetProjectConversations(params, "reload");
    }
  }, [projectConversations, selectedProject?.id]);

  // Scroll to bottom of the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [projectConversations?.data?.length]);

  // if the selected project changes, close the collapsed sidebar
  useEffect(() => {
    setDetails((prev) => ({ ...prev, collapsed: false }));
  }, [selectedProject?.id]);

  // fetch the project details 
  useEffect(() => {
    if (selectedProject?.slug && details.fetched) {
      onRefresh();
    }
  }, [selectedProject?.slug, details.fetched]);

  // Search projects
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      onRefreshProjectList({ title: debouncedSearchTerm });
    } else if (debouncedSearchTerm === '') {
      onRefreshProjectList({});
    }
  }, [debouncedSearchTerm]);

  // fetch the project conversations based on the selected project id from the url
  useEffect(() => {
    if (projectIdFromURL) {
      const project = projectsList?.find((project) => project?.id === Number(projectIdFromURL));
      if (project) {
        setSelectedProject(project);
        onGetProjectConversations({ projectId: project?.id }, "reload");
        setDetails((prev) => ({ ...prev, fetched: false }));
      }
    }
  }, [projectsList]);

  // Real time chat
  useEffect(() => {
    let socketConnection = getWebSocket();
    socketConnection.on('chat', (message: ProjectConversationTypes) => {
      updateConversation(message, selectedProject);
    });

    return () => {
      socketConnection.disconnect();
      disConnectWebSocket();
    }
  }, [selectedProject])

  const handleInteraction = () => {
    setHasUserInteracted(true);
    document.removeEventListener('click', handleInteraction);
  };

  useEffect(() => {
    let shouldReload = false;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const projectIdFromURL = Number(searchParams.get("projectId"));
        if (projectIdFromURL && shouldReload) {
          onGetProjectConversations({ projectId: projectIdFromURL }, "reload");
          shouldReload = false;
        }
      } else {
        setTimeout(() => {
          shouldReload = true;
        }, 8000)
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
    }
  }, []);

  return (
    <>
      {contextHolder}
      <Layout permissionSlug={permissionSlug} showSidebar={false}>
        <AntLayout className={styles.layout}>
          {/** Project List Sider */}
          <Sider
            className={styles.sider}
            width={window.innerWidth < 768 ? (window.innerWidth - 10) : 350}
            breakpoint='lg' //collapsedWidth='0' 
            theme='light'
            zeroWidthTriggerStyle={{
              borderRadius: "100%", width: 40, height: 40,
              right: (window.innerWidth < 768 && collapsed) ? 0 : -20,
            }}
            trigger={(
              collapsed ? (
                <RightCircleOutlined
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: 20, color: "var(--color-dark-sub)" }}
                />
              ) : (
                <LeftCircleOutlined
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: 20, color: "var(--color-dark-sub)" }}
                />
              ))}
            collapsible collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div className={styles.sider_header}>
              <CustomInput
                placeHolder="Search..." value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                onClick={() => setCollapsed(false)}
              />
            </div>

            {(!loadingProjectsList && projectsList?.length === 0) && (
              <div className={styles.sider_empty}>
                <CustomEmpty description='No projects found' />
              </div>
            )}

            {loadingProjectsList ? (
              <Skeleton avatar paragraph={{ rows: 4 }} style={{ padding: "0 1rem" }} />
            ) : (
              <Menu
                mode="inline" defaultSelectedKeys={[`project-${projectIdFromURL}`]}
                items={projectsList?.map((project, idx) => {
                  const unreadConversationCount = project?.unreadConversationCount;
                  return {
                    key: `project-${project?.id}-${idx}-${(Math.random() * 1000)}`,
                    label: (
                      <>
                        <Typography
                          className={styles.sider_item_title}
                          color={collapsed ? 'light-100' : 'dark-main'}
                          size='sm' style={{ marginBottom: 5 }}
                          weight={unreadConversationCount > 0 ? "bold" : "normal"}
                        >
                          {`${project?.referenceNumber} | ${project?.title}`}
                        </Typography>

                        {project?.ProjectConversation?.message && (
                          <div className='d-flex'>
                            <Typography
                              className={styles.sider_item_last_message}
                              color={collapsed ? 'light-100' : 'dark-sub'}
                              size='xs'
                              weight={unreadConversationCount > 0 ? "bold" : "normal"}
                            >
                              {project?.ProjectConversation?.message}
                            </Typography>

                            <div className='ml-auto mr-0 d-flex'>
                              <Typography
                                className={styles.sider_item_last_message} color='dark-sub' size='xs'
                                weight="normal"
                                title={moment(project?.ProjectConversation?.addedDate).format("DD MMM, YYYY hh:mm A")}
                              >
                                {moment(project?.ProjectConversation?.addedDate).fromNow()}
                              </Typography>

                              {unreadConversationCount > 0 && (
                                <div className={styles.badge}>
                                  {(unreadConversationCount > 9) ? "9+" : unreadConversationCount}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {project?.ProjectConversation?.mediaCount > 0 && (
                          <div className='d-flex justify-space-between'>
                            <Typography
                              className={styles.sider_item_last_message} color='dark-sub' size='xs'
                              weight={unreadConversationCount > 0 ? "bold" : "normal"}
                            >
                              {`${project?.ProjectConversation?.mediaCount} file${project?.ProjectConversation?.mediaCount > 1 ? 's' : ''}`}
                            </Typography>
                            <Typography
                              className={styles.sider_item_last_message} color='dark-sub' size='xs'
                              weight="normal"
                              title={moment(project?.ProjectConversation?.addedDate).format("DD MMM, YYYY hh:mm A")}
                            >
                              {moment(project?.ProjectConversation?.addedDate).fromNow()}
                            </Typography>

                            {(unreadConversationCount > 0) &&
                              <div className={styles.badge}>
                                {(unreadConversationCount > 9) ? "9+" : unreadConversationCount}
                              </div>
                            }
                          </div>
                        )}
                      </>
                    ),
                    icon: <GroupIcon width={20} height={20} />,
                    onClick: () => {
                      if (selectedProject?.id === project?.id) return
                      setSearchParams({ projectId: project.id.toString() }, { replace: true });
                      // set unread conversation count to 0 when the project is selected
                      setProjectsList((prev) => {
                        const selectedProject = prev?.find((item) => item.id === project.id);
                        if (selectedProject) {
                          selectedProject.unreadConversationCount = 0;
                        }
                        return [...prev!]
                      })

                      setProjectConversations((prev) => ({
                        ...prev, data: [], showEndMessage: false,
                        loading: { default: false, reload: true },
                      }))

                      // close the collapsed sidebar when a project is selected if it is open and the window width is less than 768px
                      if (window.innerWidth < 768) {
                        setCollapsed((prev) => {
                          if (prev === false) return true;
                          return prev;
                        })
                      }
                    },
                    className: styles.myProjectList + " " + ((selectedProject?.id === project?.id) ? styles.activeProject : "")
                  }
                })}
              />
            )}
          </Sider>

          <AntLayout>
            {selectedProject?.id && (
              <Header
                className={`${styles.header} trigger cursor-pointer`}
                style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}
                onClick={() => setDetails((prev) => ({
                  ...prev, fetched: true,
                  collapsed: !prev.collapsed,
                }))}
              >
                <Avatar icon={<GroupIcon />} />

                <div className={styles.header_content}>
                  <Title
                    level={5} className={styles.header_content_title}
                    ellipsis={{
                      rows: 1, expandable: false,
                      tooltip: `${selectedProject?.referenceNumber} | ${selectedProject?.title}`
                    }}
                  >
                    {`${selectedProject?.referenceNumber} | ${selectedProject?.title}`}
                  </Title>

                  {/** Project Members */}
                  {selectedProject?.ProjectMembers?.length > 0 && (
                    <Typography className={styles.header_content_members} color='dark-sub' size='xs'>
                      {`${firstThreeMembers?.join(', ')} ${otherMembersCount > 0 ? `and ${otherMembersCount} others` : ''}`}
                    </Typography>
                  )}
                </div>

                <Tooltip title="Refresh" placement="left">
                  <RefreshIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      onGetProjectConversations({ projectId: selectedProject?.id! }, "reload");
                    }}
                  />
                </Tooltip>
              </Header>
            )}

            <Content
              ref={chatContainerRef} className={styles.content}
              style={{
                height: window.innerHeight - 60, widows: '100%', position: 'relative',
                flexDirection: projectConversations?.data?.length > 0 ? 'column-reverse' : 'column',
              }}
            >
              {!selectedProject?.id && (
                <div className={styles.content_empty_wrapper}>
                  <div className={styles.content_empty}>
                    <CustomEmpty
                      description='Select a project to see conversations'
                      imageStyle={{ height: 200 }}
                    />
                  </div>
                </div>
              )}

              {(projectConversations?.loading?.default && selectedProject?.id) && (
                <Skeleton active />
              )}

              {(selectedProject?.id && projectConversations?.data?.length === 0) && (
                <div className={styles.content_empty_wrapper}>
                  <div className={styles.content_empty}>
                    <CustomEmpty description='No conversations yet' />
                  </div>
                </div>
              )}

              {projectConversations?.loading?.reload && (
                <div className={styles.content_loader}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                </div>
              )}

              {projectConversations?.data?.length! > 0 && (
                <InfiniteScroll
                  dataLength={projectConversations?.data?.length!}
                  hasMore={hasMore} inverse height={window.innerHeight - 180}
                  style={{ display: 'flex', flexDirection: 'column-reverse', overflowX: 'hidden' }}
                  next={onGetNextConversations}
                  loader={(
                    <div className={styles.content_loader}>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                    </div>
                  )}
                  endMessage={projectConversations?.showEndMessage && (
                    <p className='font-size-xs color-dark-sub' style={{ textAlign: 'center' }}>
                      End of conversations
                    </p>
                  )}
                >
                  {selectedProject?.id && projectConversations?.data?.map((conversation) => (
                    <ConversationCards
                      key={conversation.id}
                      data={conversation}
                      setSelectedFile={setSelectedFile}
                      onRemoveConversation={onRemoveConversation}
                      projectMembers={selectedProject?.ProjectMembers}
                    />
                  ))}
                </InfiniteScroll>
              )}
            </Content>

            {/** Message Input Section */}
            {selectedProject?.id && (
              <Footer className={styles.conversations_footer}>
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
                        fileList={fileList} customRequest={fileUpload}
                        showUploadList={false} multiple maxCount={10}
                        onChange={({ fileList }) => {
                          if (fileList.length > 10) {
                            message.error('You can only upload 10 files at a time');
                            return;
                          }
                          setFileList(fileList);
                        }}
                        beforeUpload={(_file, fileList) => {
                          if (fileList.length < 10) {
                            setFileList(fileList);
                            return true
                          } else {
                            message.error('You can only upload 10 files at a time');
                          }
                          return false
                        }}
                      >
                        <div className='px-1'>
                          <Button
                            size="small" type='text' style={{ backgroundColor: 'transparent' }}
                            icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                          />
                        </div>
                      </Upload>

                      <Mentions
                        placeholder="Type a message...  Tips: (Shift + Enter to send) (@ to mention)"
                        className={`${styles.conversations_form_input} w-100`}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}
                        options={projectMembersOptions}
                        value={conversations.content}
                        onChange={(value) => {
                          const replacedValue = value?.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                          setConversations((prev) => ({
                            ...prev,
                            content: replacedValue
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
                          onClick={() => {
                            if (conversations.content.trim() === '') return;
                            onAddConversation({ message: conversations?.content });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Footer>
            )}
          </AntLayout>
          {/** Conversation Details Sider */}
          {details.collapsed && (
            <Sider
              className={styles.collapsed_sider}
              collapsible collapsed={details.collapsed}
              onCollapse={value => setDetails((prev) => ({ ...prev, collapsed: value }))}
              collapsedWidth={430} trigger={null}
              style={{ overflow: 'auto', width: "100%" }}
            >
              <div className={styles.collapsed_sider_header}>
                <CloseOutlined
                  style={{ fontSize: 18, color: "var(--color-dark-sub)", marginRight: 10 }}
                  onClick={() => setDetails((prev) => ({ ...prev, collapsed: false }))}
                />

                <Text
                  className={styles.collapsed_sider_header_title}
                  ellipsis={{ tooltip: `${selectedProject?.referenceNumber} | ${selectedProject?.title}` }}
                >
                  {`${selectedProject?.referenceNumber} | ${selectedProject?.title}`}
                </Text>

                <a
                  className='ml-1' target='_blank' rel='noreferrer'
                  href={`/projects/${selectedProject?.slug}?id=${selectedProject?.id}`}
                >
                  <ExternalIcon width={18} height={18} className='ml-auto mt-2' />
                </a>
              </div>

              <ConversationDetail
                details={{
                  data: selectedProjectDetails!,
                  files: {
                    data: projectFiles || [],
                    meta: projectFilesMeta as QueryType,
                    onRefresh: onRefreshProjectFiles
                  },
                  loading: selectedProjectDetailsLoading
                }}
                setIsManageMediaOpen={setIsManageMediaOpen}
              />
            </Sider>
          )}
        </AntLayout>

        {selectedFile.open && (
          <Drawer
            open={selectedFile.open} zIndex={9999}
            width={window.innerWidth > 768 ? 700 : "100%"}
            title="Preview File" placement="right"
            onClose={() => setSelectedFile({ path: '', open: false })}
          >
            <PreviewFile file={selectedFile.path} />
          </Drawer>
        )}

        {isManageMediaOpen && (
          <ManageMedia
            projectId={selectedProject?.id!}
            isManageMediaOpen={isManageMediaOpen}
            setIsManageMediaOpen={setIsManageMediaOpen}
            media={{
              loading: loadingProjectFiles,
              data: projectFiles || [],
              onRefresh: onRefreshProjectFiles,
              meta: projectFilesMeta as QueryType
            }}
          />
        )}
      </Layout>
    </>
  )
}

export default AllConversations;