import { Button, Form, Input, Upload, message } from "antd";
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
import { DiaryPermissionsEnum } from "@modules/Diary/permissions";
import { ReimbursementModule } from "@modules/Reimbursement";
import { ReimbursementResponseObject } from "@modules/Reimbursement/types";
import { PlusOutlined, MinusCircleOutlined,UploadOutlined } from "@ant-design/icons";
import { ReimbursementPermissionsEnum } from "@modules/Reimbursement/permissions";

interface ReimbursementModalProps extends Omit<PropTypes, "type"> {
  permissions: { [key in ReimbursementPermissionsEnum]: boolean };
}

export const ReimbursementModal = (props: ReimbursementModalProps) => {
  const {
    openModal, onCancel,
    reloadTableData, permissions: {
      createReimbursement
    }
  } = props;
  const [form] = Form.useForm();
  const module = new ReimbursementModule()
  const [recordData, setRecordData] = useState<Partial<ReimbursementResponseObject>>();

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
  useEffect(() =>{
    form.resetFields()
  },[openModal])


  const onFinish = (formValues: any) => {
    // console.log(formValues)
    const formData = new FormData();
    formData.append("purpose", formValues["purpose"])

    formValues.reimbursementReceipts.forEach((receipt: {claimedAmount:string, title: string, file: any}, index:number) =>{
      if (
        receipt.file &&
        typeof receipt.file !== "string" &&
        receipt.file["fileList"].length > 0
      ) {
        formData.append("reimbursementReceipts["+index+"][file]", receipt.file["fileList"][0]["originFileObj"]);
        formData.append("reimbursementReceipts["+index+"][title]", receipt.title);
        formData.append("reimbursementReceipts["+index+"][claimedAmount]", receipt.claimedAmount);
      }
    })

    setRecordData({ ...recordData, buttonLoading: true });
    if (createReimbursement === true) {
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
      titleText={"Add New Reimbursement"}
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
          <Form.List
            name="reimbursementReceipts"
          >
            {(fields, { add, remove }, { errors }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {fields.map((field, index) => (
                  <div key={field.key} style={{ flexDirection: 'column', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--color-border)',
                      padding: '0.25rem 1rem'
                    }}>
                      <div style={{
                        fontSize: 'var(--font-size-md)',
                        fontWeight: 600,
                        color: 'var(--color-dark-main)',
                      }}>Receipt {index + 1}</div>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
                      <div style={{ width: 'calc(50% - 0.5rem)' }}>
                        <Form.Item name={[field.name, 'title']} rules={[{ required: true, message: "Please enter title.", }]}>
                          <CustomInput style={{ width: '100%' }} label={"Title"} asterisk type="text" placeHolder="Enter Title" />
                        </Form.Item>
                      </div>
                      <div style={{ width: 'calc(50% - 0.5rem)' }}>
                        <Form.Item name={[field.name, 'claimedAmount']} rules={[{ required: true, message: "Please enter claimed amount." }]}>
                          <CustomInput prefix={"AED"} style={{ width: '100%' }} label={"Claimed amount"} asterisk placeHolder="Enter claimed amount" />
                        </Form.Item>
                      </div>
                      <Form.Item  name={[field.name, 'file']} rules={[{ required: true, message: "Please add receipt.", }]}>
                      <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                      </Upload>
                    </Form.Item>
                    </div>
                   
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: '100%' }}
                  icon={<PlusOutlined />}
                >
                  Add receipt
                </Button>
                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>
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
              Add Reimbursement
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
