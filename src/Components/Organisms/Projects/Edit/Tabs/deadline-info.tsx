import { useState, type Dispatch, type FC, type SetStateAction, useCallback, useEffect } from 'react';
import { type FormInstance, Form, DatePicker, Radio, RadioChangeEvent, Popconfirm } from 'antd';
import { EditDeadlineInfoFormTypes, ProjectFormSteps } from '../types';
import EditProjectBodyWrap from '../EditProjectBodyWrap';
import { CustomButton, CustomInput, SelectWithSearch } from '../../../../Atoms';
import { PriorityEnum } from '../../../../../helpers/commonEnums';
import styles from '../styles.module.scss';
import { UserTypes } from '../../../../../Modules/User/types';
import moment from 'moment';
import { PlusCircleIcon, DeleteIcon } from '@icons/';
import CustomTextArea from '@atoms/Input/textarea';

const { RangePicker } = DatePicker;

interface DeadlineInfoTabProps {
  form: FormInstance<EditDeadlineInfoFormTypes>
  onFinish: (step: ProjectFormSteps.deadline_info, values: EditDeadlineInfoFormTypes) => void
  onBackClick: () => void
  options: {
    searchedProjectIncharge: UserTypes[]
    searchedSupportEngineers: UserTypes[]
  }
  searchTerms: {
    setSearchProjectIncharge: Dispatch<SetStateAction<string>>
    setSearchSupportEngineers: Dispatch<SetStateAction<string>>
  }
  states: {
    projectFileLinks: { name?: string, link: string }[]
    setProjectFileLinks: Dispatch<SetStateAction<{ name?: string, link: string }[]>>
  }
}

type DeadlineDatesTypes = {
  startDate: string
  endDate: string
}

type DeadlineOptionsTypes = {
  label: string
  value: EditDeadlineInfoFormTypes['deadlineValue']
}

type PriorityOptionsTypes = {
  label: string
  value: PriorityEnum
}

const headings = {
  heading: "Deadlines and Priority",
  subHeading: "Edit Deadlines and Priority",
  buttonText: "Submit",
  description: "Please enter the deadlines and priority.",
};

const deadlineOptions: DeadlineOptionsTypes[] = [
  { label: '7 days', value: "7_days" },
  { label: '15 days', value: "15_days" },
  { label: '30 days', value: "30_days" },
  { label: '45 days', value: "45_days" },
  { label: '90 days', value: "90_days" },
  { label: 'Custom', value: "custom" },
];

const priorityOptions: PriorityOptionsTypes[] = [
  { label: 'High', value: PriorityEnum.High },
  { label: 'Medium', value: PriorityEnum.Medium },
  { label: 'Normal', value: PriorityEnum.Normal },
];

const DeadlineInfoTab: FC<DeadlineInfoTabProps> = (props) => {
  const { form, onFinish, onBackClick, options, searchTerms, states } = props
  const { searchedProjectIncharge, searchedSupportEngineers } = options
  const { projectFileLinks, setProjectFileLinks } = states
  const { setSearchProjectIncharge, setSearchSupportEngineers } = searchTerms

  const projectLinkActions = useCallback((link: string, action: 'add' | 'remove', linkName?: string) => {
    switch (action) {
      case 'add': {
        // if the link is already present in the array, then don't add it
        let existingLink = projectFileLinks.find((ele) => ele.link === link)
        if (existingLink) return

        const allLinks = [...projectFileLinks, { name: linkName, link: link }]
        setProjectFileLinks(allLinks)
        form.setFieldsValue({ projectFilesLink: '', projectFilesLinkName: '' })
        break;
      }
      case 'remove': {
        const removeLink = projectFileLinks.filter((item) => item.link !== link)
        setProjectFileLinks(removeLink)
        break;
      }
    }
  }, [projectFileLinks])

  const [deadline, setDeadline] = useState<EditDeadlineInfoFormTypes['deadlineValue']>()
  const [deadlineDates, setDeadlineDates] = useState<DeadlineDatesTypes>({
    startDate: "", endDate: ""
  })

  const onFinalSubmit = (values: EditDeadlineInfoFormTypes) => {
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

    if (form.getFieldValue('projectFilesLink') !== '') {
      projectLinkActions(values.projectFilesLink, 'add');
    }

    let _fileLinks = "";
    try {
      _fileLinks = JSON.stringify(projectFileLinks);
    } catch (err: any) {
      console.error("Some error while parsing links", err?.message);
    }

    const finalValues: EditDeadlineInfoFormTypes = {
      ...values,
      projectFilesLink: _fileLinks,
      priority: values.priority || PriorityEnum.Normal,
      startDate, endDate
    }

    onFinish(ProjectFormSteps.deadline_info, finalValues);
  }

  // Prepare the deadline value and set the deadline value in the form
  useEffect(() => {
    const startDate = form.getFieldValue('startDate')
    const endDate = form.getFieldValue('endDate')

    // find out if the deadline is custom or not and set the deadline value accordingly
    const _deadline = deadlineOptions.find((item) => {
      switch (item.value) {
        case "7_days": {
          return moment(startDate).add(7, "days").toISOString() === endDate
        }
        case "15_days": {
          return moment(startDate).add(15, "days").toISOString() === endDate
        }
        case "30_days": {
          return moment(startDate).add(30, "days").toISOString() === endDate
        }
        case "45_days": {
          return moment(startDate).add(45, "days").toISOString() === endDate
        }
        case "90_days": {
          return moment(startDate).add(90, "days").toISOString() === endDate
        }
        case "custom": {
          return true
        }
      }
    })

    if (_deadline) {
      setDeadline(_deadline.value)
      form.setFieldsValue({ deadlineValue: _deadline.value })
    }
    if (_deadline?.value === 'custom') {
      form.setFieldsValue({ rangePicker: [moment(startDate), moment(endDate)] })
      setDeadlineDates({ startDate, endDate })
    }
  }, [])

  return (
    <EditProjectBodyWrap headings={headings} onBackClick={onBackClick}>
      <Form
        form={form} className={styles.form}
        onFinish={(values) => onFinalSubmit(values)}
      >
        <div className={styles.formItems}>
          {/** Deadline */}
          <label className={"font-size-sm"}>
            Deadline  <span className='color-red-yp'>*</span>
          </label>
          <div style={{ flexDirection: 'column', fontSize: 'var(--font-size-sm)', gap: 0 }}>
            <Form.Item name="deadlineValue" rules={[{ required: true, message: "Please select deadline" }]}>
              <Radio.Group
                optionType="button"
                onChange={(event: RadioChangeEvent) => setDeadline(event.target.value)}
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
                />
              </Form.Item>
            )}
          </div>

          {/** Priority */}
          <div style={{ flexDirection: 'column', fontSize: 'var(--font-size-sm)', gap: 0, marginTop: 10 }}>
            <div>Priority</div>
            <Form.Item name="priority">
              <Radio.Group optionType="button">
                {priorityOptions.map((item, index) => (
                  <Radio.Button value={item.value} key={index}>
                    {item.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>

          {/** Project Incharge */}
          <Form.Item name="projectInchargeId">
            <SelectWithSearch
              label='Who is incharge of this project?'
              placeholder="Search for who is incharge of this project"
              notFoundDescription='Could not find any user with this name, Please search for another user.'
              onSearch={(value) => setSearchProjectIncharge(value)}
              options={searchedProjectIncharge?.map((item) => ({
                label: `${item.firstName} ${item.lastName}`,
                value: item.id
              }))}
              asterisk={false}
            />
          </Form.Item>

          {/** Support Engineers */}
          <Form.Item name="supportEngineersId">
            <SelectWithSearch
              label='Who are the support engineers? (Optional)'
              placeholder="Search for support engineers"
              mode="multiple" asterisk={false}
              notFoundDescription='No support engineers found., Please search for support engineers.'
              onSearch={(value) => setSearchSupportEngineers(value)}
              options={searchedSupportEngineers?.map((item) => ({
                label: `${item.firstName} ${item.lastName}`,
                value: item.id
              }))}
            />
          </Form.Item>

          {/** More Instructions */}
          <Form.Item name={"instructions"}>
            <CustomTextArea
              label='More Instructions for Engineers (Optional)'
              placeholder='Are there any more instructions for engineers?'
            />
          </Form.Item>

          {/** Project files link */}
          <div className={styles.linkFormContainer}>
            <Form.Item
              style={{ width: '50%', marginTop: 10 }}
              name="projectFilesLinkName"
            >
              {/* <CustomInput label={"Link Name"}
            style={{ fontSize: "var(--font-size-normal)" }}
            size='w100'
            placeHolder='Name of the link' /> */}
              <CustomInput
                label='Link Name'
                placeHolder="Name of the link"
                className={styles.projectFilesLinkName}
                size='w100'
              />
            </Form.Item>
            <Form.Item
              name="projectFilesLink"
              rules={[
                {
                  required: projectFileLinks?.length === 0 ? true : false,
                  message: "Please add at least one link."
                },
                { type: 'url', message: "Please enter a valid url." },

                () => ({
                  validator(_, value) {
                    if (!value || !projectFileLinks?.includes(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('This link is already added.'));
                  },
                }),
              ]}
              style={{ marginTop: 10, width: "50%" }}
            >
              <CustomInput
                label='Project Files Link'
                placeHolder="Add project file link"
                size='w100'
                suffix={
                  <PlusCircleIcon
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const enteredLink = form.getFieldValue('projectFilesLink');
                      const linkName = form.getFieldValue('projectFilesLinkName');
                      projectLinkActions(enteredLink, 'add', linkName);
                    }}
                  />
                }
              />
            </Form.Item>
          </div>

          {/** Project files link list */}
          <div className={styles.projectFileLinks}>
            {projectFileLinks?.map((link, index) => (
              <div
                key={`${link}-${index}`}
                className={styles.projectFileLink}
              >
                <a href={link.link} target="_blank" rel="noreferrer">
                  {(link.name) ? link.name : link.link}
                </a>
                <Popconfirm
                  title="Are you sure to delete this link?"
                  okText="Yes" cancelText="No" placement='left'
                  onConfirm={() => projectLinkActions(link.link, 'remove')}
                >
                  <DeleteIcon className={styles.projectFileLink__deleteIcon} />
                </Popconfirm>
              </div>
            ))}
          </div>

          {/** Published */}
          {/* <Form.Item name="isPublished">
            <CustomSelect
              label={"Published"}
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
            />
          </Form.Item> */}

          <div className={styles.footer}>
            <img
              src="/images/west.svg" alt="Back"
              onClick={onBackClick}
            />
            <CustomButton type="primary" size="normal" htmlType="submit">
              {headings?.buttonText}
            </CustomButton>
          </div>
        </div>
      </Form>
    </EditProjectBodyWrap>
  );
}
export default DeadlineInfoTab;