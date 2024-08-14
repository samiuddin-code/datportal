import { useEffect, useMemo, useState } from "react";
import {
  Form, message, Radio, Button, Avatar, Popconfirm, Spin, Input, Checkbox, Tag, DatePicker
} from "antd";
import { ProCard } from "@ant-design/pro-components";
import { DeleteOutlined, LoadingOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  CustomModal, CustomErrorAlert, CustomButton, CustomSelect,
  SelectWithSearch, CustomEmpty, Typography, ImageUploader,
} from "@atoms/";
import { SendIcon } from "@icons/";
import { HandleServerErrors } from "@atoms/ServerErrorHandler";
import CustomTextArea from "@atoms/Input/textarea";
import styles from "../../Common/styles.module.scss";
import { PropTypes } from "../../Common/common-types";
import { errorHandler } from "@helpers/";
import { useDebounce } from "@helpers/useDebounce";
import { LeadTypeEnum } from "@helpers/commonEnums";
import { capitalize, handleError } from "@helpers/common";
import { LeadsModule } from "@modules/Leads";
import { LeadsTypes } from "@modules/Leads/types";
import { LeadsPermissionsEnum } from "@modules/Leads/permissions";
import { ProjectTypeModule } from "@modules/ProjectType";
import { useConditionFetchData, useFetchData } from "hooks";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { ClientModule } from "@modules/Client";
import { ClientType } from "@modules/Client/types";
import { OrganizationModule } from "@modules/Organization";
import { OrganizationType } from "@modules/Organization/types";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import componentStyles from "./styles.module.scss";
import { ClientModal } from "@organisms/Dashboard/Clients/modal";
import { ClientPermissionsEnum } from "@modules/Client/permissions";

const { TextArea } = Input;

type PermissionTypes = { [key in LeadsPermissionsEnum]: boolean } & { [ClientPermissionsEnum.CREATE]: boolean }

type ModalProps = PropTypes & {
  record: number;
  permissions: PermissionTypes
}

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

type NotesStateType = {
  content: string;
  loading: boolean;
  isConcern: boolean
}

const datePresets = [7, 14, 30, 60, 90]

export const LeadsModal = (props: ModalProps) => {
  const {
    openModal, onCancel, type, record, reloadTableData,
    permissions: { createLeads, updateLeads, createClient }
  } = props;

  const [form] = Form.useForm();
  const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);

  const module = useMemo(() => new LeadsModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);

  const { data } = useConditionFetchData<LeadsTypes>({
    method: () => module.getRecordById(record),
    condition: (!!record && type === "edit"),
  })

  const { data: projectTypeData } = useFetchData<ProjectTypeType[]>({
    method: projectTypeModule.getPublishRecords,
    initialQuery: { perPage: 100 }
  })

  const { data: orgData } = useFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
  })

  const { data: allClientsData } = useConditionFetchData<ClientType[]>({
    method: clientModule.findPublished,
    condition: !!data?.clientId,
    initialQuery: { ids: [data?.clientId, data?.representativeId] }
  })

  const { data: allNotes, onRefresh: onRefreshNotes } = useConditionFetchData<LeadsTypes['LeadEnquiryFollowUp']>({
    method: () => module.getNoteById(record),
    condition: type === "notes",
  })

  const [recordData, setRecordData] = useState<{ loading: boolean; error: any; }>({
    loading: false, error: null,
  })
  const [openDate, setOpenDate] = useState(false)
  const [leadType, setLeadType] = useState<LeadTypeEnum>();
  const [notes, setNotes] = useState<NotesStateType>({
    content: '', loading: false, isConcern: false
  })
  const [showDelete, setShowDelete] = useState<{ [key: number]: boolean }>({});
  const [openClientModal, setOpenClientModal] = useState(false);
  const [concernResolved, setConcernResolved] = useState<{
    confirmLoading: boolean; visible: boolean;
  }>({ confirmLoading: false, visible: false });

  // Clients or Organization Search Term
  const [clientsTerm, setSearchClients] = useState("");
  const [xeroTenants, setXeroTenants] = useState<{
    loading: boolean,
    data: { tenantName: string, tenantId: string }[]
  }>({
    loading: true,
    data: []
  });

  const debouncedClientsTerm = useDebounce(clientsTerm, 500);

  // Clients Searched Users
  const [allClients, setAllClients] = useState<SearchedResultTypes<ClientType>>({
    data: [], loading: false,
  })

  const handleErrors = (err: any) => {
    const error = errorHandler(err);
    if (typeof error.message == "string") {
      setRecordData({ ...recordData, error: error.message });
    } else {
      let errData = HandleServerErrors(error.message, []);
      form.setFields(errData);
      setRecordData({ ...recordData, error: "" });
    }
  };

  const handleAlertClose = () => setRecordData({ ...recordData, error: "" });

  /** Get All Clients or Organization */
  const GetAllClients = ({ name, ids }: { name?: string, ids?: number[] }) => {
    setAllClients((prev) => ({ ...prev, loading: true }))

    clientModule.findPublished({ name, ids }).then((res) => {
      setAllClients((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = res?.data?.data?.filter((item) => {
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

  const onFinish = (formValues: LeadsTypes & { attachments: any }) => {
    setRecordData({ ...recordData, loading: true });
    const { attachments, ...rest } = formValues;
    const formData = new FormData();

    // add attachments to form data 
    const files: File[] = attachments?.fileList?.map((file: any) => {
      return file.originFileObj
    });

    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
      }
    }

    switch (type) {
      case "edit": {
        if (updateLeads === true) {
          module.updateRecord({ ...rest }, record).then((res) => {
            if (res?.data?.data) {
              reloadTableData();
            }
            onCancel();
            setRecordData((prev) => ({ ...prev, loading: false }));
          }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, loading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, loading: false }));
          message.error("You don't have enough permission to update leads")
        }
        break;
      }
      case "new": {
        if (createLeads === true) {
          module.createRecord({ ...rest }).then((res) => {
            const { data } = res?.data;
            if (data?.id) {
              formData.append("leadId", data?.id?.toString());
              if (files?.length > 0) {
                module.uploadFile(formData).catch((err) => {
                  const errorMessage = handleError(err);
                  message.error(errorMessage || "Something went wrong while uploading attachments");
                });
              }
              reloadTableData();
              onCancel();
              setRecordData((prev) => ({ ...prev, loading: false }));
            } else {
              setRecordData((prev) => ({ ...prev, loading: false }));
              message.error("Something went wrong");
            }
          }).catch((err) => {
            handleErrors(err);
            const errorMessage = handleError(err);
            message.error(errorMessage || "Something went wrong");
            setRecordData((prev) => ({ ...prev, loading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, loading: false }));
          message.error("You don't have enough permission to create leads")
        }
        break;
      }
    }
  };

  /**Function to add a note
   * @param {string} note note to be added
   */
  const onAddNote = (note: string, isConcern: boolean) => {
    if (!note) {
      message.error('Please enter a note');
      return;
    }

    if (!record) return;

    if (updateLeads === true) {
      setNotes((prev) => ({ ...prev, loading: true }));
      module.addNote(record, { note, isConcern }).then((res) => {
        message.success(res?.data?.message || 'Note added successfully');
        setNotes({ content: '', loading: false, isConcern: false })
        onRefreshNotes();
        reloadTableData();
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Something went wrong');
        setNotes((prev) => ({ ...prev, loading: false }));
      })
    } else {
      message.error('You do not have permission to add notes');
    }
  }

  /**Function to remove a note
   * @param {number} noteId id of the note to be deleted
   */
  const onRemoveNote = (noteId: number) => {
    if (updateLeads === true) {
      module.removeNote(noteId).then((res) => {
        message.success(res?.data?.message || 'Note deleted successfully');
        onRefreshNotes();
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Something went wrong');
      })
    } else {
      message.error('You do not have permission to delete notes');
    }
  }

  useEffect(() => {
    if (debouncedClientsTerm) {
      GetAllClients({ name: debouncedClientsTerm })
    }
  }, [debouncedClientsTerm])

  useEffect(() => {
    if (data && type === "edit") {
      const { clientId, representativeId, message } = data;
      form.setFieldsValue({
        ...data,
        leadType: representativeId ? LeadTypeEnum.company : LeadTypeEnum.individual,
        message: message ? message : undefined,
        clientId: clientId ? clientId : undefined,
        representativeId: representativeId ? representativeId : undefined,
        dueDateForSubmissions: data.dueDateForSubmissions ? moment(data.dueDateForSubmissions) : undefined,
      });

      !representativeId ? setLeadType(LeadTypeEnum.individual) : setLeadType(LeadTypeEnum.company)
    }
  }, [data, type])

  useEffect(() => {
    if (allClientsData) {
      setAllClients((prev) => ({ ...prev, data: allClientsData }))
    }
  }, [allClientsData])

  useEffect(() => {
    if (type === 'edit' || type === 'new') {
      orgModule.getTenants().then((res) => {
        if (res.data && res.data?.data) {
          setXeroTenants({
            loading: false,
            data: res.data.data
          });
        }
      }).catch(err => {
        console.error("Error while fetching tenants", err?.message);
      })
    }
  }, [type])

  return (
    <>
      {openClientModal && (
        <ClientModal
          record={0} type={"new"}
          reloadTableData={() => { }}
          callback={(value) => {
            GetAllClients({ ids: [value] });
            form.setFieldsValue({ clientId: value });
          }}
          onCancel={() => setOpenClientModal(false)}
          openModal={openClientModal}
          permissions={{ createClient: createClient } as { [key in ClientPermissionsEnum]: boolean }}
        />
      )}

      <CustomModal
        visible={openModal}
        closable={true} showFooter={false} onCancel={onCancel}
        titleText={type === "edit" ? "Edit Lead" : type === "notes" ? "Notes" : "Add Lead"}
        size={type === "notes" ? "700px" : "600px"}
        zIndex={!openClientModal ? 10000 : undefined}
      >
        <Form className={styles.form} onFinish={onFinish} form={form}>
          {recordData?.error && (
            <CustomErrorAlert
              description={recordData?.error}
              onClose={handleAlertClose}
              isClosable
            />
          )}

          {type === "notes" ? (
            <ProCard
              headStyle={{ display: 'unset', padding: 0 }}
              bodyStyle={{ padding: 0 }}
              className={componentStyles.notes}
            >
              <div className={componentStyles.notes_wrapper}>
                {allNotes?.length === 0 && (
                  <div className={componentStyles.notes_empty}>
                    <CustomEmpty description="No notes found" />
                  </div>
                )}
                {allNotes?.map((note, index) => (
                  <div
                    key={`note-${index}`} className={componentStyles.note}
                    onMouseEnter={() => setShowDelete({ [note.id]: true })}
                    onMouseLeave={() => setShowDelete({})}
                  >
                    <Avatar
                      size={40} icon={<UserOutlined />}
                      className={componentStyles.note_user_avatar}
                      src={`${RESOURCE_BASE_URL}${note.AddedBy.profile}`}
                      alt={`${note.AddedBy.firstName} ${note.AddedBy.lastName}`}
                    />
                    <div className={componentStyles.note_content_wrapper}>
                      <div className={componentStyles.note_header}>
                        <Typography weight='bold' color='dark-main'>
                          {`${note.AddedBy.firstName} ${note.AddedBy.lastName}`}
                        </Typography>
                        <p
                          className={componentStyles.note_header_date}
                          title={moment(note.addedDate).format("DD MMM, YYYY hh:mm A")}
                        >
                          {moment(note.addedDate).fromNow()}

                          {note.isConcern && (
                            <Tag color="warning" className="ml-2">
                              Concern
                            </Tag>
                          )}

                          {note.isResolved && (
                            <Tag color="green" className="ml-2">
                              Resolved
                            </Tag>
                          )}

                          {(note.isConcern && !note.isResolved) && (
                            <Popconfirm
                              title="Are you sure to mark this concern as resolved?"
                              okText="Yes" cancelText="No" placement='bottomRight'
                              open={concernResolved.visible} zIndex={10000}
                              onOpenChange={(open) => setConcernResolved((prev) => ({ ...prev, visible: open }))}
                              onCancel={() => setConcernResolved((prev) => ({ ...prev, visible: false }))}
                              okButtonProps={{ loading: concernResolved.confirmLoading }}
                              onConfirm={() => {
                                if (updateLeads === true) {
                                  module.markConcernAsResolved(note.id).then((res) => {
                                    message.success(res?.data?.message || 'Concern resolved successfully');
                                    reloadTableData();
                                    onRefreshNotes();
                                    setConcernResolved((prev) => ({ ...prev, visible: false }));
                                  }).catch((err) => {
                                    const errorMessage = handleError(err);
                                    message.error(errorMessage || 'Something went wrong');
                                  })
                                } else {
                                  message.error('You do not have permission to resolve concerns');
                                }
                              }}
                            >
                              <Checkbox
                                checked={false}
                                onChange={(e) => setConcernResolved((prev) => ({ ...prev, visible: e.target.checked }))}
                              >
                                Mark as resolved
                              </Checkbox>
                            </Popconfirm>
                          )}
                        </p>
                        {showDelete[note.id] && (
                          <Popconfirm
                            title="Are you sure to delete this note?"
                            onConfirm={() => onRemoveNote(note.id)}
                            okText="Yes" cancelText="No"
                            placement='left'
                            zIndex={10000}
                          >
                            <DeleteOutlined className={componentStyles.note_header_delete} />
                          </Popconfirm>
                        )}
                      </div>
                      <p className={componentStyles.note_content}>
                        {note.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Checkbox
                checked={notes.isConcern}
                onChange={(e) => setNotes((prev) => ({ ...prev, isConcern: e.target.checked }))}
                className="mt-2"
              >
                Mark as a concern
              </Checkbox>
              <div className={componentStyles.notes_form_input_wrapper}>
                <Avatar
                  size={30} icon={<UserOutlined />}
                  className={componentStyles.notes_form_avatar}
                  src={`${RESOURCE_BASE_URL}${loggedInUserData?.data?.profile}`}
                  alt={`${loggedInUserData?.data?.firstName} ${loggedInUserData?.data?.lastName}`}
                />
                <TextArea
                  placeholder="Add a note..."
                  className={componentStyles.notes_form_input}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={notes.content}
                  onChange={(e) => setNotes((prev) => ({ ...prev, content: e.target.value }))}
                />

                {notes.loading ? (
                  <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
                    className={componentStyles.notes_form_send_loader}
                  />
                ) : (
                  <SendIcon
                    width={30} height={30}
                    className={componentStyles.notes_form_send}
                    onClick={() => onAddNote(notes.content, notes.isConcern)}
                  />
                )}
              </div>
            </ProCard>
          ) : (
            <>
              <label>Lead Type
                <Form.Item
                  name={"leadType"}
                  rules={[{ required: true, message: "Please select a lead type" }]}
                >
                  <Radio.Group
                    value={leadType}
                    onChange={(e) => setLeadType(e.target.value)}
                  >
                    {Object.entries(LeadTypeEnum).map(([key, value]) => {
                      return (
                        <Radio key={key} value={value}>
                          {capitalize(key)}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </Form.Item>
              </label>

              <Form.Item name={"submissionById"}>
                <CustomSelect
                  label="Submission By"
                  options={orgData?.map((org) => {
                    return {
                      value: org?.id || '',
                      label: org?.name,
                    }
                  })}
                />
              </Form.Item>

          {/* <Form.Item name={"xeroTenantId"} style={{ marginBottom: 10 }}
              rules={[{ required: true, message: "Please select xero account" }]}
              help={<small>All Record including invoices, quotations, project of this client will be synced to the selected xero account. This cannot be modified later</small>}
            >
              <CustomSelect
                asterisk
                label="Choose XERO account"
                placeholder="Select XERO Account"
                options={xeroTenants.data?.map((org) => {
                  return {
                    value: org?.tenantId || '',
                    label: org?.tenantName,
                  }
                })}
              />
            </Form.Item> */}

              <>
                <label
                  style={{ color: "var(--color-dark-main)", fontSize: "var(--font-size-sm)" }}
                >
                  Due Date for Submission
                </label>
                <Form.Item
                  name={"dueDateForSubmissions"} style={{ marginBottom: 10 }}
                >
                  <DatePicker
                    placeholder='Due Date for Submission' className={componentStyles.date_picker}
                    open={openDate} showToday={false} popupClassName={componentStyles.z_index}
                    onOpenChange={(status) => setOpenDate(status)}
                    renderExtraFooter={() => (
                      <div className={componentStyles.date_footer}>
                        {/** Custom Date */}
                        {datePresets.map((days) => (
                          <Button
                            key={days} type="ghost" size="small"
                            onClick={() => {
                              const date = moment().add(days, 'days');
                              form.setFieldsValue({ dueDateForSubmissions: date });
                              setOpenDate(false)
                            }}
                          >
                            In {days} days
                          </Button>
                        ))}
                      </div>
                    )}
                  />
                </Form.Item>
              </>

              <div>
                <Form.Item
                  name="clientId"
                  rules={[{ required: true, message: "Please select a client" }]}
                >
                  <SelectWithSearch
                    label='Client'
                    placeholder="Search for a client"
                    notFoundDescription='Could not find any client, try searching with name'
                    onSearch={(value) => setSearchClients(value)}
                    loading={allClients.loading}
                    options={allClients.data.map((client) => {
                      return {
                        value: client?.id || '',
                        label: client?.name,
                      }
                    })}
                    notFoundFooter={
                      <Button
                        type="ghost" size="small"
                        style={{
                          borderColor: "var(--color-primary-main)",
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-primary-main)",
                        }}
                        onClick={() => {
                          setOpenClientModal(true);
                          setSearchClients("");
                        }}
                      >
                        Add New Client
                      </Button>
                    }
                  />
                </Form.Item>
              </div>

              {leadType === LeadTypeEnum['company'] && (
                <>
                  <div>
                    <Form.Item name="representativeId">
                      <SelectWithSearch
                        asterisk={false} label="Client Representative"
                        placeholder="Search for a representative"
                        notFoundDescription='Could not find any representative, try searching with name'
                        onSearch={(value) => setSearchClients(value)}
                        loading={allClients.loading}
                        options={allClients.data.map((user) => {
                          return {
                            value: user?.id || '',
                            label: user?.name
                          }
                        })}
                        // TODO: ask abdullah to give me modal to add new client
                        notFoundFooter={
                          <Button
                            type="ghost" size="small"
                            style={{
                              borderColor: "var(--color-primary-main)",
                              fontSize: "var(--font-size-sm)",
                              color: "var(--color-primary-main)",
                            }}
                          >
                            Add New Client Representative
                          </Button>
                        }
                      />
                    </Form.Item>
                  </div>
                </>
              )}

              <div>
                <Form.Item
                  name={"projectTypeId"}
                  rules={[{ required: true, message: "Please select project type" }]}
                >
                  <CustomSelect
                    label="Project Type" asterisk
                    placeholder="Select Project Type"
                    options={projectTypeData?.map((item) => {
                      return {
                        value: item.id,
                        label: item.title
                      }
                    })}
                  />
                </Form.Item>
              </div>

              <div>
                <Form.Item name="message">
                  <CustomTextArea label={"Message"} />
                </Form.Item>
              </div>

              {type === "new" && (
                <div>
                  <ImageUploader title='Attachments' name="attachments" multiple />
                </div>
              )}
            </>
          )}

          {type !== "notes" && (
            <div className={styles.footer}>
              <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
                Cancel
              </CustomButton>
              <CustomButton
                type="primary" size="normal"
                fontSize="sm" htmlType="submit"
                loading={recordData?.loading}
              >
                Submit
              </CustomButton>
            </div>
          )}
        </Form>
      </CustomModal>
    </>
  );
};
