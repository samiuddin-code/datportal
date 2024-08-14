import { Form, InputNumber, message } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  CustomSelect,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { TaxRateResponseObject, TaxRateType } from "../../../../Modules/TaxRate/types";
import { PropTypes } from "../../Common/common-types";
import { TaxRatePermissionsEnum } from "../../../../Modules/TaxRate/permissions";
import { TaxRateModule } from "../../../../Modules/TaxRate";
import { CountryModule } from "@modules/Country";


interface TaxRateModalProps extends PropTypes {
  record: number;
  permissions: { [key in TaxRatePermissionsEnum]: boolean };
  /** Callback function passed to the modal to get the id of the newly created record
   * @param value - id of the newly created record
   */
  callback?: (value: number) => void;
}

export const TaxRateModal = (props: TaxRateModalProps) => {
  const {
    openModal, onCancel, type, record,
    reloadTableData, permissions: { createTaxRate, updateTaxRate },
    callback
  } = props;
  const [form] = Form.useForm();
  const module = new TaxRateModule();
  const countryModule = useMemo(() => new CountryModule(), []);
  const [recordData, setRecordData] = useState<Partial<TaxRateResponseObject>>();


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

  const getDataBySlug = useCallback(() => {
    module.getRecordById(record).then((res) => {
      if (res.data && res.data.data) {
        form.setFieldsValue({
          ...res.data.data,
        });
        setRecordData({ ...res.data, loading: false });

      }
    }).catch((err) => {
      handleErrors(err);
    });
  }, [form, record, module]);

  useEffect(() => {
    if (type === "edit") {
      setRecordData({ loading: true });
      getDataBySlug();
    } else {
      form.resetFields();
    }
  }, []);


  const onFinish = (formValues: TaxRateType) => {
    setRecordData({ ...recordData, buttonLoading: true });

    switch (type) {
      case "edit": {
        if (updateTaxRate === true) {
          module.updateRecord(formValues, record).then((res) => {
            reloadTableData();
            onCancel();
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          message.error("You don't have permission to update this record");
        }
        break;
      }
      case "new": {
        if (createTaxRate === true) {
          module.createRecord(formValues).then((res) => {
            const { data } = res?.data;
            reloadTableData();
            callback && callback(data?.id);
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
        break;
      }
    }
  };


  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={type === "edit" ? "Edit Tax Rate" : "Add New Tax Rate"}
      showFooter={false}
    >
      {recordData?.loading ? (
        <Skeletons items={3} />
      ) : (
        <Form className={styles.form} onFinish={onFinish} form={form}>
          {recordData?.error && (
            <CustomErrorAlert
              description={recordData?.error}
              isClosable
              onClose={handleAlertClose}
            />
          )}
          <Form.Item name="title" rules={[{ required: true, message: "Please add a title" }]}>
            <CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter TaxRate title" />
          </Form.Item>
          <Form.Item name="taxType" >
            <CustomInput size="w100" label={"Tax Type"} type="text" />
          </Form.Item>
          <Form.Item name="rate" >
            <span className="font-size-sm">Rate</span>
            <InputNumber
              defaultValue={form.getFieldValue("rate")}
              onChange={(value) => {
                form.setFieldValue("rate", value)
              }}
              style={{ width: '100%', borderRadius: '0.25rem', border: '2px solid var(--color-border)' }}
              type="number" />
          </Form.Item>

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
              {type === "edit" ? "Edit Tax Rate" : "Add Tax Rate"}
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
