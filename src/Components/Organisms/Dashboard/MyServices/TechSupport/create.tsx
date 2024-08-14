import { Form, message } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  ImageUploader,
  SelectWithSearch,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { TaskModule } from "@modules/Task";
import { TaskResponseObject } from "@modules/Task/types";
import { TaskPermissionsEnum } from "@modules/Task/permissions";
import { useDebounce } from "@helpers/useDebounce";
import { UserTypes } from "@modules/User/types";
import { UserModule } from "@modules/User";

interface TechSupportModalProps extends Omit<PropTypes, "type"> {
  permissions: { [key in TaskPermissionsEnum]: boolean };
}

export const TechSupportModal = (props: TechSupportModalProps) => {
  const {
    openModal, onCancel,
    reloadTableData, permissions: { createTask }
  } = props;
  const [form] = Form.useForm();

  const module = useMemo(() => new TaskModule(), []);
  const userModule = useMemo(() => new UserModule(), []);

  const [recordData, setRecordData] = useState<Partial<TaskResponseObject>>();

  // User Search Term
  const [searchTermUser, setSearchTermUser] = useState("");
  const debouncedSearchTermUser = useDebounce(searchTermUser, 500);
  const [userOptions, setUserOptions] = useState<UserTypes[]>([])


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

  const onFinish = (formValues: {
    title: string,
    instructions: string,
    file: any
  }) => {
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
      module.createRecord({ ...formValues, type: 2 }).then((res) => {
        if (formData.get('files[]')) {
          formData.append("taskId", res.data.data.id)
          module.uploadFiles(formData).then(res => {
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

        if (reloadTableData) reloadTableData()
      }).catch((err) => {
        handleErrors(err);
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      });
    } else {
      setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      message.error("You don't have permission to create this record");
    }
  };

  // User Search
  const onUserSearch = (query: { name?: string } = {}) => {
    userModule.getAllRecords(query).then((res) => {
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

  // search for users or garren
  useEffect(() => {
    onUserSearch({ name: debouncedSearchTermUser || "Garren" })
  }, [debouncedSearchTermUser])

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Add New Tech Support"}
      showFooter={false}
    >
      {recordData?.loading ? (
        <Skeletons items={10} />
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
              <CustomInput size="w100" label={"Title"} asterisk type="textArea" placeHolder="Enter Title" />
            </Form.Item>
          </div>

          <div>
            {/** User */}
            <Form.Item
              name="assignedTo" rules={[{ required: true, message: "Please select a user" }]}
              help={<small>You can assign multiple users to a task</small>}
              style={{ marginBottom: 30 }}
            >
              <SelectWithSearch
                label='Assign to'
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
                size="w100"
                label={"Details"}
                type="textArea"
              />
            </Form.Item>
          </div>

          <div>
            <ImageUploader multiple name="file" required={false} />
          </div>
          <div className="d-flex justify-end mt-4">
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
              Add Request
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};