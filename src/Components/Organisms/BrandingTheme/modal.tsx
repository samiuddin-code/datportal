import { Form, message } from "antd";
import { CustomModal, CustomButton, CustomInput } from "@atoms/";
import styles from "../Common/styles.module.scss";
import { useEffect, useMemo, useState } from "react";
import { PropTypes } from "@organisms/Common/common-types";
import { BrandingThemePermissionsEnum } from "@modules/BrandingTheme/permissions";
import { BrandingThemeModule } from "@modules/BrandingTheme";
import { useConditionFetchData } from "hooks";
import { BrandingThemeType } from "@modules/BrandingTheme/types";
import { handleError } from "@helpers/common";
import CustomTextArea from "@atoms/Input/textarea";

interface BrandingThemeModalProps extends PropTypes {
  record: number;
  permissions: { [key in BrandingThemePermissionsEnum]: boolean };
}

type FormValuesTypes = {
  title: string;
  paymentTerms: string;
}

export const BrandingThemeModal = (props: BrandingThemeModalProps) => {
  const {
    openModal, onCancel, type, record, reloadTableData,
    permissions: { createBrandingTheme, updateBrandingTheme }
  } = props;
  const [form] = Form.useForm<FormValuesTypes>();
  const module = useMemo(() => new BrandingThemeModule(), []);

  const { data: brandingTheme } = useConditionFetchData<BrandingThemeType>({
    method: () => module.getRecordById(record),
    condition: type === "edit" && record !== 0
  })
  const [buttonLoading, setButtonLoading] = useState(false);

  const onFinish = (formValues: FormValuesTypes) => {
    setButtonLoading(true);

    switch (type) {
      case "new": {
        if (createBrandingTheme === true) {
          module.createRecord(formValues).then((res) => {
            message.success(res?.data?.message || "Branding theme created successfully");
            reloadTableData();
            onCancel();
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong, please try again later.");
          }).finally(() => {
            setButtonLoading(false);
          });
        } else {
          setButtonLoading(false);
          message.error("You don't have permission to create a new record");
        }
        break;
      }
      case "edit": {
        if (updateBrandingTheme === true) {
          module.updateRecord(formValues, record).then(() => {
            reloadTableData();
            onCancel();
          }).catch((err) => {
            const errorMessage = handleError(err)
            message.error(errorMessage || "Something went wrong, please try again later.");
          }).finally(() => {
            setButtonLoading(false);
          });
        } else {
          message.error("You don't have permission to update this record");
        }
        break;
      }
      default: {
        setButtonLoading(false);
        break;
      }
    }
  };

  useEffect(() => {
    if (type === "edit" && brandingTheme) {
      const { title, paymentTerms } = brandingTheme

      form.setFieldsValue({ title, paymentTerms })
    } else {
      form.resetFields();
    }
  }, [type, brandingTheme])

  return (
    <CustomModal
      visible={openModal} closable={true} onCancel={onCancel} showFooter={false}
      titleText={type === "edit" ? "Edit Branding Theme" : "Add New Branding Theme"}
    >
      <Form className={styles.form} onFinish={onFinish} form={form}>
        {/** Title */}
        <div>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please add a title" }]}
          >
            <CustomInput label="Title" asterisk size="w100" />
          </Form.Item>
        </div>

        {/** Payment Terms */}
        <div>
          <Form.Item
            name="paymentTerms"
            rules={[{ required: true, message: "Please add payment terms" }]}
          >
            <CustomTextArea label="Payment Terms" placeholder="Add Payment Terms" />
          </Form.Item>
        </div>

        <div className={styles.footer}>
          <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
            Cancel
          </CustomButton>
          <CustomButton
            type="primary" size="normal" fontSize="sm"
            htmlType="submit" loading={buttonLoading}
          >
            Submit
          </CustomButton>
        </div>
      </Form>
    </CustomModal>
  );
};
