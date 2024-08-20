import { useState, type FC, useMemo, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, Card, Divider, Dropdown, Popconfirm, Progress, Tabs, TabsProps, Tag, message
} from 'antd';
import {
  MoreOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import { taskPriority } from '@helpers/commonEnums';
import { ProjectModule } from '@modules/Project';
import {
  ProjectConversationTypes, ProjectResourceTypes, ProjectTypes
} from '@modules/Project/types';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectStateType } from '@modules/ProjectState/types';
import { EditableInput, EditableTextarea, Typography } from '@atoms/';
import { NotesIcon } from '@icons/notes';
import ProjectConversations from './Conversations';
import ProjectInfoSection from './Info';
import ChangeStatus from './Status';
import { DetailsTab, FilesTab, ReportTab } from './Tabs';
import styles from "./styles.module.scss";
import ChangeStates from './States';
import ProjectInvoice from './Invoice';
import ProjectPermits from './Permits';
import ProjectGovernmentFees from './Transactions';
import { QueryType } from '@modules/Common/common.interface';
import { formatCurrency, handleError } from '@helpers/common';
import { XMarkIcon } from '@icons/x-mark';
import NotePad from 'Components/Notepad/Notepad';

type DataTypes<T = any> = {
  data: T
  onRefresh: <QueryType = any>(query?: QueryType) => void
  loading: boolean
  meta?: QueryType
}

interface AllSectionsProps {
  permissions: { [key in ProjectPermissionsEnum]: boolean }
  data: {
    project: DataTypes<ProjectTypes>
    projectFiles: DataTypes<ProjectResourceTypes[]>
    projectStates: DataTypes<ProjectStateType[]>
  }
  /** Function to delete a project
  * @param {number} id id of the project to be deleted
  */
  onDelete: (id: number) => void
  /** Function to edit project detail
  * @param {ProjectTypes} values updated values of the project
  * @param {number} id id of the project to be updated
  */
  onEdit: (values: Partial<ProjectTypes>, id: number) => void
  /** Function to fetch project files for the first time */
  setFetchFiles: Dispatch<SetStateAction<boolean>>
}

type IsUpdateTypes = {
  title: { value: string; show: boolean },
  instructions: { value: string; show: boolean }
}

type SidebarTabs = 'details' | 'files' | 'reports' | 'notepad'

const FinanceReportLabel = {
  projectEstimate: 'Project Estimate',
  invoicedAmount: 'Invoiced Amount',
  invoicedPercentage: 'Invoiced Percentage',
  timeAndExpensesAmount: 'Other Expenses',
  toBeInvoicedAmount: 'To Be Invoiced',
  toBeInvoicedAmountPercentage: 'To Be Invoiced Percentage',
  invoiceToCollectPayment: 'Invoice To Collect',
  governmentFeesToCollect: 'Gov. Fees To Collect',
  permitExpiringThisMonth: 'Permit Expiring',
}

const AllSections: FC<AllSectionsProps> = (props) => {
  const {
    permissions, data, onDelete, onEdit, setFetchFiles
  } = props
  const module = useMemo(() => new ProjectModule(), [])
  const { project, projectFiles, projectStates } = data
  const { readProject } = permissions

  const navigate = useNavigate()

  const [openConversation, setOpenConversation] = useState(false)
  const [projectConversations, setProjectConversations] = useState<{
    data: ProjectConversationTypes[]; meta: QueryType; loading: boolean
  }>({ data: [], meta: {}, loading: false })

  const conversationsCondition = useMemo(() => {
    const projectId = project?.data?.id
    return (!!projectId && readProject === true && openConversation === true)
  }, [readProject, project?.data?.id, openConversation])

  /** Function to get project conversations */
  const onGetProjectConversations = useCallback((query?: QueryType) => {
    if (!project?.data?.id) return
    const params: QueryType = {
      projectId: project?.data?.id,
      perPage: 7,
      ...query
    }

    module.getProjectConversations(params).then((res) => {
      const { data, meta } = res?.data
      // only add unique conversations
      const uniqueConversations = data?.filter((conversation) => {
        return !projectConversations?.data?.find((item) => item.id === conversation.id)
      })

      setProjectConversations((prev) => {
        return {
          data: [...(prev?.data || []), ...(uniqueConversations || [])],
          meta: meta || {},
          loading: false
        }
      })
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage || 'Something went wrong')
      setProjectConversations((prev) => {
        return {
          data: prev?.data || [],
          meta: prev?.meta || {},
          loading: false
        }
      })
    })
  }, [project?.data?.id, projectConversations?.data])

  const [tab, setTab] = useState<SidebarTabs>('details');
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <div className={styles.tabBar_header}>
      <DefaultTabBar {...props} className='mb-2' style={{ fontSize: 'var(--font-size-md)' }} />
    </div>
  );

  const [isUpdate, setIsUpdate] = useState<IsUpdateTypes>({
    title: { value: '', show: false },
    instructions: { value: '', show: false }
  })

  /**Function to update the project title and instructions 
   * @param {object} values - name and value of the input to save the updated value in the state
   */
  const onInputsChange = (values: { name: keyof IsUpdateTypes; value: string }) => {
    const { name, value } = values
    setIsUpdate((prev) => ({ ...prev, [name]: { ...prev[name], value } }))
  }

  /**Function to change the visibility of the editable inputs
   * @param {object} values - name and value of the input to change the visibility in the state
   */
  const onVisibleChange = (values: { name: keyof IsUpdateTypes; value: boolean }) => {
    const { name, value } = values
    setIsUpdate((prev) => ({ ...prev, [name]: { ...prev[name], show: value } }))
  }

  /**Function to update the project title and instructions
   * @param {object} values - name and value of the input to save the updated value in the database
   */
  const onMouseDown = (values: { name: keyof IsUpdateTypes; value: string }) => {
    const { name, value } = values
    onVisibleChange({ name, value: false })
    if (value === "") return
    onEdit({ [name]: value }, project?.data?.id)
  }

  useEffect(() => {
    if (conversationsCondition) {
      onGetProjectConversations()
    }
  }, [conversationsCondition])

  return (
    <div className={styles.wrapper}>
      <section className={styles.main}>
        <div className={styles.main__header}>
          <div className={styles.main__header__top}>
            <Typography type="h1" size="normal" color="dark-sub" weight="bold" className="my-auto">
              {project?.data?.referenceNumber ? `${project?.data?.referenceNumber}` : `No Reference Number`}
            </Typography>

            <Tag
              className={styles.main__header__priority}
              color={taskPriority[project?.data?.priority as keyof typeof taskPriority]?.color}
            >
              {taskPriority[project?.data?.priority as keyof typeof taskPriority]?.title}
            </Tag>
          </div>

          {/** Dropdowns */}
          <div className={styles.main_header_dropdowns}>
            <ChangeStatus
              permissions={permissions}
              data={{
                project: project.data,
                onRefresh: project.onRefresh
              }}
            />

            <ChangeStates
              permissions={permissions}
              data={{
                projectStates: projectStates.data,
                project: {
                  data: project.data,
                  onRefresh: project.onRefresh
                }
              }}
            />

            <Dropdown
              trigger={['click']}
              open={dropdownOpen}
              onOpenChange={(open) => setDropdownOpen(open)}
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <EditOutlined />,
                    onClick: () => {
                      navigate(`/projects/edit?id=${project?.data?.id}`)
                    }
                  },
                  {
                    key: 'delete',
                    label: (
                      <Popconfirm
                        title="Are you sure to delete this project?"
                        okText="Yes"
                        cancelText="No"
                        placement='bottom'
                        open={deleteConfirmation}
                        onOpenChange={(open) => setDeleteConfirmation(open)}
                        onConfirm={() => onDelete(project?.data?.id)}
                      >
                        Delete
                      </Popconfirm>
                    ),
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => setDeleteConfirmation(!deleteConfirmation)
                  },
                ]
              }}
            >
              <MoreOutlined className={styles.main_header_dropdowns_icon} />
            </Dropdown>
          </div>
        </div>

        <div className={styles.main_body}>
          <div className={styles.main_body_title_wrap}>
            {isUpdate?.title.show ? (
              <EditableInput
                onBlur={() => onVisibleChange({ name: 'title', value: false })}
                onMouseDown={() => onMouseDown({ name: 'title', value: isUpdate?.title?.value })}
                onChange={(e) => onInputsChange({ name: 'title', value: e.target.value })}
                defaultValue={project?.data?.title}
                style={{
                  padding: "4px 0px",
                  fontWeight: "var(--font-weight-md)",
                }}
                size='small'
              />
            ) : (
              <h3
                className={styles.main_body_title}
                onClick={() => onVisibleChange({ name: 'title', value: true })}
              >
                {project?.data?.title || "No title provided, click to add title"}
              </h3>
            )}
          </div>

          <div
            className={styles.main_body_instructions_wrap}
            onClick={() => onVisibleChange({ name: 'instructions', value: true })}
          >
            {isUpdate?.instructions.show ? (
              <EditableTextarea
                autoSize={{ minRows: 8 }}
                onBlur={() => onVisibleChange({ name: 'instructions', value: false })}
                onMouseDown={() => onMouseDown({ name: 'instructions', value: isUpdate?.instructions?.value })}
                onChange={(e) => onInputsChange({ name: 'instructions', value: e.target.value })}
                defaultValue={project?.data?.instructions}
                className='font-size-normal font-weight-normal pa-1'
                style={{ fontWeight: "var(--font-weight-md)" }}
              />
            ) : (
              <div className={styles.main_body_instructions}>
                {project?.data?.instructions || "No instructions provided, click to add instructions"}
              </div>
            )}
          </div>

          {/**Project Finance Report */}
          {project?.data?.FinanceReport && (
            <div className={styles.main_body_stats}>
              <Card size="small" className={styles.main_body_stats_card}>
                <b>
                  {FinanceReportLabel.projectEstimate}
                </b>
                <p className={styles.main_body_stats_card_value}>
                  {formatCurrency(project?.data?.FinanceReport?.projectEstimate) || 0}
                </p>
              </Card>

              <Card size="small" className={styles.main_body_stats_card}>
                <b>
                  {FinanceReportLabel.invoicedAmount}
                </b>
                <p className={styles.main_body_stats_card_value}>
                  {formatCurrency(project?.data?.FinanceReport?.invoicedAmount) || 0}
                </p>

                <div className={styles.main_body_stats_progress}>
                  <p className='mb-0 font-size-xs' style={{ fontWeight: 400 }}>
                    {project?.data?.FinanceReport?.invoicedPercentage?.toFixed(2) || 0}% of {FinanceReportLabel.projectEstimate}
                  </p>
                  <Progress
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                    percent={project?.data?.FinanceReport?.invoicedPercentage || 0}
                    status="active" showInfo={false}
                  />
                </div>
              </Card>

              <Card size="small" className={styles.main_body_stats_card}>
                <b>
                  {FinanceReportLabel.timeAndExpensesAmount}
                </b>
                <p className={styles.main_body_stats_card_value}>
                  {formatCurrency(project?.data?.FinanceReport?.timeAndExpensesAmount) || 0}
                </p>
              </Card>

              <Card size="small" className={styles.main_body_stats_card}>
                <b>
                  {FinanceReportLabel.toBeInvoicedAmount}
                </b>
                <p className={styles.main_body_stats_card_value}>
                  {formatCurrency(project?.data?.FinanceReport?.toBeInvoicedAmount) || 0}
                </p>

                <div className={styles.main_body_stats_progress}>
                  <p className='mb-0 font-size-xs' style={{ fontWeight: 400 }}>
                    {project?.data?.FinanceReport?.toBeInvoicedAmountPercentage?.toFixed(2) || 0}% of {FinanceReportLabel.projectEstimate}
                  </p>
                  <Progress
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                    percent={project?.data?.FinanceReport?.toBeInvoicedAmountPercentage || 0}
                    status="active" showInfo={false} size='small'

                  />
                </div>
              </Card>

              <Card
                size="small"
                className={styles.main_body_stats_card}
                bodyStyle={{ display: "flex", margin: "auto 0", flexDirection: "column" }}
              >
                <p className={`${styles.main_body_stats_card_title} mb-1`}>
                  {FinanceReportLabel.invoiceToCollectPayment}: {""}
                  {project?.data?.FinanceReport?.invoiceToCollectPayment || 0}
                </p>

                <p
                  className={`${styles.main_body_stats_card_title} mb-1`}
                  style={{
                    color: project?.data?.FinanceReport?.governmentFeesToCollect > 0 ? 'var(--color-red-yp)' : ''
                  }}
                >
                  {FinanceReportLabel.governmentFeesToCollect}: {""}
                  {project?.data?.FinanceReport?.governmentFeesToCollect || 0}
                </p>

                <p
                  className={`${styles.main_body_stats_card_title} mb-0`}
                  style={{
                    color: project?.data?.FinanceReport?.permitExpiringThisMonth > 0 ? 'var(--color-red-yp)' : ''
                  }}
                >
                  {FinanceReportLabel.permitExpiringThisMonth}: {""}
                  {project?.data?.FinanceReport?.permitExpiringThisMonth || 0}
                </p>
              </Card>
            </div>
          )}

          {/** Other Project Info Section */}
          <div className={"mb-4"}>
            <ProjectInfoSection
              data={project?.data}
              onRefresh={project.onRefresh}
            />
          </div>
        </div>
        {/** Project Invoices */}
        <ProjectInvoice projectId={project?.data?.id} />
        {/** Project Permits */}
        <ProjectPermits projectId={project?.data?.id} />
        {/** Project Government Fees */}
        <ProjectGovernmentFees projectId={project?.data?.id} />
      </section>

      <Divider className={styles.divider} type='vertical' />

      {/** Sidebar section with tabs */}
      <section className={styles.sidebar}>
        <Tabs
          style={{ overflowX: "hidden" }}
          className={"sidebar_tabs"}
          activeKey={tab}
          onChange={(key) => {
            const keyType = key as SidebarTabs
            setTab(keyType)
            keyType === 'files' && setFetchFiles(true)
          }}
          renderTabBar={renderTabBar}
          items={[
            {
              label: "Details",
              key: "details",
              children: (
                <DetailsTab
                  permissions={permissions}
                  onEdit={onEdit}
                  data={{
                    project: {
                      data: project?.data,
                      onRefresh: project.onRefresh
                    }
                  }}
                />
              ),
            },
            {
              label: (
                <>
                  <span className="mr-2">
                    Files
                  </span>
                  <Badge
                    count={project?.data?._count?.Resources || 0}
                    showZero color='#faad14'
                  />
                </>
              ),
              key: "files",
              children: (
                <FilesTab
                  permissions={permissions}
                  data={{
                    project: {
                      data: project?.data,
                      onRefresh: project.onRefresh
                    },
                    projectFiles: {
                      data: projectFiles?.data,
                      onRefresh: projectFiles.onRefresh,
                      meta: projectFiles?.meta!,
                      loading: projectFiles?.loading!
                    }
                  }}
                  onEdit={onEdit}
                />
              ),
            },
            {
              label: "Reports",
              key: 'reports',
              children: <ReportTab projectId={project?.data?.id} />,
            },
            {
              label: "Notes",
              key: 'notepad',
              children: <NotePad />,
            },
          ]}
        />
      </section>

      <div className={styles.chat}>
        <Dropdown
          trigger={['click']}
          open={openConversation}
          dropdownRender={() => (
            <ProjectConversations
              projectId={project?.data?.id}
              conversations={projectConversations}
              setProjectConversations={setProjectConversations}
              onRefresh={onGetProjectConversations}
              permissions={permissions}
              projectMembers={project?.data?.ProjectMembers}
            />
          )}
          overlayStyle={{
            width: 400,
            boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
          }}
        >
          <div
            className={styles.chat_icon}
            onClick={() => setOpenConversation(!openConversation)}
          >
            {!openConversation ? (
              <NotesIcon width={24} height={24} />
            ) : (
              <XMarkIcon color='#fff' />
            )}
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
export default AllSections;