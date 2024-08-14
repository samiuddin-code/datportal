import { useState, type FC, useMemo, useEffect } from 'react';
import { CustomSelect, SelectWithSearch } from '@atoms/index';
import { handleError } from '@helpers/common';
import { useDebounce } from '@helpers/useDebounce';
import { OrganizationModule } from '@modules/Organization';
import { OrganizationType } from '@modules/Organization/types';
import { ProjectModule } from '@modules/Project';
import { ProjectTypes } from '@modules/Project/types';
import { Form, Modal, message } from 'antd';
import { useConditionFetchData } from 'hooks';
import { QuotationModule } from '@modules/Quotation';
import { ProjectTypeModule } from '@modules/ProjectType';
import { ProjectTypeType } from '@modules/ProjectType/types';

interface QuickUpdateProps {
  open: boolean
  quickUpdate: {
    quoteId: number
    initialProjectId: number
    initialSubmissionById: number
    initialProjectTypeId: number
  }
  onClose: () => void
}

type FormValuesTypes = {
  projectId: number,
  submissionById: number
}

const QuickUpdate: FC<QuickUpdateProps> = (props) => {
  const { open, onClose, quickUpdate } = props;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const module = useMemo(() => new QuotationModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);

  const { data: orgData } = useConditionFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
    condition: open
  })

  const { data: projectTypeData } = useConditionFetchData<ProjectTypeType[]>({
    method: projectTypeModule.getPublishRecords,
    condition: open,
    initialQuery: { perPage: 100 }
  })

  const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])

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

  const onFinish = (values: FormValuesTypes) => {
    setLoading(true)
    module.quickUpdate(quickUpdate?.quoteId, values).then((res) => {
      message.success("Quotation updated successfully!")
      onClose()
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage)
    }).finally(() => setLoading(false))
  };

  // Project Search Request
  useEffect(() => {
    if (!debouncedSearchTermProject) return
    onProjectSearch({ title: debouncedSearchTermProject })
  }, [debouncedSearchTermProject])

  // Initial Project Id
  useEffect(() => {
    if (quickUpdate?.initialProjectId !== 0) {
      onProjectSearch({ ids: [quickUpdate?.initialProjectId] })
      form.setFieldsValue({ projectId: quickUpdate?.initialProjectId })
    }
  }, [quickUpdate?.initialProjectId])

  return (
    <Modal
      open={open} onCancel={onClose} zIndex={10000} destroyOnClose
      title="Quick Update" okText="Update" cancelText="Cancel"
      okButtonProps={{
        htmlType: 'submit', form: 'quick-update-form', loading
      }}
    >
      {/** Project */}
      <Form onFinish={onFinish} form={form} name="quick-update-form">
        <Form.Item
          name="projectId"
          rules={[{ required: true, message: "Please select a project" }]}
        >
          <SelectWithSearch
            label='Select Project'
            notFoundDescription="No projects found., Please search for projects."
            onSearch={(value) => setSearchTermProject(value)}
            onChange={(value) => form.setFieldsValue({ projectId: value })}
            options={projectOptions?.map((item) => ({
              label: `${item.referenceNumber} | ${item.title}`,
              value: item.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="submissionById" initialValue={quickUpdate?.initialSubmissionById || undefined}
          rules={[{ required: true, message: "Please select a submission by!" }]}
        >
          <CustomSelect
            label='Submission By' asterisk
            options={orgData?.map((item) => ({
              label: item.name,
              value: item.id
            }))}
          />
        </Form.Item>

        <Form.Item
          name={"projectTypeId"} initialValue={quickUpdate?.initialProjectTypeId || undefined}
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
      </Form>
    </Modal>
  );
}
export default QuickUpdate