import { Form, Radio, DatePicker, message, RadioChangeEvent } from "antd";
import {
  CustomInput, CustomModal, CustomErrorAlert,
  CustomButton, SelectWithSearch, ImageUploader
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { TaskModule } from "../../../../Modules/Task";
import { TaskResponseObject } from "../../../../Modules/Task/types";
import { TaskPermissionsEnum } from "../../../../Modules/Task/permissions";
import { ProjectModule } from "../../../../Modules/Project";
import { ProjectTypes } from "../../../../Modules/Project/types";
import { UserModule } from "../../../../Modules/User";
import { UserTypes } from "../../../../Modules/User/types";
import moment from "moment";
import { useDebounce } from "../../../../helpers/useDebounce";
const { RangePicker } = DatePicker;

interface TaskModalProps {
  openModal: boolean;
  permissions: { [key in TaskPermissionsEnum]: boolean };
  onCancel: () => void;
  onUpdate?: () => void;
}

type DeadlineDatesTypes = {
  taskStartFrom: string,
  taskEndOn: string
}

type FormValuesTypes = {
  title: string,
  projectId: number,
  assignedTo: number[],
  instructions: string,
  /** Deadline is optional because it will be deleted from the form values */
  deadline?: number,
  priority: number,
  file: any
}

export const TaskModal = (props: TaskModalProps) => {
  const {
    openModal, onCancel, permissions: { createTask }
  } = props;
  const [form] = Form.useForm();
  const module = new TaskModule()
  const [recordData, setRecordData] = useState<Partial<TaskResponseObject>>();
  const [deadline, setDeadline] = useState<number>(0);
  const [deadlineDates, setDeadlineDates] = useState<DeadlineDatesTypes>({
    taskStartFrom: "",
    taskEndOn: ""
  })
  const deadlineOptions = [
    { label: 'Today', value: 0 },
    { label: 'Tomorrow', value: 1 },
    { label: 'Custom', value: 2 },
  ];
  const priorityOptions = [
    { label: 'High', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Normal', value: 3 },
  ];
  const projectModule = useMemo(() => new ProjectModule(), []);
  const userModule = useMemo(() => new UserModule(), []);

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);
  const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])
  // User Search Term
  const [searchTermUser, setSearchTermUser] = useState("");
  const debouncedSearchTermUser = useDebounce(searchTermUser, 500);
  const [userOptions, setUserOptions] = useState<UserTypes[]>([])

  // Project Search
  const onProjectSearch = () => {
    if (debouncedSearchTermProject) {
      projectModule.getAllRecords({ title: debouncedSearchTermProject }).then((res) => {

        const { data } = res;

        setProjectOptions((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.data?.filter((item) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }

  useEffect(() => {
    onProjectSearch()
  }, [debouncedSearchTermProject])


  // User Search
  const onUserSearch = () => {
    if (debouncedSearchTermUser) {
      userModule.getAllRecords({ name: debouncedSearchTermUser }).then((res) => {
        const { data } = res;

        setUserOptions((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.data?.filter((item) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }

  useEffect(() => {
    onUserSearch()
  }, [debouncedSearchTermUser])

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

  const handleAlertClose = () => {
    setRecordData({ ...recordData, error: "" });
  };

  const onFinish = (formValues: FormValuesTypes) => {
    let taskStartFrom = "";
    let taskEndOn = "";
    if (formValues.deadline === 0) {
      taskStartFrom = (new Date()).toISOString();
      taskEndOn = (new Date()).toISOString();
    } else if (formValues.deadline === 1) {
      taskStartFrom = (new Date()).toISOString();
      taskEndOn = moment(new Date()).add(1, "d").toISOString();
    } else if (formValues.deadline === 2) {
      taskStartFrom = deadlineDates.taskStartFrom;
      taskEndOn = deadlineDates.taskEndOn;
    }
    delete formValues.deadline;
    const formData = new FormData();
    const excludeFields = ["file"];
    Object.entries(formValues).forEach((ele: any) => {
      if (!excludeFields.includes(ele[0])) {
        formData.append(ele[0], ele[1]);
      }
    });

    if (
      formValues["file"] &&
      typeof formValues["file"] !== "string" &&
      formValues["file"]["fileList"].length > 0
    ) {
      // add attachments to form data 
      const files: File[] = formValues["file"]?.fileList?.map((file: any) => {
        return file.originFileObj
      });

      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files[]', files[i]);
        }
      }
    }

    // remove the file from the form values
    delete formValues["file"];

    setRecordData({ ...recordData, buttonLoading: true });
    if (createTask === true) {
      module.createRecord({ ...formValues, taskStartFrom, taskEndOn }).then((res) => {
        if (formData.get('files[]')) {
          formData.append("taskId", res.data.data.id)
          module.uploadFiles(formData)
            .then(res => {
              message.success(res.data.message);
              onCancel();
              setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            }).catch((err) => {
              module.deleteRecord(res.data.data.id)
              handleErrors(err);
              setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
        } else {
          message.success(res.data.message);
          onCancel();
          setRecordData((prev) => ({ ...prev, buttonLoading: false }));
        }

        if (props.onUpdate) props.onUpdate()
      }).catch((err) => {
        handleErrors(err);
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      });
    } else {
      setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      message.error("You don't have permission to create this record");
    }
  };

  const handleDeadline = ({ target: { value } }: RadioChangeEvent) => {
    setDeadline(value)
  }

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Add New Task"}
      showFooter={false}
    >
      {recordData?.loading ? (
        <Skeletons items={4} />
      ) : (
        <Form className={styles.form} onFinish={onFinish} form={form}>
          {recordData?.error && (
            <CustomErrorAlert
              description={recordData?.error}
              isClosable
              onClose={handleAlertClose}
            />
          )}

          <div>
            <Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
              <CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter Task title" />
            </Form.Item>
          </div>

          {/** Project */}
          <div>
            <Form.Item name="projectId">
              <SelectWithSearch
                asterisk={false}
                label='Select Project'
                notFoundDescription="No projects found., Please search for projects."
                onSearch={(value) => setSearchTermProject(value)}
                options={projectOptions?.map((item) => ({
                  label: `${item.referenceNumber} | ${item.title}`,
                  value: item.id,
                }))}
                onChange={(projectId) => form.setFieldsValue({ projectId })}
              />
            </Form.Item>
          </div>

          <div>
            {/** User */}
            <Form.Item
              name="assignedTo"
              help={<small>You can assign multiple users to a task</small>}
              style={{ marginBottom: 30 }}
            >
              <SelectWithSearch
                label='Select User'
                placeholder="Search for user to assign task"
                mode="multiple" asterisk={false}
                notFoundDescription='No users found., Please search for a user'
                onSearch={(value) => setSearchTermUser(value)}
                options={userOptions?.map((item) => ({
                  label: `${item.firstName} ${item.lastName}`,
                  value: item.id
                }))}
              />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="instructions">
              <CustomInput
                size="w100" type="textArea"
                label={"More Instructions for the task"}
              />
            </Form.Item>
          </div>

          <div style={{ flexDirection: 'column', fontSize: 'var(--font-size-sm)', gap: 0 }}>
            <div>Deadline</div>
            <Form.Item name="deadline" rules={[{ required: true, message: "Please select deadline" }]}>
              <Radio.Group
                onChange={handleDeadline}
                options={deadlineOptions}
                optionType="button"
              />
            </Form.Item>

            {(deadline === 2) && <div >
              <RangePicker
                onChange={date => {
                  if (date?.length === 2) {
                    setDeadlineDates({
                      taskStartFrom: date[0]?.toISOString() || "",
                      taskEndOn: date[1]?.toISOString() || ""
                    })
                  }
                }}
              />
            </div>}
          </div>

          <div style={{ flexDirection: 'column', fontSize: 'var(--font-size-sm)', gap: 0, marginTop: 10 }}>
            <div>Priority</div>
            <Form.Item name="priority">
              <Radio.Group options={priorityOptions} optionType="button" />
            </Form.Item>
          </div>
          <div>
            <ImageUploader multiple name="file" />
          </div>
          <div className="d-flex justify-end">
            <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
              Cancel
            </CustomButton>
            <CustomButton
              type="primary"
              size="normal"
              fontSize="sm"
              htmlType="submit"
              loading={recordData?.buttonLoading}
            >
              Add Task
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
