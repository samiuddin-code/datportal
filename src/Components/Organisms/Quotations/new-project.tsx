import {
  useMemo, type Dispatch, type FC, type SetStateAction, useState
} from 'react';
import { Form, Modal, Radio, DatePicker, message } from 'antd';
import CustomInput from '@atoms/Input';
import CustomSelect from '@atoms/Select';
import { OrganizationModule } from '@modules/Organization';
import { OrganizationType } from '@modules/Organization/types';
import { AutoCreateFromApprovedQuotationTypes } from '@modules/Project/types';
import { useConditionFetchData } from 'hooks';
import styles from "./styles.module.scss";
import CustomTextArea from '@atoms/Input/textarea';
import moment from 'moment';
import { QuotationModule } from '@modules/Quotation';
import { handleError } from '@helpers/common';
import { QuotationPermissionsEnum } from '@modules/Quotation/permissions';
import { ProjectTypeModule } from '@modules/ProjectType';
import { ProjectTypeType } from '@modules/ProjectType/types';

const { RangePicker } = DatePicker;

type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  submissionById: number
  projectTypeId: number
  loading: boolean
}

type PermissionsType = { [key in QuotationPermissionsEnum]: boolean }

interface NewProjectProps {
  /** The state of the modal for creating project from quotation */
  setNewProject: Dispatch<SetStateAction<NewProjectModalTypes>>
  newProject: NewProjectModalTypes
  permissions: PermissionsType
  onRefresh: <QueryType = any>(query?: QueryType) => void;
}

type DeadlineTypes = {
  deadlineValue?: "7_days" | "15_days" | "30_days" | "45_days" | "90_days" | "custom"
  rangePicker?: [moment.Moment, moment.Moment];
}

type DeadlineOptionsTypes = {
  label: string
  value: DeadlineTypes['deadlineValue']
}

type DeadlineDatesTypes = {
  startDate: string
  endDate: string
}

type CreateProjectFormTypes = AutoCreateFromApprovedQuotationTypes & DeadlineTypes;

const deadlineOptions: DeadlineOptionsTypes[] = [
  { label: '7 days', value: "7_days" },
  { label: '15 days', value: "15_days" },
  { label: '30 days', value: "30_days" },
  { label: '45 days', value: "45_days" },
  { label: '90 days', value: "90_days" },
  { label: 'Custom', value: "custom" },
];

/* Create Project Modal */
const NewProject: FC<NewProjectProps> = (props) => {
  const {
    setNewProject, newProject, onRefresh, permissions
  } = props;
  const { updateQuotation } = permissions;

  const [form] = Form.useForm<CreateProjectFormTypes>();

  const orgModule = useMemo(() => new OrganizationModule(), []);
  const module = useMemo(() => new QuotationModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);

  const [deadline, setDeadline] = useState<DeadlineTypes['deadlineValue']>()
  const [deadlineDates, setDeadlineDates] = useState<DeadlineDatesTypes>({
    startDate: "", endDate: ""
  })

  const { data: orgData } = useConditionFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
    condition: newProject?.isOpen
  })

  const { data: projectTypeData } = useConditionFetchData<ProjectTypeType[]>({
    method: projectTypeModule.getPublishRecords,
    condition: newProject?.isOpen,
    initialQuery: { perPage: 100 }
  })

  const onFinish = (values: CreateProjectFormTypes) => {
    setNewProject((prev) => ({ ...prev, loading: true }));

    const date = new Date()
    let startDate = moment(date).format("YYYY-MM-DD");
    let endDate = "";

    switch (values.deadlineValue) {
      case "7_days": {
        endDate = moment(date).add(7, "days").format("YYYY-MM-DD");
        break;
      }
      case "15_days": {
        endDate = moment(date).add(15, "days").format("YYYY-MM-DD");
        break;
      }
      case "30_days": {
        endDate = moment(date).add(30, "days").format("YYYY-MM-DD");
        break;
      }
      case "45_days": {
        endDate = moment(date).add(45, "days").format("YYYY-MM-DD");
        break;
      }
      case "90_days": {
        endDate = moment(date).add(90, "days").format("YYYY-MM-DD");
        break;
      }
      case "custom": {
        startDate = deadlineDates.startDate;
        endDate = deadlineDates.endDate;
      }
    }

    delete values.deadlineValue;
    delete values.rangePicker;

    const finalValues = {
      ...values,
      quoteId: newProject?.quoteId!,
      startDate, endDate,
    };

    if (updateQuotation === true) {
      module.autoCreateFromApprovedQuotation(finalValues).then((res) => {
        message.success(res?.data?.message || "Project created successfully");

        onRefresh();
        setNewProject((prev) => ({ ...prev, isOpen: false }));
      }).catch((err) => {
        const errMessage = handleError(err)
        message.error(errMessage || "Something went wrong");
      }).finally(() => {
        setNewProject((prev) => ({ ...prev, loading: false }));
      })
    } else {
      message.error("You don't have permission to create project, please contact your admin");
    }
  }

  return (
    <Modal
      title="Create Project" open={newProject?.isOpen}
      okText="Create" cancelText="Cancel" destroyOnClose
      okButtonProps={{ loading: newProject?.loading }}
      onOk={() => form.submit()} zIndex={10000}
      onCancel={() => {
        setNewProject({
          isOpen: false, quoteId: 0, loading: false,
          submissionById: 0, projectTypeId: 0
        })
      }}
      // Prevent modal from opening the drawer when clicked inside modal
      wrapProps={{ onClick: (e: MouseEvent) => e.stopPropagation() }}
    >
      <Form form={form} onFinish={onFinish} name="create-project-form">
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input project title!' }]}
        >
          <CustomInput
            type='text' placeHolder='Enter project title'
            label={"Project Title"} size="w100"
            asterisk autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="submissionById" initialValue={newProject?.submissionById || undefined}
        >
          <CustomSelect
            disabled={newProject?.submissionById ? true: false}
            label='Submission By'
            options={orgData?.map((item) => ({
              label: item.name,
              value: item.id
            }))}
          />
        </Form.Item>

        <Form.Item
          name={"projectTypeId"} initialValue={newProject?.projectTypeId || undefined}
          rules={[{ required: true, message: "Please select project type" }]}
        >
          <CustomSelect
            label="Project Type" asterisk
            placeholder="Select Project Type"
            options={projectTypeData?.map((item) => {
              return { value: item.id, label: item.title }
            })}
          />
        </Form.Item>

        {/** Deadline */}
        <label className={"font-size-sm"}>
          Deadline  <span className='color-red-yp'>*</span>
        </label>
        <div style={{ flexDirection: 'column', fontSize: 'var(--font-size-sm)', gap: 0 }}>
          <Form.Item name="deadlineValue" rules={[{ required: true, message: "Please select deadline" }]}>
            <Radio.Group
              optionType="button"
              onChange={({ target }) => setDeadline(target.value)}
            >
              {deadlineOptions.map((item, index) => (
                <Radio.Button value={item.value} key={index}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          {deadline === "custom" && (
            <Form.Item name="rangePicker" rules={[{ required: true, message: "Please select deadline" }]}>
              <RangePicker
                onChange={date => {
                  if (date?.length === 2) {
                    setDeadlineDates({
                      startDate: date[0]?.format("YYYY-MM-DD") || "",
                      endDate: date[1]?.format("YYYY-MM-DD") || ""
                    })
                  }
                }}
                dropdownClassName={styles.date_picker_dropdown}
              />
            </Form.Item>
          )}
        </div>

        <Form.Item name="instructions">
          <CustomTextArea
            placeholder='Enter instructions' label={"Instructions"}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="xeroReference"
          help={
            <small className='color-yellow-dark'>
              CAUTION: Do not add XERO reference if you are not sure about it.
            </small>
          }
        >
          <CustomInput
            type='text' placeHolder='Enter Project Xero Reference'
            label={"Project Xero Reference"} size="w100"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
export default NewProject;