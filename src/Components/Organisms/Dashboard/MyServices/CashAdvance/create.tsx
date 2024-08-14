import { Form, message } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  ImageUploader
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { CashAdvanceModule } from "@modules/CashAdvance";
import { CashAdvanceResponseObject } from "@modules/CashAdvance/types";
import { CashAdvancePermissionsEnum } from "@modules/CashAdvance/permissions";

interface CashAdvanceModalProps extends Omit<PropTypes, "type"> {
  permissions: { [key in CashAdvancePermissionsEnum]: boolean };
}

export const CashAdvanceModal = (props: CashAdvanceModalProps) => {
  const {
    openModal, onCancel,
    reloadTableData, permissions: {
      createCashAdvance
    }
  } = props;
  const [form] = Form.useForm();
  const module = new CashAdvanceModule()
  const [recordData, setRecordData] = useState<Partial<CashAdvanceResponseObject>>();

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
    form.resetFields()
  }, [openModal])


  const onFinish = (formValues: any) => {
    setRecordData({ ...recordData, buttonLoading: true });
    const { files } = formValues
    const formData = new FormData();

    const excludeFields = ["files"];
    Object.entries(formValues).forEach((ele: any) => {
      if (!excludeFields.includes(ele[0])) {
        formData.append(ele[0], ele[1]);
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

    if (createCashAdvance === true) {
      module.createRecord(formData).then((res) => {
        reloadTableData();
        onCancel();
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
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
          <div>
            <Form.Item name={'requestAmount'} rules={[{ required: true, message: "Please enter request amount." }]}>
              <CustomInput prefix={"AED"} size="w100" label={"Request amount"} asterisk placeHolder="Enter request amount" />
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
