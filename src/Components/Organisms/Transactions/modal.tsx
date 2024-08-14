import { DatePicker, Form, InputNumber, UploadProps, message } from "antd";
import {
  CustomInput, CustomModal, CustomButton, CustomSelect,
  SelectWithSearch, ImageUploader,
} from "@atoms/";
import { Moment } from "moment";
import styles from "../Common/styles.module.scss";
import { useEffect, useMemo, useState } from "react";
import { PropTypes } from "@organisms/Common/common-types";
import { TransactionsPermissionsEnum } from "@modules/Transactions/permissions";
import { TransactionsModule } from "@modules/Transactions";
import { useConditionFetchData } from "hooks";
import { TransactionsType } from "@modules/Transactions/types";
import { AuthoritiesModule } from "@modules/Authorities";
import { AuthoritiesType } from "@modules/Authorities/types";
import { useDebounce } from "@helpers/useDebounce";
import CustomTextArea from "@atoms/Input/textarea";
import { handleError } from "@helpers/common";
import { ProjectModule } from "@modules/Project";
import { ProjectTypes } from "@modules/Project/types";
import TokenService from "@services/tokenService";
import { TransactionStatusOptions } from "@helpers/options";
import { RcFile } from "antd/lib/upload";
import moment from "moment";
import { PROTECTED_RESOURCE_BASE_URL } from "@helpers/constants";
import { InvoiceTypes } from "@modules/Invoice/types";
import { InvoiceModule } from "@modules/Invoice";

interface TransactionsModalProps extends PropTypes {
  record: number;
  permissions: { [key in TransactionsPermissionsEnum]: boolean };
  projectId?: number;
}

type FormValuesTypes = {
  title: string;
  remarks: string;
  projectId: number;
  authorityId: number;
  amount: number;
  transactionDate: Moment
  transactionReference: string;
  status: number;
  receipt: UploadProps;
  invoiceId: number
}

export const TransactionsModal = (props: TransactionsModalProps) => {
  const {
    openModal, onCancel, type, record, projectId, reloadTableData,
    permissions: { createTransaction, updateTransaction }
  } = props;
  const access_token = TokenService.getLocalAccessToken();
  const [form] = Form.useForm<FormValuesTypes>();

  const module = useMemo(() => new TransactionsModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const authorityModule = useMemo(() => new AuthoritiesModule(), []);
  const invoiceModule = useMemo(() => new InvoiceModule(), []);

  const { data: government } = useConditionFetchData<TransactionsType>({
    method: () => module.getRecordById(record),
    initialQuery: { onlyGovernmentFees: true },
    condition: type === "edit" && record !== 0
  })

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);

  // Authority Search Term
  // const [searchTermAuthority, setSearchTermAuthority] = useState("");
  // const debouncedSearchTermAuthority = useDebounce(searchTermAuthority, 500);

  // Invoice Search Term
  const [searchTermInvoice, setSearchTermInvoice] = useState("");
  const debouncedSearchTermInvoice = useDebounce(searchTermInvoice, 500);

  const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])
  const [authorityOptions, setAuthorityOptions] = useState<AuthoritiesType[]>([])
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceTypes[]>([])
  const [buttonLoading, setButtonLoading] = useState(false);

  const onFinish = (formValues: FormValuesTypes) => {
    setButtonLoading(true);
    const formData = new FormData();
    const transactionDate = formValues?.transactionDate?.toISOString();
    const receipt = formValues?.receipt?.fileList?.[0]?.originFileObj;

    const data = {
      ...formValues,
      transactionDate: transactionDate,
      receipt: receipt
    }

    Object.entries(data).forEach(([key, value]) => {
      const isFile = key === "receipt" && typeof value !== "string" && typeof value !== "number"
      if (!value) return
      if (key === "receipt" && isFile) {
        formData.append(key, value as RcFile)
      } else {
        formData.append(key, value as string);
      }
    })

    switch (type) {
      case "new": {
        if (createTransaction === true) {
          module.createRecord(formData).then((res) => {
            message.success(res?.data?.message || "Government fee created successfully");
            reloadTableData();
            onCancel();
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong, please try again later.");
          }).finally(() => {
            setButtonLoading(false);
          });
        } else {
          setButtonLoading(false);
          message.error("You don't have permission to create a new record");
        }
        break;
      }
      case "edit": {
        if (updateTransaction === true) {
          module.updateRecord(formData, record).then((res) => {
            reloadTableData();
            onCancel();
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong, please try again later.");
          }).finally(() => {
            setButtonLoading(false);
          });
        } else {
          message.error("You don't have permission to update this record");
        }
        break;
      }
      default: {
        setButtonLoading(false);
        break;
      }
    }
  };

  // Project Search
  const onProjectSearch = ({ title, ids }: { title?: string; ids?: number[] } = {}) => {
    projectModule.getAllRecords({ title: title, ids: ids }).then((res) => {
      const { data } = res?.data

      setProjectOptions((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage)
    })
  }

  // Authority Search
  const onAuthoritySearch = ({ title, id }: { title?: string; id?: number } = {}) => {
    authorityModule.publishedRecords({ title, id, perPage: 100 }).then((res) => {
      const { data } = res?.data

      setAuthorityOptions((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage)
    })
  }

  // Invoice Search
  const onInvoiceSearch = (props: { clientId?: number; invoiceNumber?: string, invoiceId?: number } = {}) => {
    const { clientId, invoiceNumber, invoiceId } = props
    invoiceModule.getAllRecords({ clientId, invoiceNumber, id: invoiceId }).then((res) => {
      const { data } = res?.data
      setInvoiceOptions(data)
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage)
    })
  }

  // Project Search Request
  useEffect(() => {
    if (!debouncedSearchTermProject) return
    onProjectSearch({ title: debouncedSearchTermProject })
  }, [debouncedSearchTermProject])

  // // Authority Search Request
  // useEffect(() => {
  //   if (!debouncedSearchTermAuthority) return
  //   onAuthoritySearch({ title: debouncedSearchTermAuthority })
  // }, [debouncedSearchTermAuthority])

  // Invoice Search Request
  useEffect(() => {
    if (!debouncedSearchTermInvoice) return
    const projectId: number = form.getFieldValue("projectId")
    const project = projectOptions?.find((item) => item.id === projectId)
    onInvoiceSearch({
      invoiceNumber: debouncedSearchTermInvoice, clientId: project?.Client?.id
    })
  }, [debouncedSearchTermInvoice])

  // Get the default project and authority 
  useEffect(() => {
    if (!government) return
    const { authorityId, projectId, invoiceId } = government

    if (projectId) {
      onProjectSearch({ ids: [projectId] })
    }

    if (authorityId) {
      onAuthoritySearch({ id: authorityId })
    }

    if (invoiceId) {
      onInvoiceSearch({ invoiceId })
    }
  }, [government?.projectId, government?.authorityId])

  useEffect(() => {
    if (type === "edit" && government) {
      const {
        projectId, authorityId, transactionDate, transactionReference, amount, status, title, remarks,
      } = government

      form.setFieldsValue({
        projectId: projectId,
        authorityId: authorityId,
        title: title,
        remarks: remarks,
        transactionDate: moment(transactionDate),
        transactionReference: transactionReference,
        amount: amount,
        status: status,
        invoiceId: government?.Invoice?.id
      })
    } else {
      form.resetFields();
    }
  }, [type, government])

  // Set the default project if the project id is present in the url and the type is new
  useEffect(() => {
    if (type === "new" && projectId) {
      onProjectSearch({ ids: [projectId] })
      form.setFieldsValue({ projectId: projectId })
    }
  }, [projectId])

  useEffect(() => {
    onAuthoritySearch()
  }, [])

  return (
    <CustomModal
      visible={openModal} closable={true} onCancel={onCancel} showFooter={false}
      titleText={type === "edit" ? "Edit Government Fee" : "Add Government Fee"}
    >
      <Form className={styles.form} onFinish={onFinish} form={form}>
        {/** Project */}
        <div>
          <Form.Item
            name="projectId"
            rules={[{ required: true, message: "Please select a project" }]}
          >
            <SelectWithSearch
              label='Select Project'
              notFoundDescription="No projects found., Please search for projects."
              onSearch={(value) => setSearchTermProject(value)}
              options={projectOptions?.map((item) => ({
                label: `${item.referenceNumber} | ${item.title}`,
                value: item.id,
              }))}
              onChange={(value) => {
                form.setFieldsValue({ projectId: value, invoiceId: undefined })

                //search for invoices
                const project = projectOptions?.find((item) => item.id === value)
                onInvoiceSearch({ clientId: project?.Client?.id })
              }}
            />
          </Form.Item>
        </div>

        {/** Invoice */}
        <div>
          <Form.Item name="invoiceId"
            help={<small>
              If Invoice is attached, then the status is monitored by invoice status in Xero
            </small>}
          >
            <SelectWithSearch
              label='Select Invoice' asterisk={false}
              notFoundDescription="No invoices found., Please search for invoices."
              onSearch={(value) => setSearchTermInvoice(value)}
              options={invoiceOptions?.map((item) => ({
                label: item.invoiceNumber,
                value: item.id,
              }))}
              onChange={(value) => form.setFieldsValue({ invoiceId: value })}
            />
          </Form.Item>
        </div>

        {/** Authority */}
        <div>
          <Form.Item
            name="authorityId"
            rules={[{ required: true, message: "Please select a authority" }]}
          >
            <SelectWithSearch
              label='Select Authority'
              notFoundDescription="No authority found., Please search for authority."
              onSearch={() => { }}
              options={authorityOptions?.map((item) => ({
                label: item.title,
                value: item.id,
              }))}
              onChange={(value) => form.setFieldsValue({ authorityId: value })}
            />
          </Form.Item>
        </div>

        {/** Title */}
        <div>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please add a title" }]}
          >
            <CustomInput label="Title" asterisk size="w100" />
          </Form.Item>
        </div>

        {/** Remarks */}
        <div>
          <Form.Item name="remarks">
            <CustomTextArea label="Remarks" placeholder="Add remarks" />
          </Form.Item>
        </div>

        <div>
          <label
            style={{ width: "100%" }}
            className="d-flex flex-column font-size-sm color-dark-main"
          >
            <div className="d-flex justify-between">
              Transaction Date <span className="color-red-yp ml-1">*</span>
            </div>
            <Form.Item name="transactionDate" rules={[{ required: true, message: "Please add transaction date" }]}>
              <DatePicker style={{ width: "100%", border: "2px solid #d9d9d9", borderRadius: "4px", }} />
            </Form.Item>
          </label>
          <label
            style={{ width: "100%" }}
            className="d-flex flex-column font-size-sm color-dark-main"
          >
            <div className="d-flex justify-between">
              Amount <span className="color-red-yp ml-1">*</span>
            </div>
            <Form.Item name="amount" rules={[{ required: true, message: "Please add amount" }]}>
              <InputNumber
                placeholder="Add amount"
                style={{
                  width: "100%", border: "2px solid #d9d9d9", borderRadius: "4px",
                }}
              />
            </Form.Item>
          </label>
        </div>

        <div>
          {/** Transaction Reference */}
          <Form.Item name="transactionReference">
            <CustomInput label="Transaction Reference" size="w100" />
          </Form.Item>
          {/** Status */}
          <div>
            <Form.Item
              name="status"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <CustomSelect
                label="Status" asterisk
                options={TransactionStatusOptions?.map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
              />
            </Form.Item>
          </div>
        </div>

        <div>
          <ImageUploader
            name="receipt" title="Receipt" listType="picture-card"
            defaultFileList={((type === "edit" && government?.receipt) && [{
              uid: `${government?.id}`,
              name: government?.receipt,
              status: "done",
              url: `${PROTECTED_RESOURCE_BASE_URL}${government.receipt}?authKey=${access_token}`,
            }]) || []}
          />
        </div>


        <div className={styles.footer}>
          <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
            Cancel
          </CustomButton>
          <CustomButton
            type="primary" size="normal" fontSize="sm"
            htmlType="submit" loading={buttonLoading}
          >
            Submit
          </CustomButton>
        </div>
      </Form>
      {/* )} */}
    </CustomModal>
  );
};
