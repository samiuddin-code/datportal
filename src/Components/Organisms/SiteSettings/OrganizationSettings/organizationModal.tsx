import { Form, Select, Space, Switch, message } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  SelectWithSearch,
  ImageUploader,
  CustomSelect
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { OrgPermissionsEnum } from "@modules/Organization/permissions";
import { OrganizationResponseObject, OrganizationType } from "@modules/Organization/types";
import { OrganizationModule } from "@modules/Organization";
import { OrganizationTypes } from "@helpers/commonEnums";
import { useDebounce } from "@helpers/useDebounce";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { WorkingHoursModule } from "@modules/WorkingHours";
import { WorkingHourType } from "@modules/WorkingHours/types";
import { handleError } from "@helpers/common";

interface OrganizationModalProps extends PropTypes {
  record: number;
  permissions: { [key in OrgPermissionsEnum]: boolean };
}

export const OrganizationModal = (props: OrganizationModalProps) => {
  const {
    openModal, onCancel, type, record,
    reloadTableData, permissions: {
      createOrganization, updateOrganization
    }
  } = props;
  const [form] = Form.useForm();
  const module = new OrganizationModule();
  const workingHourModule = new WorkingHoursModule();
  const [recordData, setRecordData] = useState<Partial<OrganizationResponseObject>>();
  const [workingHours, setWorkingHours] = useState<{isLoading: boolean, data: Partial<WorkingHourType>[]}>({
    isLoading: true,
    data: []
  });
  const [isBranch, setIsBranch] = useState(false);
  // Organization Search Term
  const [searchTermOrganization, setSearchTermOrganization] = useState("");
  const debouncedSearchTermOrganization = useDebounce(searchTermOrganization, 500);
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationType[]>([])

  // Organization Search
  const onOrganizationSearch = () => {
    if (debouncedSearchTermOrganization) {
      module.getAllRecords({ name: debouncedSearchTermOrganization, fetchParentOnly: true }).then((res) => {

        const { data } = res;

        setOrganizationOptions((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.data?.filter((item: OrganizationType) => {
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
    onOrganizationSearch()
  }, [debouncedSearchTermOrganization])

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
          //  translations: res.data.data.localization,
          ...res.data.data,
          type: String(res.data.data.type),
          isPublished: res.data.data.isPublished,
        });
        setIsBranch((Number(res.data.data.type) === 2))
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
  }, [openModal, type, form]);

  useEffect(() => {
    workingHourModule.getAllRecords()
    .then((res) => {
      let data = res.data;
      setWorkingHours({...workingHours, data: data?.data, isLoading: false})
    }).catch((err) =>{
      let error = handleError(err);
      message.error(error);
      setWorkingHours({...workingHours, isLoading: false})
    })
  }, [])

  const onFinish = (formValues: any) => {
    const formData = new FormData();
    const excludeFields = ["logo", "digitalStamp"];
    Object.entries(formValues).forEach((ele: any) => {
      if (!excludeFields.includes(ele[0])) {
        if(ele[1] && ele[1] !== null){
          formData.append(ele[0], ele[1]);
        }
      }
    });

    if (
      formValues["logo"] &&
      typeof formValues["logo"] !== "string" &&
      formValues["logo"]["fileList"].length > 0
    ) {
      formData.append("logo", formValues["logo"]["fileList"][0]["originFileObj"]);
    }

    if (
      formValues["digitalStamp"] &&
      typeof formValues["digitalStamp"] !== "string" &&
      formValues["digitalStamp"]["fileList"].length > 0
    ) {
      formData.append("digitalStamp", formValues["digitalStamp"]["fileList"][0]["originFileObj"]);
    }

    setRecordData({ ...recordData, buttonLoading: true });

    switch (type) {
      case "edit": {
        if (updateOrganization === true) {
          module.updateRecord(formData, record).then((res) => {
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
        if (createOrganization === true) {
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
        break;
      }
    }
  };


  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={type === "edit" ? "Edit Organization" : "Add New Organization"}
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
            <Form.Item name="name" rules={[{ required: true, message: "Please add a name" }]}>
              <CustomInput size="w100" label={"Name"} asterisk type="text" placeHolder="Enter organization name" />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="organizationCode" rules={[{ required: true, message: "Please add a code" }]}
            help={<small>This code will be used as a prefix to quotation, invoices. Eg: INV-DATP3400, INV-LUX2300, QU-DATP3400</small>}
            >
              <CustomInput size="w100" label={"Organization Code"} asterisk type="text" placeHolder="Enter organization code" />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="description">
              <CustomInput size="w100" label={"Description"} type="text" placeHolder="Enter description" />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="taxRegistrationNumber">
              <CustomInput size="w100" label={"Tax Registration Number"} type="text" placeHolder="Enter tax registration number" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="bankAccountNumber">
              <CustomInput size="w100" label={"Bank Account Number"} type="text" placeHolder="Enter bank account number" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="bankIBAN">
              <CustomInput size="w100" label={"Bank IBAN Number"} type="text" placeHolder="Enter bank IBAN number" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="bankAccountHolderName">
              <CustomInput size="w100" label={"Bank Account Holder Name"} type="text" placeHolder="Bank Account Holder Name" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="bankName">
              <CustomInput size="w100" label={"Bank Name"} type="text" placeHolder="Enter name" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="bankSwiftCode">
              <CustomInput size="w100" label={"Bank Swift Code"} type="text" placeHolder="Enter Bank Swift Code" />
            </Form.Item>
          </div>

          <div>
            <Form.Item name="email" rules={[{ required: true, message: "Please add a email", type: "email" }]}>
              <CustomInput size="w100" label={"Email"} asterisk type="text" placeHolder="Enter email" />
            </Form.Item>
          </div>
          <div>
            <Space.Compact>
              <Form.Item style={{ width: '15%' }} name="phoneCode" rules={[{ required: true, message: "Please add phone code", max: 3 }]}>
                <CustomInput size="w100" label={"Phone code"} asterisk type="text" placeHolder="Enter code" defaultValue="971" />
              </Form.Item>
              <Form.Item style={{ width: '85%' }} name="phone" rules={[{ required: true, message: "Please add phone number" }]}>
                <CustomInput size="w100" label={"Phone"} asterisk type="text" placeHolder="Enter phone" />
              </Form.Item>
            </Space.Compact>
          </div>
          <div>
            <Form.Item name="whatsapp">
              <CustomInput size="w100" label={"Whatsapp"} type="text" placeHolder="Enter whatsapp" />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="address">
              <CustomInput size="w100" label={"Address"} type="text" placeHolder="Enter address" />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="locationMap">
              <CustomInput size="w100" label={"Location map"} type="text" placeHolder="Enter Location map" />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="type"
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <SelectWithSearch
                label='Select Organization Type'
                notFoundDescription="No organization type found., Please search for organization type."
                onSearch={() => { }}
                options={Object.entries(OrganizationTypes)?.map(([key, value]) => ({
                  label: value,
                  value: key
                }))}
                onChange={(value) => {
                  form.setFieldsValue({
                    type: value,
                  })
                  setIsBranch((Number(value) === 2))
                }}
              />
            </Form.Item>
          {isBranch && <div>
            <Form.Item
              name="parentId"
              rules={[{ required: true, message: "Please select a organization" }]}
            >
              <SelectWithSearch
                label='Select Organization'
                notFoundDescription="No Organizations found., Please search for Organizations."
                onSearch={(value) => setSearchTermOrganization(value)}
                options={organizationOptions?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                onChange={(value) => form.setFieldsValue({
                  parentId: value,
                })}
              />
            </Form.Item>
          </div>}

          </div>
          <div>
            <Form.Item
              name="workingHoursId"
              rules={[{ required: true, message: "Please select a working hour for the company" }]}
            >
              <CustomSelect
                label="Choose working hour"
                asterisk
                style={{borderWidth: "2px"}}
                placeholder='Select Working Hour'
                options={workingHours?.data.map((ele) => ({
                  label: ele.title,
                  value: ele.id
                }))}
              />
            </Form.Item>
          </div>

          <div>
            <ImageUploader
              name="logo"
              customLabel="Upload logo here"
              defaultFileList={
                type === "edit" &&
                recordData &&
                recordData.data?.logo && [
                  {
                    uid: recordData.data?.id,
                    name: recordData.data?.logo,
                    status: "done",
                    url: RESOURCE_BASE_URL + recordData.data?.logo,
                  },
                ]
              }
            />
          </div>


          <div>
            <ImageUploader
              name="digitalStamp"
              customLabel="Upload digital stamp here"
              defaultFileList={
                type === "edit" &&
                recordData &&
                recordData.data?.digitalStamp && [
                  {
                    uid: recordData.data?.id,
                    name: recordData.data?.digitalStamp,
                    status: "done",
                    url: RESOURCE_BASE_URL + recordData.data?.digitalStamp,
                  },
                ]
              }
            />
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
              {type === "edit" ? "Submit" : "Add Organization"}
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
