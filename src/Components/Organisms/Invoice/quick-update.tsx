import { useState, type FC, useMemo, useEffect } from 'react';
import { Form, Modal, message } from 'antd';
import { SelectWithSearch } from '@atoms/';
import { handleError } from '@helpers/common';
import { useDebounce } from '@helpers/useDebounce';
import { ProjectModule } from '@modules/Project';
import { ProjectTypes } from '@modules/Project/types';
import { InvoiceModule } from '@modules/Invoice';

interface QuickUpdateProps {
  invoiceId: number
  open: boolean
  initialProjectId: number
  onClose: () => void
}

type FormValuesTypes = {
  projectId: number
}

const QuickUpdate: FC<QuickUpdateProps> = (props) => {
  const { open, onClose, invoiceId, initialProjectId } = props;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const module = useMemo(() => new InvoiceModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);

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
    module.quickUpdate(invoiceId, values).then((res) => {
      message.success("Invoice has been updated successfully.")
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
    if (initialProjectId !== 0) {
      onProjectSearch({ ids: [initialProjectId] })
      form.setFieldsValue({ projectId: initialProjectId })
    }
  }, [initialProjectId])

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
      </Form>
    </Modal>
  );
}
export default QuickUpdate