import { type FC, Dispatch, SetStateAction } from 'react';
import { Form, type FormInstance } from 'antd';
import { EditBasicInfoFormTypes, ProjectFormSteps } from '../types';
import EditProjectBodyWrap from '../EditProjectBodyWrap';
import {
  CustomButton, CustomInput, CustomSelect, SelectWithSearch
} from '@atoms/';
import { OrganizationType } from '@modules/Organization/types';
import { ProjectTypeType } from '@modules/ProjectType/types';
import { DepartmentType } from '@modules/Department/types';
import { ClientType } from '@modules/Client/types';
import Skeletons from '@organisms/Skeletons';
import { slugifyString } from '@helpers/common';
import styles from '../styles.module.scss';

interface BasicInfoTabProps {
  form: FormInstance<EditBasicInfoFormTypes>
  onFinish: (step: ProjectFormSteps.basic_info, values: EditBasicInfoFormTypes) => void
  options: {
    searchedClients: ClientType[]
    searchedClientsRep: ClientType[]
    organization: OrganizationType[]
    department: DepartmentType[]
    projectType: ProjectTypeType[]
  }
  searchTerms: {
    setSearchClient: Dispatch<SetStateAction<string>>
    setSearchClientRep: Dispatch<SetStateAction<string>>
  },
  loading: boolean
}

const headings = {
  heading: "Basic Informaton",
  subHeading: "Edit Basic Informaton",
  buttonText: "Save & Continue",
  description: "Please enter the basic informaton of the project.",
};

const BasicInfoTab: FC<BasicInfoTabProps> = ({ form, onFinish, options, searchTerms, loading }) => {
  const {
    searchedClients, searchedClientsRep, organization, projectType
  } = options
  const { setSearchClient, setSearchClientRep } = searchTerms

  return (
    <EditProjectBodyWrap headings={headings} showBackButton={false}>
      {loading ? <Skeletons items={3} /> : (
        <Form
          form={form} className={styles.form}
          onFinish={(values) => {
            const slug = slugifyString(values.title)
            const finalValues = { ...values, slug: slug }
            onFinish(ProjectFormSteps.basic_info, finalValues);
          }}
        >
          <div className={styles.formItems}>
            {/** Project Title */}
            <Form.Item
              name="title"
              rules={[
                {
                  required: true,
                  message: "Please enter the project name.",
                },
              ]}
            >
              <CustomInput
                label='Project Title'
                placeHolder="Project Title"
                size="w100"
                asterisk
              />
            </Form.Item>

            {/** Client */}
            <Form.Item name="clientId"
              help={
                <small>
                  Client cannot be modified once the project is created as it will affect invoices and quotations associated with this project.
                </small>
              }
              className={styles.clientId}
            >
              <SelectWithSearch
                label='Client'
                disabled
                onSearch={(value) => setSearchClient(value)}
                options={searchedClients?.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
                onChange={(value) => form.setFieldsValue({
                  clientId: value,
                  // Reset the client representative field when client is changed
                  clientRepresentativeId: undefined,
                })}
                asterisk={false}
              />
            </Form.Item>

            {/** Client Representative */}
            <Form.Item name="clientRepresentativeId">
              <SelectWithSearch
                label='Client Representative'
                asterisk={false}
                onSearch={(value) => setSearchClientRep(value)}
                options={searchedClientsRep?.map((item) => ({
                  label: item.name,
                  value: item.id
                }))}
              />
            </Form.Item>

            {/** Project Type */}
            <Form.Item
              name="projectTypeId"
              rules={[
                { required: true, message: "Please select a project type!" },
              ]}
            >
              <CustomSelect
                label='Project Type'
                asterisk
                options={projectType?.map((item) => ({
                  label: item.title,
                  value: item.id,
                }))}
              />
            </Form.Item>

            {/** Submission By */}
            {/** TODO: ask for the field to filter out the organization type */}
            <Form.Item
              name="submissionById"
              rules={[{ required: true, message: "Please select a submission by!" }]}
            >
              <CustomSelect
                label='Submission By'
                asterisk
                options={organization?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>

            {/** Department */}
            {/* <Form.Item
              name="departmentId"
              rules={[{ required: true, message: "Please select a department!" }]}
            >
              <CustomSelect
                label='Department'
                asterisk
                options={department?.map((item) => ({
                  label: item.title,
                  value: item.id
                }))}
              />
            </Form.Item> */}

            {/** Quote Number */}
            <Form.Item
              name="referenceNumber" style={{ marginBottom: 40 }}
              help={<small>Reference is created automatically from approved quotations.</small>}
            >
              <CustomInput
                label='Reference Number'
                placeHolder="Reference Number"
                size="w100"
                disabled
              />
            </Form.Item>

            {/** Xero Reference */}
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
          </div>

          <div className={styles.footer}>
            <CustomButton type="primary" size="normal" htmlType="submit">
              {headings?.buttonText}
            </CustomButton>
          </div>
        </Form>
      )}
    </EditProjectBodyWrap>
  );
}
export default BasicInfoTab;