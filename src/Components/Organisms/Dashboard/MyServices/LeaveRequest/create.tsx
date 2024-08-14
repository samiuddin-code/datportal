import { Form, DatePicker, message, Select, Empty } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  ImageUploader,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useCallback, useEffect, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { LeaveRequestModule } from "@modules/LeaveRequest";
import { LeaveRequestResponseObject, LeaveRequestType } from "@modules/LeaveRequest/types";
import { LeaveRequestPermissionsEnum } from "@modules/LeaveRequest/permissions";
import { LeaveTypeType } from "@modules/LeaveType/types";
import { LeaveTypeModule } from "@modules/LeaveType";
const { RangePicker } = DatePicker;

interface LeaveRequestModalProps extends Omit<PropTypes, "type"> {
  permissions: { [key in LeaveRequestPermissionsEnum]: boolean };
}

type FormValueTypes = {
  purpose: string,
  typeOfLeave: LeaveRequestType["typeOfLeave"],
  leaveDates: [{ _d: Date }, { _d: Date }],
  files: any
}

export const LeaveRequestModal = (props: LeaveRequestModalProps) => {
  const {
    openModal, onCancel,
    reloadTableData, permissions: {
      createLeaveRequest
    }
  } = props;
  const [form] = Form.useForm();
  const module = new LeaveRequestModule();
  const [recordData, setRecordData] = useState<Partial<LeaveRequestResponseObject>>();

  const leaveTypeModule = new LeaveTypeModule()
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeType[]>([]);
  const fetchLeaveTypes = useCallback(() => {
    leaveTypeModule.getAllPublishedRecords({ perPage: 100 }).then((res) => {
      setLeaveTypes(res.data.data)
    }).catch((err) => {
      message.error(err.response.data.message)
    })
  }, [])

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
  useEffect(() => {
    form.resetFields();
    if (leaveTypes.length === 0) fetchLeaveTypes()
  }, [openModal])


  const onFinish = (formValues: FormValueTypes) => {
    setRecordData({ ...recordData, buttonLoading: true });
    const { files } = formValues;

    const formData = new FormData();
    const excludeFields = ["files"];
    Object.entries(formValues).forEach((ele: any) => {
      if (!excludeFields.includes(ele[0])) {
        if (ele[0] === "leaveDates") {
          formData.append("leaveFrom", formValues.leaveDates[0]._d.toISOString())
          formData.append("leaveTo", formValues.leaveDates[1]._d.toISOString())
        }
        else formData.append(ele[0], ele[1]);
      }
    });

    // add files to form data 
    const _files: File[] = files?.fileList?.map((file: any) => {
      return file.originFileObj
    });

    if (_files?.length) {
      for (let i = 0; i < _files.length; i++) {
        formData.append('files[]', _files[i]);
      }
    }

    if (createLeaveRequest === true) {
      module.createRecord(formData).then((res) => {
        reloadTableData();
        onCancel();
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
        form.resetFields()
      }).catch((err) => {
        handleErrors(err);
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      });
    } else {
      setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      message.error("You don't have permission to create this record");
    }
  };

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Add New Request"}
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
            <Form.Item name="purpose" rules={[{ required: true, message: "Please add a purpose" }]}>
              <CustomInput size="w100" label={"Purpose"} asterisk type="textArea" placeHolder="Enter Purpose" />
            </Form.Item>
          </div>

          <div style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)' }}>Leave dates
              <span style={{ color: 'var(--color-red-yp)' }}> *</span>
            </div>
            <Form.Item name={'leaveDates'} rules={[{ required: true, message: "Please enter leave dates." }]}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div>
            {/** typeOfLeave */}
            <Form.Item
              name="leaveTypeId"
              rules={[
                { required: true, message: "Please select a leave type" },
              ]}
            >
              <label className={"font-size-sm color-dark-main"}>
                Leave Type  <span className='color-red-yp'>*</span>
              </label>

              <Select
                allowClear
                style={{ width: "100%" }}
                defaultValue={recordData?.data?.leaveTypeId}
                placeholder="Search for the leave type"
                className="selectAntdCustom"
                onChange={(value) => form.setFieldsValue({ leaveTypeId: value })}
                showSearch
                onSearch={(value) => { }}
                optionFilterProp="label"
                options={leaveTypes?.map((item) => {
                  return {
                    label: item.title,
                    value: item.id,
                  }
                })}
                notFoundContent={
                  <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{
                      height: 100,
                    }}
                    description={
                      <span>
                        No data found, Please search for the leave type
                      </span>
                    }
                  />
                }
              />
            </Form.Item>
          </div>

          <div>
            <ImageUploader name="files" required={false} multiple />
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
