import { Form, message } from "antd";
import { CustomModal, CustomButton, CustomInput, CustomSelect } from "@atoms/";
import styles from "../Common/styles.module.scss";
import { useEffect, useMemo, useState } from "react";
import { PropTypes } from "@organisms/Common/common-types";
import { ProductPermissionsEnum } from "@modules/Product/permissions";
import { ProductModule } from "@modules/Product";
import { useConditionFetchData, useFetchData } from "hooks";
import { ProductType } from "@modules/Product/types";
import { handleError } from "@helpers/common";
import CustomTextArea from "@atoms/Input/textarea";
import { AccountModule } from "@modules/Account";
import { TaxRateModule } from "@modules/TaxRate";
import { AccountType } from "@modules/Account/types";
import { TaxRateType } from "@modules/TaxRate/types";

interface ProductModalProps extends PropTypes {
  record: number;
  permissions: { [key in ProductPermissionsEnum]: boolean };
}

type FormValuesTypes = {
  title: string;
  description: string,
  productCode: string,
  quantity: number,
  unitPrice: number,
  accountId: number,
  taxRateId: number
}

export const ProductModal = (props: ProductModalProps) => {
  const {
    openModal, onCancel, type, record, reloadTableData,
    permissions: { createProduct, updateProduct }
  } = props;
  const [form] = Form.useForm<FormValuesTypes>();

  const module = useMemo(() => new ProductModule(), []);
  const accountModule = useMemo(() => new AccountModule(), []);
  const taxRateModule = useMemo(() => new TaxRateModule(), []);

  const { data: Product } = useConditionFetchData<ProductType>({
    method: () => module.getRecordById(record),
    condition: type === "edit" && record !== 0
  })
  const { data: accounts } = useFetchData<AccountType[]>({
    method: () => accountModule.getAllRecords(),
  })

  const { data: taxRates } = useFetchData<TaxRateType[]>({
    method: () => taxRateModule.getAllRecords()
  })

  const [buttonLoading, setButtonLoading] = useState(false);

  const onFinish = (formValues: FormValuesTypes) => {
    setButtonLoading(true);

    switch (type) {
      case "new": {
        if (createProduct === true) {
          module.createRecord(formValues).then((res) => {
            message.success(res?.data?.message || "Product created successfully");
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
        if (updateProduct === true) {
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
    if (type === "edit" && Product) {
      const {
        title, productCode, description, quantity,
        unitPrice, accountId, taxRateId
      } = Product

      form.setFieldsValue({
        title, productCode, description, quantity,
        unitPrice, accountId, taxRateId
      })
    } else {
      form.resetFields();
    }
  }, [type, Product])

  return (
    <CustomModal
      visible={openModal} closable={true} onCancel={onCancel} showFooter={false}
      titleText={type === "edit" ? "Edit Product" : "Add New Product"}
    >
      <Form className={styles.form} onFinish={onFinish} form={form}>
        {/** Product Code */}
        <div>
          <Form.Item
            name="productCode"
            rules={[{ required: true, message: "Please add a product code" }]}
          >
            <CustomInput label="Product Code" asterisk size="w100" />
          </Form.Item>
        </div>

        {/** Title */}
        <div>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please add a title" }]}
          >
            <CustomInput label="Title" asterisk size="w100" />
          </Form.Item>
        </div>

        {/** Description */}
        <div>
          <Form.Item name="description">
            <CustomTextArea label="Description" placeholder="Add a description" />
          </Form.Item>
        </div>

        <div>
          {/** Quantity */}
          <Form.Item
            name="quantity"
            rules={[{ required: true, message: "Please add a quantity" }]}
          >
            <CustomInput label="Quantity" placeHolder="Add a quantity" asterisk size="w100" />
          </Form.Item>

          {/** Unit Price */}
          <Form.Item
            name="unitPrice"
            rules={[{ required: true, message: "Please add a unit price" }]}
          >
            <CustomInput label="Unit Price" placeHolder="Add a unit price" asterisk size="w100" />
          </Form.Item>
        </div>

        <div>
          {/** Account */}
          <Form.Item
            name="accountId"
          >
            <CustomSelect
              label="Account"
              options={accounts?.map((account) => ({
                label: account.accountCode + " - " + account.title, value: account.id
              }))}
            />
          </Form.Item>

          {/** Tax Rate */}
          <Form.Item
            name="taxRateId"
          >
            <CustomSelect
              label="Tax Rate"
              options={taxRates?.map((taxRate) => ({
                label: taxRate.taxType + " - " + taxRate.title, value: taxRate.id
              }))}
            />
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
