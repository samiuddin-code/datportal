import { FC, Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Button, Form, Modal, Popconfirm, Radio, message, Image, Avatar, DatePicker
} from "antd";
import { EnquiryStatus, LeadTypeEnum } from "@helpers/commonEnums";
import { EnquiryModule } from "@modules/Enquiry";
import styles from "./styles.module.scss";
import { EnquiryPermissionsEnum } from "@modules/Enquiry/permissions";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { capitalize, handleError } from "@helpers/common";
import { CustomSelect, CustomInput, DropdownWithLabel, SelectWithSearch } from "@atoms/";
import { OrganizationType } from "@modules/Organization/types";
import { AutoCreateLeadTypes, EnquiryType } from "@modules/Enquiry/types";
import { OrganizationModule } from "@modules/Organization";
import { useConditionFetchData } from "hooks";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { UserModule } from "@modules/User";
import { getOptionsFromEnum } from "@helpers/options";
import moment from "moment";

type StatusDropdownProps = {
  status: number;
  record: EnquiryType;
  reloadTableData: (query?: any) => void;
  permissions: { [key in EnquiryPermissionsEnum]: boolean };
  projectTypeData: ProjectTypeType[];
}

type EnquiryStatusColors = {
  [key in EnquiryStatus]: string;
};

type ConfirmEnquiryTypes = {
  loading: boolean;
  value: "yes" | "no" | null;
  clientType: keyof typeof LeadTypeEnum;
  open: boolean;
}

type SearchedResultTypes<T = any> = {
  data: T[]
  loading: boolean
}

const statusColors: EnquiryStatusColors = {
  1: "#FF9800", // darker yellow
  2: "#43A047", // darker green
  3: "#E53935", // darker red
  4: "#FF5722", // darker orange
};

const datePresets = [7, 14, 30, 60, 90]

/** Status Dropdown */
const StatusDropdown: FC<StatusDropdownProps> = (props) => {
  const {
    status, record, reloadTableData, projectTypeData,
    permissions: { updateEnquiryStatus }
  } = props

  const [form] = Form.useForm<AutoCreateLeadTypes>();
  const [messageApi, contextHolder] = message.useMessage();

  const module = useMemo(() => new EnquiryModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const userModule = useMemo(() => new UserModule(), []);

  // Assign To Search Term
  const [assignToTerm, setAssignToTerm] = useState("");
  const [xeroTenants, setXeroTenants] = useState<{
    loading: boolean,
    data: { tenantName: string, tenantId: string }[]
  }>({
    loading: true,
    data: []
  });
  const debouncedAssignToTerm = useDebounce(assignToTerm, 500);


  const [confirmEnquiry, setConfirmEnquiry] = useState<ConfirmEnquiryTypes>({
    open: false, loading: false, value: null,
    clientType: "company",
  });
  const [openDate, setOpenDate] = useState(false)

  const { data: orgData, onRefresh } = useConditionFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
    condition: !!confirmEnquiry.open,
  })

  // Search for the assign to options
  const [assignToOptions, setAssignToOptions] = useState<SearchedResultTypes<UserTypes>>({
    data: [], loading: false,
  })

  const openMessage = (data: {
    key: string;
    type: "success" | "error" | "info" | "warning" | "loading";
    content: string
  }) => {
    messageApi.open({
      key: data.key,
      type: data.type,
      content: data.content,
      duration: data.type === "loading" ? 0 : 2,
    });
  };

  // controls the dropdown visibility
  const [visible, setVisible] = useState<boolean>(false);
  // const [clients] = useState<OrganizationType[]>([]);
  const [openPopConfirm, setOpenPopConfirm] = useState<{
    open: boolean; selected: number | null;
  }>({ open: false, selected: null });

  // const onFetchClients = () => {
  //   module.findDuplicateCompany(record.id).then((res) => {
  //     setClients(res?.data?.data || [])
  //   })
  // }

  const onStatusChange = (_status: number) => {
    if (record.id && updateEnquiryStatus === true) {
      openMessage({
        key: "update",
        type: "loading",
        content: "Updating..."
      });

      module.changeStatus(record.id, _status).then((res) => {
        if (res?.data?.data) {
          openMessage({
            key: "update",
            type: "success",
            content: res?.data?.message
          });

          if (confirmEnquiry.open !== true) {
            setVisible(!visible)
          }

          reloadTableData()
        }
      }).catch((err) => {
        const errorMessage = handleError(err);
        openMessage({
          key: "update", type: "error", content: errorMessage
        });
      });
    } else {
      openMessage({
        key: "update", type: "error",
        content: "You don't have permission to change status"
      });
    }
  }

  /** Get All Companies for Submission By Field */
  const GetUsers = (params?: { name: string }) => {
    setAssignToOptions((prev) => ({ ...prev, loading: true }))

    const { getAllRecords } = userModule

    getAllRecords(params).then((res) => {
      setAssignToOptions((prev) => {
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
      setAssignToOptions((prev) => ({ ...prev, loading: false }))
    })
  }

  const onConfirmEnquiry = (values: AutoCreateLeadTypes) => {
    setConfirmEnquiry((prev) => ({ ...prev, loading: true }));
    const valuesToSubmit = {
      ...values,
      clientType: Number(values.clientType),
      enquiryId: record.id,
    }

    module.autoCreateLead(valuesToSubmit).then((res) => {
      if (res?.data?.data) {
        setConfirmEnquiry((prev) => ({ ...prev, loading: false, open: false }));
        reloadTableData()
        openMessage({
          content: res?.data?.message || "Lead created successfully",
          key: "update", type: "success"
        });
      }
    }).catch((err) => {
      const errorMessage = handleError(err);
      openMessage({
        key: "update", type: "error",
        content: errorMessage || "Something went wrong"
      });
      setConfirmEnquiry((prev) => ({ ...prev, loading: false }));
    })
  }

  const initOptions = getOptionsFromEnum(EnquiryStatus)
  // Get only the spam option
  const options = initOptions.filter((option) => {
    return Number(option.value) === EnquiryStatus.Spam
  })

  // Assign To Search
  const onAssignToSearch = useCallback(() => {
    if (debouncedAssignToTerm) {
      GetUsers({ name: debouncedAssignToTerm })
    }
  }, [debouncedAssignToTerm])

  useEffect(() => {
    onAssignToSearch()
  }, [onAssignToSearch])

  useEffect(() => {
    form.setFieldsValue({
      clientType: Number(LeadTypeEnum.individual),
      projectTypeId: record?.projectTypeId,
      message: record?.message
    })
  }, [])

  useEffect(() => {
    if (confirmEnquiry.open === true) {
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
      onRefresh()
    }
  }, [confirmEnquiry.open])

  return (
    <>
      {contextHolder}
      <div className={"d-flex justify-end align-center"}>
        {/** Overlay */}
        {status === EnquiryStatus.Active ? (
          <>
            <Button
              type="ghost" size="small" className={styles.qualifyButton}
              onClick={() => setConfirmEnquiry((prev) => ({ ...prev, open: true }))}
            >
              Qualify
            </Button>

            <Popconfirm
              title="Are you sure you want to disqualify this enquiry?"
              onConfirm={() => onStatusChange(openPopConfirm.selected as number)}
              onCancel={() => setOpenPopConfirm({
                ...openPopConfirm, open: false
              })}
              open={openPopConfirm.open}
            >
              <DropdownWithLabel
                label={"Disqualify"}
                onClick={() => setOpenPopConfirm({
                  open: true,
                  selected: EnquiryStatus.Unqualified
                })}
                items={options.map((option, index) => {
                  return {
                    key: `option-${index}`,
                    label: option.label,
                    onClick: () => {
                      const value = Number(option.value)
                      setOpenPopConfirm({
                        open: true, selected: value
                      })
                    }
                  }
                })}
                trigger={["click"]}
              />
            </Popconfirm>
          </>
        ) : (
          <div
            className={styles.status}
            style={{ backgroundColor: statusColors[status as keyof EnquiryStatusColors] }}
          >
            {EnquiryStatus[status]}
          </div>
        )}
      </div>

      {confirmEnquiry.open && (
        <Modal
          open={confirmEnquiry.open}
          onCancel={() => setConfirmEnquiry((prev) => ({ ...prev, open: false }))}
          title="Confirm Enquiry" okText="Save"
          destroyOnClose={true} footer={null}
          getContainer={false}
        >
          <div>
            This will create a new lead automatically
            and sent to the lead management team.
          </div>
          <Form
            layout="vertical" form={form} onFinish={onConfirmEnquiry}
            name="confirmEnquiry"
          >
            <label>Lead Type</label>
            <Form.Item
              name={"clientType"} initialValue={LeadTypeEnum.individual}
              rules={[{ required: true, message: "Please select an option" }]}
              style={{ marginBottom: 10 }}
            >
              <Radio.Group
                onChange={(e) => {
                  const value = e.target.value
                  setConfirmEnquiry((prev) => ({
                    ...prev, leadType: value
                  }));

                  // if (value === LeadTypeEnum['company']) {
                  //   onFetchClients()
                  // }
                }}
              >
                {Object.entries(LeadTypeEnum).map(([key, value]) => {
                  return (
                    <Radio key={key} value={Number(value)}>
                      {capitalize(key)}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>

            {/* {(form.getFieldValue("leadType") === LeadTypeEnum['company'] && clients?.length > 0) && (
              <div style={{ marginTop: "-1rem" }}>
                <label>Company Name</label>
                <Form.Item
                  name={"clientId"}
                  rules={[{ required: true, message: "Please choose a company" }]}
                >
                  <Radio.Group>
                    {clients.map((client, index) => {
                      return (
                        <Radio
                          key={`${client.id}-${index}`}
                          value={client.id}
                        >
                          {client.name}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </Form.Item>
              </div>
            )} */}

            <Form.Item
              name={"projectTypeId"} style={{ marginBottom: 10 }}
              rules={[{ required: true, message: "Please select project type" }]}
            >
              <CustomSelect
                options={projectTypeData?.map((item) => {
                  return {
                    value: item.id,
                    label: item.title
                  }
                })}
                placeholder="Select Project Type"
                label="Project Type"
                asterisk
              />
            </Form.Item>

            <Form.Item name={"submissionById"} style={{ marginBottom: 10 }}
             rules={[{ required: true, message: "Please select submission by company" }]}
            >
              <CustomSelect
              asterisk
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
              help={<small>All Record including invoices, quotations, project of this client will be synced to the selected xero account.</small>}
            >
              <CustomSelect
                asterisk
                label="Choose XERO account"
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
              <Form.Item name={"dueDateForSubmissions"} style={{ marginBottom: 10 }}>
                <DatePicker
                  placeholder='Due Date for Submission' className={styles.date_picker}
                  open={openDate} showToday={false}
                  onOpenChange={(status) => setOpenDate(status)}
                  renderExtraFooter={() => (
                    <div className={styles.date_footer}>
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

            <Form.Item
              name={"assignedToId"} style={{ marginBottom: 30 }}
              help={
                <small>
                  If you want to assign this lead to someone, please select from the list
                </small>
              }
            // className="mb-10"
            >
              <SelectWithSearch
                placeholder="Select an user"
                label="Assign To" asterisk={false}
                notFoundDescription="No user found, search with name"
                customOption
                onSearch={(value) => {
                  // search only if the value is not present in the options
                  const isValuePresent = assignToOptions.data.find((item) => {
                    const { firstName, lastName } = item

                    return `${firstName} ${lastName}`.toLowerCase().includes(value.toLowerCase())
                  })
                  if (!isValuePresent) {
                    setAssignToTerm(value)
                  }
                }}
                options={assignToOptions.data?.map((item) => ({
                  label: `${item.firstName} ${item.lastName}`,
                  value: item.id,
                  icon: (
                    <Avatar
                      size={"small"}
                      src={`${RESOURCE_BASE_URL}${item.profile}`}
                      alt={`${item.firstName} ${item.lastName}`}
                    />
                  )
                }))}
              />
            </Form.Item>

            <Form.Item
              name={"message"}
              help={<small> Enter any additional message for the lead management team</small>}
            >
              <CustomInput defaultValue={record.message} label="Message" type="textArea" size="w100" />
            </Form.Item>

            <div className="d-flex justify-end" style={{ gap: "1rem" }}>
              <Button
                key="cancel"
                onClick={() => { setConfirmEnquiry((prev) => ({ ...prev, open: false })); }}
              >
                Cancel
              </Button>
              <Button
                key="save" type="primary" htmlType="submit"
                loading={confirmEnquiry.loading}
              >
                Save
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </>
  );
}

export default StatusDropdown;