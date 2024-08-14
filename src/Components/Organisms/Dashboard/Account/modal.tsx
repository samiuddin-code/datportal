import { Form, Select, message } from "antd";
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
import { AccountResponseObject, AccountType } from "../../../../Modules/Account/types";
import { PropTypes } from "../../Common/common-types";
import { AccountPermissionsEnum } from "../../../../Modules/Account/permissions";
import { AccountModule } from "../../../../Modules/Account";
import { CountryModule } from "@modules/Country";

const { Option } = Select;

interface AccountModalProps extends PropTypes {
  record: number;
  permissions: { [key in AccountPermissionsEnum]: boolean };
  /** Callback function passed to the modal to get the id of the newly created record
   * @param value - id of the newly created record
   */
  callback?: (value: number) => void;
}

export const AccountModal = (props: AccountModalProps) => {
  const {
    openModal, onCancel, type, record,
    reloadTableData, permissions: { createAccount, updateAccount },
    callback
  } = props;
  const [form] = Form.useForm();
  const module = new AccountModule();
  const countryModule = useMemo(() => new CountryModule(), []);
  const [recordData, setRecordData] = useState<Partial<AccountResponseObject>>();


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


  const onFinish = (formValues: AccountType) => {
    setRecordData({ ...recordData, buttonLoading: true });

    switch (type) {
      case "edit": {
        if (updateAccount === true) {
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
        if (createAccount === true) {
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
      titleText={type === "edit" ? "Edit Account" : "Add New Account"}
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
              <CustomInput size="w100" label={"Title"} asterisk type="text" placeHolder="Enter Account title" />
            </Form.Item>
            <Form.Item name="accountCode">
              <CustomInput
                size="w100"
                label={"Account Code"}
                type="text"
              />
            </Form.Item>
            <Form.Item name="xeroType">
              <CustomInput
                size="w100"
                label={"Xero Type"}
                type="text"
              />
            </Form.Item>
            <Form.Item name="description">
              <CustomInput
                size="w100"
                label={"Description"}
                type="text"
              />
            </Form.Item>
            <Form.Item name="bankAccountNumber">
              <CustomInput
                size="w100"
                label={"Bank Account Number"}
                type="text"
              />
            </Form.Item>
            
						<Form.Item name="showInExpenseClaims">
							<CustomSelect
								label={"Show In Expense Claims"}
								options={[
									{ value: true, label: "Yes" },
									{ value: false, label: "No" },
								]}
							/>
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
              {type === "edit" ? "Edit Account" : "Add Account"}
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
