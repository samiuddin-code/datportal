import { Form, message } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import CustomInput from "../../../Atoms/Input";
import CustomModal from "../../../Atoms/Modal";
import { propsTrype } from "./packageSettings";
import styles from "./styles.module.scss";
import CustomSelect from "../../../Atoms/Select";
import CustomButton from "../../../Atoms/Button";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCountryData } from "../../../../Redux/Reducers/countryReducer/action";
import { RootState } from "../../../../Redux/store";
import { getPackageData } from "../../../../Redux/Reducers/PackagesReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { ImageUploader, Localization } from "../../../Atoms";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { slugifyString } from "../../../../helpers/common";

export const PackageModal = (props: propsTrype) => {
  const { openModal, onCancel, onFinish, buttonLoading, initialValues, type } = props;
  const dispatch = useDispatch<dispatchType>();
  const [form] = Form.useForm();
  const { countryData } = useSelector((state: RootState) => state.countryReducer);

  const { singlePackageData } = useSelector((state: RootState) => state.packageReducer);

  const handleSlugChange = ({ target }: any) => {
    let slug = slugifyString(target.value);
    form.setFieldsValue({ slug: slug });
  };

  useEffect(() => {
    dispatch(getCountryData());
  }, [dispatch]);

  useEffect(() => {
    if (type === "edit" && Object.keys(singlePackageData.data).length) {
      const translations = singlePackageData.data?.localization

      form.setFieldsValue({
        isPublished: singlePackageData.data?.isPublished,
        translations: translations,
        credits: singlePackageData.data?.credits,
        durations: singlePackageData.data?.duration,
        ...singlePackageData.data,
      });
    } else {
      form.resetFields();
    }
  }, [form, singlePackageData, type]);

  useEffect(() => {
    if (type === "edit") {
      dispatch(getPackageData(initialValues.id));
    }
  }, [dispatch, initialValues.id, type]);

  return (
    <CustomModal
      visible={openModal}
      onCancel={onCancel}
      titleText={"Add Package"}
      showFooter={false}
    >
      <Form className={styles.form} onFinish={onFinish} form={form}>
        <div>
          <Form.Item
            name="slug"
            rules={[
              {
                required: true,
                message: "Please enter the Role Slug!",
              },
              {
                pattern: new RegExp("(^([-A-Z]|[a-z])*$)"),
                message: "Only letters and hyphen is allowed",
              },
            ]}
          >
            <CustomInput
              size="w100"
              label={"Slug"}
              asterisk
              hint={"Only letters and hyphen is allowed"}
              onChange={handleSlugChange}
            />
          </Form.Item>

          <Form.Item
            name="credits"
            rules={[
              {
                required: true,
                message: "Please enter the Credits!"
              },
            ]}
          >
            <CustomInput
              size="w100"
              label={"Credits"}
              asterisk
              type="text"
            />
          </Form.Item>

        </div>
        <div>
          <Form.Item
            name="countryId"
            rules={[{ required: true, message: "Please select an option!"}]}
          >
            <CustomSelect
              asterisk
              label={"Country"}
              options={countryData.data.map(
                (item: { id: number; name: string }) => ({
                  value: item.id,
                  label: item.name,
                })
              )}
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="duration"
            rules={[
              {
                required: true,
                message: "Please enter the duration!",
              },
              {
                pattern: new RegExp("(^([0-9])*$)"),
                message: "Please enter a valid duration!",
              },
            ]}
          >
            <CustomInput
              size="w100"
              label={"Duration"}
              asterisk
              type="text"
              onChange={(e: any) => {
                if (e.target.value > 90) {
                  message.error("Duration should not be more than 90 days");
                  e.target.value = 90;
                }
              }}
            />
          </Form.Item>
          <Form.Item name="isPublished">
            <CustomSelect
              label={"Published"}
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item name="makeFeatured">
            <CustomSelect
              label={"Featured"}
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
            />
          </Form.Item>
          <Form.Item name="makePremium">
            <CustomSelect
              label={"Premium"}
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
            />
          </Form.Item>
        </div>

        <Localization
          title="Title &amp; Description"
          formName="translations"
          description form={form}
          defaultValue={singlePackageData?.data?.localization}
        />

        <div className="d-flex flex-column">
          <ImageUploader
            name="icon"
            title="Icon"
            defaultFileList={
              type === "edit" &&
              singlePackageData &&
              singlePackageData.data?.icon && [
                {
                  uid: singlePackageData.data?.id,
                  name: singlePackageData.data?.icon,
                  status: "done",
                  url: RESOURCE_BASE_URL + singlePackageData.data?.icon,
                },
              ]
            }
          />
        </div>

        <div className={styles.footer}>
          <CustomButton
            size="normal"
            fontSize="sm"
            onClick={onCancel}
            type="plain"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="primary"
            size="normal"
            fontSize="sm"
            htmlType="submit"
            loading={buttonLoading}
          >
            Submit
          </CustomButton>
        </div>
      </Form>
    </CustomModal>
  );
};
