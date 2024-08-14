import { DatePicker, Form, UploadProps, message } from "antd";
import {
  CustomModal, CustomButton, CustomSelect, ImageUploader, SelectWithSearch, CustomInput,
} from "@atoms/";
import moment, { Moment } from "moment";
import styles from "../Common/styles.module.scss";
import { useEffect, useMemo, useState } from "react";
import { PropTypes } from "@organisms/Common/common-types";
import { PermitsPermissionsEnum } from "@modules/Permits/permissions";
import { PermitsModule } from "@modules/Permits";
import { useConditionFetchData } from "hooks";
import { PermitsType } from "@modules/Permits/types";
import { ProjectModule } from "@modules/Project";
import { useDebounce } from "@helpers/useDebounce";
import { ProjectTypes } from "@modules/Project/types";
import { AuthoritiesModule } from "@modules/Authorities";
import { AuthoritiesType } from "@modules/Authorities/types";
import { handleError } from "@helpers/common";
import { RcFile } from "antd/lib/upload";
import CustomTextArea from "@atoms/Input/textarea";
import { PROTECTED_RESOURCE_BASE_URL } from "@helpers/constants";
import TokenService from "@services/tokenService";
import { ClientStatusOptions, FinanceStatusOptions } from "@helpers/options";

interface PermitsModalProps extends PropTypes {
  record: number;
  permissions: { [key in PermitsPermissionsEnum]: boolean };
  projectId?: number;
}

type FormValuesTypes = {
  projectId: number;
  authorityId: number;
  title: string;
  remarks: string;
  expiryDate: Moment;
  approvedDate: Moment;
  financeStatus: number;
  clientStatus: number;
  files: UploadProps
}

export const PermitsModal = (props: PermitsModalProps) => {
  const { openModal, onCancel, type, record, projectId,
    reloadTableData, permissions: { createPermit, updatePermit }
  } = props;
  const access_token = TokenService.getLocalAccessToken();
  const [form] = Form.useForm<FormValuesTypes>();
  const module = useMemo(() => new PermitsModule(), []);

  const projectModule = useMemo(() => new ProjectModule(), []);
  const authorityModule = useMemo(() => new AuthoritiesModule(), []);

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);

  // Authority Search Term
  const [searchTermAuthority, setSearchTermAuthority] = useState("");
  const debouncedSearchTermAuthority = useDebounce(searchTermAuthority, 500);

  const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])
  const [authorityOptions, setAuthorityOptions] = useState<AuthoritiesType[]>([])

  const { data: permit } = useConditionFetchData<PermitsType>({
    method: () => module.getRecordById(record),
    condition: type === "edit" && record !== 0
  })
  const [buttonLoading, setButtonLoading] = useState(false);

  const onFinish = (formValues: FormValuesTypes) => {
    setButtonLoading(true);
    const formData = new FormData();

    const expiryDate = formValues?.expiryDate?.toISOString();
    const approvedDate = formValues?.approvedDate?.toISOString()
    const files = formValues?.files?.fileList?.map((item) => item?.originFileObj!)

    const data = {
      ...formValues,
      expiryDate: expiryDate,
      approvedDate: approvedDate,
      files: files
    }

    Object.entries(data).forEach(([key, value]) => {
      const isFile = key === "files" && typeof value !== "string" && typeof value !== "number"
      if (!value) return
      if (key === "files" && isFile) {
        (value as unknown as RcFile[]).forEach((item) => {
          if (!item) return
          formData.append("files[]", item);
        })
      } else {
        formData.append(key, value as string);
      }
    })

    switch (type) {
      case "new": {
        if (createPermit === true) {
          module.createRecord(formData).then((res) => {
            message.success(res?.data?.message || "Permit created successfully");
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
        if (updatePermit === true) {
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

  useEffect(() => {
    if (type === "edit" && permit) {
      const {
        projectId, authorityId, expiryDate, approvedDate,
        financeStatus, clientStatus, title, remarks
      } = permit

      form.setFieldsValue({
        projectId: projectId,
        authorityId: authorityId,
        title: title,
        remarks: remarks,
        expiryDate: moment(expiryDate),
        approvedDate: moment(approvedDate),
        financeStatus: financeStatus,
        clientStatus: clientStatus,
      })
    } else {
      form.resetFields();
    }
  }, [type, permit])

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


  // Get the default project and authority 
  useEffect(() => {
    if (!permit) return
    const { authorityId, projectId } = permit

    if (projectId) {
      onProjectSearch({ ids: [projectId] })
    }

    if (authorityId) {
      onAuthoritySearch({ id: authorityId })
    }
  }, [permit?.projectId, permit?.authorityId])

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
      titleText={type === "edit" ? "Edit Permit" : "Add New Permit"}
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
              onChange={(value) => form.setFieldsValue({ projectId: value })}
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
              onSearch={(value) => setSearchTermAuthority(value)}
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
            Approved Date
            <Form.Item name="approvedDate" rules={[{ required: true, message: "Please add approved date" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </label>
          <label
            style={{ width: "100%" }}
            className="d-flex flex-column font-size-sm color-dark-main"
          >
            Expiry Date
            <Form.Item name="expiryDate" rules={[{ required: true, message: "Please add expiry date" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </label>
        </div>

        <div>
          <Form.Item
            name="financeStatus"
            rules={[{ required: true, message: "Please select a finance status" }]}
          >
            <CustomSelect
              label={"Finance Status"} asterisk
              options={FinanceStatusOptions.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="clientStatus"
            rules={[{ required: true, message: "Please select a client status" }]}
          >
            <CustomSelect
              label={"Client Status"} asterisk
              options={ClientStatusOptions.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </Form.Item>
        </div>

        <div>
          <ImageUploader
            name="files" title="File" required={type === "new" ? true : false}
            multiple listType="picture-card"
            defaultFileList={((type === "edit" && permit?.Resources) && permit?.Resources?.map((item) => ({
              uid: `${item?.id}`,
              name: item?.path,
              status: "done",
              url: `${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`,
            }))) || []}
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
    </CustomModal>
  );
};
