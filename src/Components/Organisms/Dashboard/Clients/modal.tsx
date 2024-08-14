import { Form, InputNumber, Select, message, Empty, Radio } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
} from "../../../Atoms";
import styles from "../../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { capitalize } from "../../../../helpers/common";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { ClientResponseObject, ClientType } from "../../../../Modules/Client/types";
import { PropTypes } from "../../Common/common-types";
import { ClientPermissionsEnum } from "../../../../Modules/Client/permissions";
import { ClientModule } from "../../../../Modules/Client";
import { CountryTypes } from "@modules/Country/types";
import { CountryModule } from "@modules/Country";
import { useDebounce } from "@helpers/useDebounce";
import { ClientsType } from "@helpers/commonEnums";
const { Option } = Select;

interface ClientModalProps extends PropTypes {
  record: number;
  permissions: { [key in ClientPermissionsEnum]: boolean };
  /** Callback function passed to the modal to get the id of the newly created record
   * @param value - id of the newly created record
   */
  callback?: (value: number) => void;
}

export const ClientModal = (props: ClientModalProps) => {
  const {
    openModal, onCancel, type, record,
    reloadTableData, permissions: { createClient, updateClient },
    callback
  } = props;
  const [form] = Form.useForm();
  const module = new ClientModule();
  const countryModule = useMemo(() => new CountryModule(), []);
  const [recordData, setRecordData] = useState<Partial<ClientResponseObject>>();
  const [clientType, setClientType] = useState<ClientsType>();

  const [searchTermClient, setSearchTermClient] = useState("");
  const debouncedSearchTermClient = useDebounce(searchTermClient, 500);
  const [clients, setClients] = useState<ClientType[]>([]);
  const onClientSearch = useCallback(() => {
    if (debouncedSearchTermClient) {
      module.findPublished({ name: debouncedSearchTermClient, type: 1 }).then((res) => {

        setClients((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = res?.data?.data?.filter((item: ClientType) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }, [debouncedSearchTermClient])

  useEffect(() => {
    onClientSearch()
  }, [onClientSearch])

  const [countries, setCountries] = useState<CountryTypes[]>([]);
  const getCountryList = useCallback(() => {
    countryModule.getAvailableRecords().then((res) => {
      if (res.data && res.data.data) {
        setCountries(res.data.data);
      }
    });
  }, [countryModule]);

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
        const type = res.data.data.type
        const companyId = res?.data?.data?.companyId
        form.setFieldsValue({
          ...res.data.data,
          type: type === 1 ? ClientsType.company : ClientsType.individual
        });
        setRecordData({ ...res.data, loading: false });
        setClientType(type === 1 ? ClientsType.company : ClientsType.individual);
        // get the organization data from the api
        if (companyId) {
          module.getRecordById(companyId).then((res) => {
            setClients([res?.data?.data])
          }).catch((err) => {
            message.error(err.response.data.message)
          })
        }
      }
    }).catch((err) => {
      handleErrors(err);
    });
  }, [form, record, module]);

  useEffect(() => {
    if (type === "edit") {
      setRecordData({ loading: true });
      getDataBySlug();
      getCountryList();
    } else {
      form.resetFields();
      getCountryList();
    }
  }, []);


  const onFinish = (formValues: ClientType) => {
    setRecordData({ ...recordData, buttonLoading: true });
    const { phoneCode, phone, ...rest } = formValues

    switch (type) {
      case "edit": {
        if (updateClient === true) {
          module.updateRecord({
            ...rest,
            type: formValues.type,
            phoneCode: phoneCode && phone ? String(phoneCode) : undefined,
            phone: String(phone)
          }, record).then((res) => {
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
        if (createClient === true) {
          module.createRecord({
            ...rest,
            type: formValues.type,
            phoneCode: phoneCode && phone ? String(phoneCode) : undefined,
            phone: phone ? String(phone) : undefined
          }).then((res) => {
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
      titleText={type === "edit" ? "Edit Client" : "Add New Client"}
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
          <label>Client Type
            <Form.Item
              name={"type"}
              rules={[{ required: true, message: "Please select an option" }]}
            >
              <Radio.Group
                onChange={(e) => {
                  const value = e.target.value
                  setClientType(value)
                }}
                value={clientType}
              >
                {Object.entries(ClientsType).map(([key, value]) => {
                  return (
                    <Radio key={key} value={value}>
                      {capitalize(key)}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>
          </label>
          <div>
            <Form.Item name="name" rules={[{ required: true, message: "Please add a name" }]}>
              <CustomInput size="w100" label={"Name"} asterisk type="text" placeHolder="Enter client name" />
            </Form.Item>
            <Form.Item name="address">
              <CustomInput
                size="w100"
                label={"Address"}
                type="text"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please add email" },
                { type: "email", message: "Please add valid email" },
              ]}
            >
              <CustomInput asterisk size="w100" label={"Email"} type="email" />
            </Form.Item>

            <div>
              <label className={"font-size-sm"}>
                Phone
                <Form.Item name="phone">
                  <InputNumber
                    type={"number"}
                    addonBefore={
                      <Form.Item
                        name="phoneCode" style={{ marginBottom: 0 }} initialValue={"971"}
                      >
                        <Select
                          style={{ width: 98 }}
                          placeholder="Select phone code"
                          defaultValue={"971"}
                        >
                          {countries?.map((item) => (
                            <Option
                              value={item.phoneCode}
                            >
                              <span>{item.flag}</span>
                              <span className="ml-1">{`+${item.phoneCode}`}</span>
                            </Option>)
                          )}
                        </Select>
                      </Form.Item>
                    }
                    placeholder="Enter phone number"
                    controls={false}
                  />
                </Form.Item>
              </label>
            </div>
          </div>
          <div>
          <Form.Item name="taxRegistrationNumber">
              <CustomInput
                label="Tax Registration Number"
                placeHolder="Enter Tax RegistrationNumber Number"
                size="w100"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item name="whatsapp">
              <CustomInput
                label="WhatsApp Number"
                placeHolder="Enter WhatsApp Number"
                size="w100"
              />
            </Form.Item>
            {clientType === ClientsType['individual'] && <div>
              <Form.Item name="companyId">
                <label className={"font-size-sm"}>
                  Company
                </label>

                <Select
                  allowClear
                  style={{ width: "100%" }}
                  defaultValue={recordData?.data?.companyId}
                  placeholder="Search for the company"
                  className="selectAntdCustom"
                  onChange={(value) => form.setFieldsValue({ companyId: value })}
                  showSearch
                  onSearch={(value) => setSearchTermClient(value)}
                  optionFilterProp="label"
                  options={clients?.map((item) => {
                    return {
                      label: item.name,
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
                          No data found, Please search for the company
                        </span>
                      }
                    />
                  }
                />
              </Form.Item>
            </div>}
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
              {type === "edit" ? "Edit Client" : "Add Client"}
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
