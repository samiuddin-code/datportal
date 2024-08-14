import { useState, type FC, useEffect, useMemo, useCallback } from 'react';
import { Avatar, Image, Popconfirm, Switch, Tag, Tooltip, message } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import { XMarkIcon } from '@icons/';
import { convertDate } from '@helpers/dateHandler';
import { ProjectRoleEnum } from '@helpers/commonEnums';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { useDebounce } from '@helpers/useDebounce';
import { handleError, isDateGreaterThan } from '@helpers/common';
import { ProjectTypes, UpdateProjectMemberType } from '@modules/Project/types';
import { UserTypes } from '@modules/User/types';
import { UserModule } from '@modules/User';
import { ProjectPermissionsEnum } from '@modules/Project/permissions';
import { ProjectModule } from '@modules/Project';
import { EditableDatePicker, SelectWithSearch } from '@atoms/'
import SelectableDropdown from '@atoms/UserPopver/select';
import UserPopover from '@atoms/UserPopver/user-popover';
import styles from './styles.module.scss';
import { ClientModule } from '@modules/Client';
import { ClientType } from '@modules/Client/types';
import { OrganizationModule } from '@modules/Organization';
import { OrganizationType } from '@modules/Organization/types';

interface DetailsTabProps {
  data: {
    project: {
      data: ProjectTypes
      onRefresh: <QueryType = any>(query?: QueryType) => void
    }
  }
  permissions: { [key in ProjectPermissionsEnum]: boolean }
  onEdit: (values: Partial<ProjectTypes>, id: number) => void
}

// Types for the search params
type ClientRepresenativeSearchTypes = {
  name: string;
}

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

const DetailsTab: FC<DetailsTabProps> = ({ data, permissions, onEdit }) => {
  const {
    project: { data: project, onRefresh }
  } = data
  const module = useMemo(() => new ProjectModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);

  // State to show remove button on hover of support engineers
  const [showRemoveSupportEng, setShowRemoveSupportEng] = useState<{ [key: string]: boolean }>({})
  // State to show remove button on hover of clients
  const [showRemoveClient, setShowRemoveClient] = useState<{ [key: string]: boolean }>({})
  // State to show update button on hover of end date
  const [isUpdate, setIsUpdate] = useState({ endDate: { show: false, value: '' } });

  const projectMembers = project?.ProjectMembers

  // Initial Project Incharge
  //const initialMemberInCharge = projectMembers?.filter((member) => member.projectRole === ProjectRoleEnum['projectIncharge']) || []
  const initialMemberInCharge = projectMembers?.filter((member) => member.projectRole === ProjectRoleEnum['projectIncharge']) || []
  console.log("Initial members are :" + initialMemberInCharge)

  // Initial Support Engineers from project members
  const initialSupportEngineers = projectMembers?.filter((member) => member.projectRole === ProjectRoleEnum['supportEngineers']) || []
  // Initial Clients and their representatives
  const initialAllClients = project?.ProjectClient

  // Clients Search Term
  const [clientsTerm, setSearchClients] = useState("");
  const debouncedClientsTerm = useDebounce(clientsTerm, 500);
  // Project Incharge Search Term
  const [projectInchargeTerm, setSearchProjectIncharge] = useState("");
  const debouncedProjectInchargeTerm = useDebounce(projectInchargeTerm, 500);
  // Support Engineers Search Term
  const [supportEngineersTerm, setSearchSupportEngineers] = useState("");
  const debouncedSupportEngineersTerm = useDebounce(supportEngineersTerm, 500);

  // Submission By Search Term
  const [submissionByTerm, setSubmissionByTerm] = useState("");
  const debouncedSubmissionByTerm = useDebounce(submissionByTerm, 500);

  // Project Incharge Searched Users
  const [projectIncharge, setProjectIncharge] = useState<SearchedResultTypes<UserTypes>>({
    data: [], loading: false,
  })
  // Support Engineers Searched Users
  const [supportEngineers, setSupportEngineers] = useState<SearchedResultTypes<UserTypes>>({
    data: [], loading: false,
  })
  // Client Representative Searched Users
  const [allClients, setAllClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false,
  })
  // Submission By Searched Companies
  const [submissionByOptions, setSubmissionByOptions] = useState<SearchedResultTypes<OrganizationType>>({
    data: [], loading: false,
  })

  /** Get Project Incharge From API 
   * @param {string} params.name - Search Term
   */
  const GetProjectIncharge = (params: { name: string }) => {
    setProjectIncharge((prev) => ({ ...prev, loading: true }))

    userModule.getAllRecords(params).then((res) => {
      setProjectIncharge((prev) => {
        const responseData = res?.data?.data || [];
        // if the data is already present in the state, then don't add it again
        const filteredData = responseData.filter((item: UserTypes) => {
          return !prev?.data.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        }
      })
    }).catch((err) => {
      message.error(err.response.data.message || "Something went wrong!")
      setProjectIncharge((prev) => ({ ...prev, loading: false }))
    })
  }

  /** Get Support Engineers From API
   * @param {string} params.name - Search Term
   */
  const GetSupportEngineers = (params: { name: string }) => {
    setSupportEngineers((prev) => ({ ...prev, loading: true }))

    userModule.getAllRecords(params).then((res) => {
      console.log('API response:', res);
      setSupportEngineers((prev) => {
        const responseData = res?.data?.data || [];
        // if the data is already present in the state, then don't add it again
        const filteredData = responseData.filter((item: UserTypes) => {
          return !prev?.data.find((prevItem) => prevItem.id === item.id);
        });
        console.log('Filtered data:', filteredData);
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        }
      })
    }).catch((err) => {
      message.error(err.response.data.message || "Something went wrong!")
      setSupportEngineers((prev) => ({ ...prev, loading: false }))
    })
  }

  /** Get All Clients and their representatives
   * @param {string} params.name - Search Term
   * @param {number} params.organizationId - Organization Id
   */
  const GetAllClients = (params: ClientRepresenativeSearchTypes) => {
    setAllClients((prev) => ({ ...prev, loading: true }))

    clientModule.findPublished(params).then((res) => {
      setAllClients((prev) => {
        const responseData = res?.data?.data || [];
        // if the data is already present in the state, then don't add it again
        const filteredData = responseData.filter((item) => {
          return !prev?.data.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        }
      })
    }).catch((err) => {
      message.error(err.response.data.message || "Something went wrong!")
      setAllClients((prev) => ({ ...prev, loading: false }))
    })
  }

  /** Get All Companies for Submission By Field */
  const GetAllCompanies = (params?: { name: string }) => {
    setSubmissionByOptions((prev) => ({ ...prev, loading: true }))

    const { getAllRecords: GetOrganizations } = orgModule

    GetOrganizations(params).then((res) => {
      setSubmissionByOptions((prev) => {
        const responseData = res?.data?.data || [];
        // if the data is already present in the state, then don't add it again
        const filteredData = responseData.filter((item) => {
          return !prev?.data.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        }
      })
    }).catch((err) => {
      message.error(err.response.data.message || "Something went wrong!")
      setSubmissionByOptions((prev) => ({ ...prev, loading: false }))
    })
  }

  // Project InCharge Search
  const onProjectInChargeSearch = useCallback(() => {
    if (debouncedProjectInchargeTerm) {
      GetProjectIncharge({ name: debouncedProjectInchargeTerm })
    }
  }, [debouncedProjectInchargeTerm])

  useEffect(() => {
    onProjectInChargeSearch()
  }, [onProjectInChargeSearch])

  // Support Engineer Search
  const onSupportEngineerSearch = useCallback(() => {
    if (debouncedSupportEngineersTerm) {
      GetSupportEngineers({ name: debouncedSupportEngineersTerm })
    }
  }, [debouncedSupportEngineersTerm])

  useEffect(() => {
    onSupportEngineerSearch()
  }, [onSupportEngineerSearch])

  // Clients Search
  const onClientsSearch = useCallback(() => {
    if (debouncedClientsTerm) {
      const params = {
        name: debouncedClientsTerm,
        organizationId: project?.clientId
      }
      GetAllClients(params)
    }
  }, [debouncedClientsTerm])

  useEffect(() => {
    onClientsSearch()
  }, [onClientsSearch])

  // Submission By Search
  const onSubmissionBySearch = useCallback(() => {
    if (debouncedSubmissionByTerm) {
      GetAllCompanies({ name: debouncedSubmissionByTerm })
    } else {
      GetAllCompanies()
    }
  }, [debouncedSubmissionByTerm])

  useEffect(() => {
    onSubmissionBySearch()
  }, [onSubmissionBySearch])

  /** Remove Project Member */
  const onRemoveMembers = (userId: number, type: "client" | "user") => {
    if (permissions.modifyProjectMembers === true) {
      switch (type) {
        case "client": {
          module.removeProjectClients(project?.id, userId).then((res) => {
            message.success(res?.data?.message)
            onRefresh()
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong!")
          })
          break;
        }
        case "user": {
          module.removeProjectMembers(project?.id, userId).then((res) => {
            message.success(res?.data?.message)
            onRefresh()
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong!")
          })
          break;
        }
      }
    } else {
      message.error("You don't have permission to remove project members")
    }
  }

  /** Update Project Member */
  const onUpdateProjectMember = (data: Partial<UpdateProjectMemberType>) => {
    if (permissions.modifyProjectMembers === true) {
      module.updateProjectMembers({ projectId: project?.id, ...data }).then((res) => {
        message.success(res?.data?.message)
        onRefresh()
      }).catch((err) => {
        const errorMessage = err?.response?.data?.message
        message.error(errorMessage)
      })
    } else {
      message.error("You don't have permission to update project members")
    }
  }

  /**Update Deadline
   * @param {string} endDate - End Date
   */
  const onUpdateDeadline = (endDate: string) => {
    if (permissions.updateProject === true) {
      // format the date to ISO string
      endDate = new Date(endDate).toISOString()
      module.updateRecord({ endDate: endDate }, project?.id).then((res) => {
        if (res) {
          setIsUpdate((prev) => ({ ...prev, endDate: { show: false, value: "" } }));
          onRefresh();
          message.success(res?.data?.message || "Deadline updated successfully");
        }
      }).catch((err) => {
        const errorMessage = err?.response?.data?.message || "Something went wrong!"
        message.error(errorMessage)
      })
    } else {
      message.error("You don't have permission to update deadline")
    }
  }

  // Set Initial Project Incharge
  // useEffect(() => {
  //   console.log('Initial Member In Charge:', initialMemberInCharge);
  //   if (initialMemberInCharge) {
  //     console.log('User in Initial Member In Charge:', initialMemberInCharge.User);
  //     setProjectIncharge({
  //       ...projectIncharge,
  //       data: [initialMemberInCharge?.User],
  //     });
  //   }
  // }, [initialMemberInCharge]);
  

  return (
    <section className={styles.details}>

      {/** Project Incharges */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
        Project Incharge
        </p>

        <div className={styles.details_support_list}>
          {initialMemberInCharge?.map((member) => {
            const { User } = member

            return (
              <div
                key={User?.uuid}
                className={styles.details_support_list_item}
                onMouseEnter={() => setShowRemoveSupportEng({ [User?.uuid]: true })}
                onMouseLeave={() => setShowRemoveSupportEng({})}
              >
                <UserPopover type='user' user={User} className='d-flex align-center'>
                  <Avatar
                    size={32}
                    src={`${RESOURCE_BASE_URL}${User?.profile}`}
                    icon={<UserOutlined />}
                    style={{ border: '1px solid var(--color-border)' }}
                  />

                  <p className={styles.details_support_list_item_name}>
                    {`${User?.firstName} ${User?.lastName}`}
                  </p>
                </UserPopover>

                {showRemoveSupportEng[User?.uuid] && (
                  <Popconfirm
                    placement='left' okText="Yes" cancelText="No"
                    title="Are you sure to remove this support engineer?"
                    onConfirm={() => onRemoveMembers(User?.id, "user")}
                  >
                    <XMarkIcon
                      className={styles.details_support_list_item_remove}
                      color='var(--color-red-yp)'
                    />
                  </Popconfirm>
                )}
              </div>
            )
          })}

          <SelectableDropdown
            showPopover={false} placeholder='Add Project Incharge'
            notFoundDescription='No Project Incharge Found, Search with name'
            loading={projectIncharge?.loading}
            onSearch={(value) => setSearchProjectIncharge(value)}
            // Don't show the already added support engineers
            options={projectIncharge?.data.filter((member) => !initialMemberInCharge?.find((support) => {
              return support?.User?.uuid === member?.uuid
            }))?.map((member) => {
              return {
                value: member?.uuid,
                label: `${member?.firstName} ${member?.lastName}`,
                icon: (
                  <Avatar
                    size={32}
                    src={`${RESOURCE_BASE_URL}${member?.profile}`}
                    icon={<UserOutlined />}
                  />
                )
              }
            })}
            onSelect={(value) => {
              const { data } = projectIncharge
              const selectedUser = data?.find((member) => member?.uuid === value)
              onUpdateProjectMember({ projectInchargeId: [selectedUser?.id!] })
            }}
          />
        </div>
      </div>


      {/** Project Incharge */}
      {/* <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Project Incharge
        </p>

        <div style={{ width: '70%' }}>
          {project && (
            <SelectableDropdown
              showPopover={initialMemberInCharge?.User ? true : false}
              user={initialMemberInCharge?.User!}
              defaultValue={initialMemberInCharge?.User?.uuid}
              loading={projectIncharge.loading}
              onSearch={(value) => setSearchProjectIncharge(value)}
              disableOption={[initialMemberInCharge?.User?.uuid!]}
              placeholder="Add Project Incharge"
              options={projectIncharge.data.map((member) => {
                return {
                  value: member?.uuid,
                  label: `${member?.firstName} ${member?.lastName}`,
                  icon: (
                    <Avatar
                      size={32}
                      src={`${RESOURCE_BASE_URL}${member?.profile}`}
                      icon={<UserOutlined />}
                    />
                  )
                }
              })}
              onSelect={(value) => {
                const { data } = projectIncharge
                const selectedUser = data.find((member) => member?.uuid === value)
                onUpdateProjectMember({ projectInchargeId: selectedUser?.id })
              }}
            />
          )}
        </div>
      </div> */}

      {/** Support Engineers */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Assigned Engineers
        </p>

        <div className={styles.details_support_list}>
          {initialSupportEngineers?.map((member) => {
            const { User } = member

            return (
              <div
                key={User?.uuid}
                className={styles.details_support_list_item}
                onMouseEnter={() => setShowRemoveSupportEng({ [User?.uuid]: true })}
                onMouseLeave={() => setShowRemoveSupportEng({})}
              >
                <UserPopover type='user' user={User} className='d-flex align-center'>
                  <Avatar
                    size={32}
                    src={`${RESOURCE_BASE_URL}${User?.profile}`}
                    icon={<UserOutlined />}
                    style={{ border: '1px solid var(--color-border)' }}
                  />

                  <p className={styles.details_support_list_item_name}>
                    {`${User?.firstName} ${User?.lastName}`}
                  </p>
                </UserPopover>

                {showRemoveSupportEng[User?.uuid] && (
                  <Popconfirm
                    placement='left' okText="Yes" cancelText="No"
                    title="Are you sure to remove this support engineer?"
                    onConfirm={() => onRemoveMembers(User?.id, "user")}
                  >
                    <XMarkIcon
                      className={styles.details_support_list_item_remove}
                      color='var(--color-red-yp)'
                    />
                  </Popconfirm>
                )}
              </div>
            )
          })}

          <SelectableDropdown
            showPopover={false} placeholder='Add Support Engineer'
            notFoundDescription='No Support Engineer Found, Search with name'
            loading={supportEngineers?.loading}
            onSearch={(value) => setSearchSupportEngineers(value)}
            // Don't show the already added support engineers
            options={supportEngineers?.data.filter((member) => !initialSupportEngineers?.find((support) => {
              return support?.User?.uuid === member?.uuid
            }))?.map((member) => {
              return {
                value: member?.uuid,
                label: `${member?.firstName} ${member?.lastName}`,
                icon: (
                  <Avatar
                    size={32}
                    src={`${RESOURCE_BASE_URL}${member?.profile}`}
                    icon={<UserOutlined />}
                  />
                )
              }
            })}
            onSelect={(value) => {
              const { data } = supportEngineers
              const selectedUser = data?.find((member) => member?.uuid === value)
              onUpdateProjectMember({ supportEngineersId: [selectedUser?.id!] })

              // Remove the selected user from the searched users
              // setSupportEngineers((prev) => ({
              //   ...prev,
              //   data: prev?.data.filter((member) => member?.uuid !== value)
              // }))
            }}
          />
        </div>
      </div>

      {/** Clients and their representatives */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Clients Members
        </p>

        <div className={styles.details_clients_list}>
          {initialAllClients?.map((member) => {
            const { Client, isRepresentative } = member

            return (
              <div
                key={Client?.uuid} className={styles.details_clients_list_item}
                onMouseEnter={() => setShowRemoveClient({ [Client?.uuid]: true })}
                onMouseLeave={() => setShowRemoveClient({})}
              >
                <UserPopover
                  type='client' client={Client}
                  className='d-flex align-center'
                  extra={(
                    <>
                      <div className="d-flex align-center">
                        <p className="color-dark-sub mb-0 mr-2">
                          Make as rep
                        </p>

                        <Tooltip
                          title={isRepresentative && "You can't make this client as representative as he/she is already a representative"}
                          placement='bottomRight'
                        >
                          <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            defaultChecked={isRepresentative}
                            onChange={(checked) => {
                              if (checked) {
                                onUpdateProjectMember({ clientRepresentativeId: Client?.id })
                              }
                            }}
                            disabled={isRepresentative}
                            size="small" className="color-dark-sub"
                          />
                        </Tooltip>
                      </div>
                    </>
                  )}
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ border: '1px solid var(--color-border)' }}
                  />

                  <p className={styles.details_clients_list_item_name}>
                    {Client?.name}

                    {isRepresentative && (
                      <Tag color='var(--color-green-yp)' className='ml-4'>
                        Rep.
                      </Tag>
                    )}
                  </p>
                </UserPopover>

                {showRemoveClient[Client?.uuid] && (
                  <Popconfirm
                    placement='left' okText="Yes" cancelText="No"
                    title="Are you sure to remove this client?"
                    onConfirm={() => onRemoveMembers(Client?.id, "client")}
                  >
                    <XMarkIcon
                      className={styles.details_clients_list_item_remove}
                      color='var(--color-red-yp)'
                    />
                  </Popconfirm>
                )}
              </div>
            )
          })}

          <SelectableDropdown
            showPopover={false}
            placeholder='Add Client Member'
            notFoundDescription='No Client Found, Search with name'
            loading={allClients.loading}
            onSearch={(value) => setSearchClients(value)}
            options={allClients.data.map((client) => {
              return {
                value: client?.uuid || '',
                label: client?.name,
                icon: (
                  <Avatar
                    size={32}
                    src={`${RESOURCE_BASE_URL}${client?.logo}`}
                    icon={<UserOutlined />}
                  />
                )
              }
            })}
            onSelect={(value) => {
              const { data } = allClients
              const selectedClient = data.find((client) => client?.uuid === value)
              onUpdateProjectMember({ clients: [selectedClient?.id!] })
            }}
          />
        </div>
      </div>

      {/** Client */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Client
        </p>

        {project?.Client && (
          <div className={styles.details_item_value}>
            <Avatar
              size={32}
              src={`${RESOURCE_BASE_URL}${project?.Client?.logo}`}
              icon={<UserOutlined />}
              style={{ border: '1px solid var(--color-border)' }}
            />

            <p className={styles.details_item_value_org_name}>
              {project?.Client?.name}
            </p>
          </div>
        )}
      </div>

      {/** Total Hours Worked */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Total Hours Worked
        </p>

        {/**TODO: add total worked hours */}
        <p className={styles.details_item_value}>
          N/A
        </p>
      </div>

      {/** Start Date */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Date Created
        </p>

        <p className={styles.details_item_value}>
          {convertDate(project?.addedDate, "dd MM,yy")}
        </p>
      </div>

      {/** Start Date */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Start Date
        </p>

        <p className={styles.details_item_value}>
          {convertDate(project?.startDate, "dd MM,yy")}
        </p>
      </div>

      {/** Deadline */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Deadline
        </p>

        <div className={styles.details_item_value}>
          {!isUpdate.endDate.show ? (
            <p
              className={`${styles.details_item_value_deadline} ${isDateGreaterThan(project?.endDate, new Date().toISOString()) ? 'color-red-yp' : ''}`}
              onClick={() => setIsUpdate((prev) => ({ ...prev, endDate: { show: true, value: "" } }))}
            >
              {convertDate(project?.endDate, "dd MM,yy")}
            </p>
          ) : (
            <EditableDatePicker
              defaultValue={moment(project?.endDate)}
              onChange={(value) => setIsUpdate((prev) => ({
                ...prev, endDate: { ...prev.endDate, value: value?.toString() || "" }
              }))}
              onBlur={() => setIsUpdate((prev) => ({ ...prev, endDate: { show: false, value: "" } }))}
              onMouseDown={() => onUpdateDeadline(isUpdate.endDate.value)}
            />
          )}
          {project?.isExtended && (
            <Tag color="warning" className='ml-2'>
              Extended
            </Tag>
          )}
        </div>
      </div>

      {/** Reason of Extension */}
      {project?.reasonOfExtension && (
        <div className={styles.details_item}>
          <p className={styles.details_item_label}>
            Reason of Extension
          </p>

          <p className={styles.details_item_value}>
            {project?.reasonOfExtension}
          </p>
        </div>
      )}

      {/** Project Type */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Project Type
        </p>

        <p className={styles.details_item_value}>
          {project?.ProjectType?.title}
        </p>
      </div>

      {/** Submission By */}
      <div className={styles.details_item}>
        <p className={styles.details_item_label}>
          Submitted By
        </p>

        <div style={{ width: '70%' }}>
          {project?.submissionById ? (
            <SelectWithSearch
              bordered={false} placeholder="Select Company"
              notFoundDescription="No Company Found, Search with name"
              className={"selectWithIcon"} customOption
              onSearch={(value) => {
                // search only if the value is not present in the options
                const isValuePresent = submissionByOptions.data.find((item) => {
                  const { name } = item

                  return name.toLowerCase().includes(value.toLowerCase())
                })
                if (!isValuePresent) {
                  setSubmissionByTerm(value)
                }
              }}
              onSelect={(value) => onEdit({ submissionById: value }, project?.id)}
              defaultValue={project?.submissionById}
              options={submissionByOptions.data?.map((item) => ({
                label: item.name, value: item.id,
                icon: (
                  <Image
                    src={`${RESOURCE_BASE_URL}${item.logo}`}
                    alt={item.name} preview={false} width={24}
                    style={{ objectFit: 'contain' }}
                  />
                )
              }))}
            />
          ) : (
            <p className={styles.details_item_value_submitted_by}>
              N/A
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export default DetailsTab;