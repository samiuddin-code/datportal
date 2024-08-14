
import { Form, message, Select, InputNumber, DatePicker } from "antd";
import {
  CustomInput, CustomErrorAlert, CustomButton, SelectWithSearch,
} from "@atoms/";
import styles from "../../../Common/styles.module.scss";
import { useEffect, useCallback, useMemo, useState, Dispatch, SetStateAction, FC } from "react";
import { NATIONALITIES, RELIGIONS } from "@helpers/constants";
import { HandleServerErrors } from "@atoms/ServerErrorHandler";
import { errorHandler } from "@helpers/";
import { UserModule } from "@modules/User";
import { UserResponseObject } from "@modules/User/types";
import { CountryModule } from "@modules/Country";
import { PropTypes } from "../../../Common/common-types";
import { OrganizationModule } from "@modules/Organization";
import { CountryTypes } from "@modules/Country/types";
import Skeletons from "@organisms/Skeletons";
import moment from "moment";
const { Option } = Select;

const Relationship = [
  "Spouse", "Mother", "Father", "Child", "Brother", "Sister", "Friend", "Neighbor", "Coworker",
  "Aunt", "Uncle", "Cousin", "Niece", "Nephew",
]
const Gender = ["Male", "Female", "Other"]
const MaritalStatus = ["Single", "Married", "Divorced", "Widowed", "Separated"]

type AdditionalProps = {
  record: number,
  createUser: boolean,
  updateUser: boolean,
  manageAllUser: boolean,
  setCurrentForm: Dispatch<SetStateAction<string>>
} & PropTypes

type FieldNameType = {
  nationality: string,
  religion: string,
  maritalStatus: string
  gender: string,
  emergencyContactRelationship: string,
}

export const Additional: FC<AdditionalProps> = (props) => {
  const { type, record, openModal, onCancel, updateUser, reloadTableData, manageAllUser } = props;
  const [form] = Form.useForm();
  const module = useMemo(() => new UserModule(), []);

  const orgModule = useMemo(() => new OrganizationModule(), []);
  const countryModule = useMemo(() => new CountryModule(), []);

  const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
  const [countries, setCountries] = useState<CountryTypes[]>([]);
  const [nationalityOptions, setNationalityOptions] = useState(NATIONALITIES);
  const [religionOptions, setReligionOptions] = useState(RELIGIONS);
  const [relationshipOptions, setRelationshipOptions] = useState(Relationship);
  const [genderOptions, setGenderOptions] = useState(Gender);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState(MaritalStatus);
  const [searchedValues, setSearchedValues] = useState<FieldNameType>({
    nationality: "", religion: "", emergencyContactRelationship: "",
    gender: "", maritalStatus: ""
  })

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

  // Get data for the selected record from the api and set it in the form
  const getDataBySlug = useCallback(() => {
    module.getRecordById(record).then((res) => {

      if (res.data && res.data.data) {
        res.data.data.UserMeta.forEach((item: { id: number, key: string, value: string }) => {
          form.setFieldValue(item.key, item.value)

          const states: Record<keyof FieldNameType, [string[], Dispatch<SetStateAction<string[]>>]> = {
            nationality: [nationalityOptions, setNationalityOptions],
            religion: [religionOptions, setReligionOptions],
            maritalStatus: [maritalStatusOptions, setMaritalStatusOptions],
            gender: [genderOptions, setGenderOptions],
            emergencyContactRelationship: [relationshipOptions, setRelationshipOptions],
          }

          // add the value to the options list if it doesn't exist in the list already but is present in the database
          Object.entries(states).forEach(([key, value]) => {
            const [options, setOptions] = value
            if (item.key === key && item.value && !options.includes(item.value)) {
              setOptions([...options, item.value])
            }
          })
        })
        setRecordData({ ...res.data, loading: false });
      }

    }).catch((err) => {
      handleErrors(err);
    });

  }, [form, record, module, orgModule]);

  const getCountryList = useCallback(() => {
    countryModule.getAvailableRecords().then((res) => {
      if (res.data && res.data.data) {
        setCountries(res.data.data);
      }
    });
  }, [countryModule]);

  useEffect(() => {
    if (type === "edit") {
      setRecordData({ loading: true });
      getDataBySlug();
      getCountryList();
    } else {
      // fetch the countries
      getCountryList();
      form.resetFields();
    }
  }, [openModal, type, form, getDataBySlug, getCountryList]);

  const onFinish = (formValues: any) => {
    const processedValues: any[] = [];
    Object.entries(formValues).forEach(([key, value]) => {
      if (value) {
        processedValues.push({
          key,
          value: value.toString()
        })
      }
    })
    setRecordData({ ...recordData, buttonLoading: true });

    if (updateUser === true) {
      module.updateUserMeta({ userMeta: processedValues }, recordData?.data?.id).then((res) => {
        reloadTableData();
        // setCurrentForm("3");
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      }).catch((err) => {
        handleErrors(err);
        setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      });
    } else {
      setRecordData((prev) => ({ ...prev, buttonLoading: false }));
      message.error("You don't have permission to update this user");
    }
  };

  /**This function will save the searched value in the state
   * @param value searched value
   * @param name name of the field
   */
  const handleSearch = (value: string, name: keyof FieldNameType) => {
    if (!value) return
    value && setSearchedValues((prev) => ({ ...prev, [name]: value }))
    form.setFieldValue(name, value)
  }

  /**This function will add the searched value to the options list
   * when the user clicks outside the select input field
   * @param name name of the field 
   */
  const handleOnBlur = (name: keyof FieldNameType) => {
    const states: Record<keyof FieldNameType, [string[], Dispatch<SetStateAction<string[]>>]> = {
      nationality: [nationalityOptions, setNationalityOptions],
      religion: [religionOptions, setReligionOptions],
      maritalStatus: [maritalStatusOptions, setMaritalStatusOptions],
      gender: [genderOptions, setGenderOptions],
      emergencyContactRelationship: [relationshipOptions, setRelationshipOptions],
    }

    const [options, setOptions] = states[name]
    const value = searchedValues[name]

    if (value && !options.includes(value)) {
      setOptions([...options, value])
    }
  }

  return (
    recordData?.loading ? (
      <Skeletons items={10} />) : (
      <Form className={styles.form} onFinish={onFinish} form={form}>
        {recordData?.error && (
          <CustomErrorAlert
            description={recordData?.error}
            isClosable
            onClose={handleAlertClose}
          />
        )}

        <div>
          <label style={{ width: '100%', fontSize: 'var(--font-size-sm)' }}>
            Date Of Birth
            <Form.Item
              name="dateOfBirth"
              valuePropName={'dateOfBirth'}
            >

              <DatePicker
                defaultValue={form.getFieldValue("dateOfBirth") ? moment(form.getFieldValue("dateOfBirth")) : undefined}
                clearIcon
                style={{ width: '100%', border: '2px solid var(--color-border)', borderRadius: '0.25rem' }}
              />
            </Form.Item>
          </label>
          <Form.Item name="nationality">
            <SelectWithSearch
              asterisk={false}
              label={"Nationality"}
              options={nationalityOptions.map((item) => ({
                label: item, value: item
              }))}
              onSearch={(value) => handleSearch(value, "nationality")}
              onBlur={() => handleOnBlur("nationality")}
              notFoundDescription="Pro Tip: If nationality is not available in the list, continue typing it will be added automatically"
            />
          </Form.Item>

        </div>

        <div>
          <Form.Item
            name="personalEmail"
            rules={[{ type: "email", message: "Please add valid email" }]}
          >
            <CustomInput size="w100" label={"Personal Email"} type="email" />
          </Form.Item>

          <div>
            <label className={"font-size-sm"}>
              Personal Phone
              <Form.Item name="personalNumber">
                <InputNumber
                  type={"text"}
                  style={{ width: '100%' }}
                  addonBefore={
                    <Select
                      style={{ width: 98 }}
                      placeholder="Select phone code"
                      defaultValue={"971"}
                    >
                      {countries?.map((item) => (
                        <Option value={item.phoneCode} key={`country-${item.id}`}>
                          <span>{item.flag}</span>
                          <span className="ml-1">{`${item.phoneCode}`}</span>
                        </Option>)
                      )}
                    </Select>
                  }
                  placeholder="Enter phone number"
                  controls={false}
                />
              </Form.Item>
            </label>
          </div>
        </div>

        <div>
          <Form.Item name="religion">
            <SelectWithSearch
              asterisk={false}
              label={"Religion"}
              options={religionOptions.map((item) => ({
                label: item, value: item
              }))}
              onSearch={(value) => handleSearch(value, "religion")}
              onBlur={() => handleOnBlur("religion")}
              notFoundDescription="Pro Tip: If religion is not available in the list, continue typing it will be added automatically"
            />
          </Form.Item>

          <Form.Item name="maritalStatus">
            <SelectWithSearch
              asterisk={false}
              label={"Marital Status"}
              options={maritalStatusOptions.map((item) => ({
                label: item, value: item
              }))}
              onSearch={(value) => handleSearch(value, "maritalStatus")}
              onBlur={() => handleOnBlur("maritalStatus")}
              notFoundDescription="Pro Tip: If marital status is not available in the list, continue typing it will be added automatically"
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item name="gender">
            <SelectWithSearch
              asterisk={false}
              label="Gender"
              options={genderOptions.map((item) => ({
                label: item, value: item
              }))}
              onSearch={(value) => handleSearch(value, "gender")}
              onBlur={() => handleOnBlur("gender")}
              notFoundDescription="Pro Tip: If gender is not available in the list, continue typing it will be added automatically"
            />
          </Form.Item>

          <Form.Item name="currentProfession">
            <CustomInput label={"Current Profession"} type="text" size="w100" />
          </Form.Item>
        </div>


        <div>
          <Form.Item name="passportNumber">
            <CustomInput
              label="Passport Number"
              placeHolder="Enter Passport Number"
              size="w100"
            />
          </Form.Item>
          <label style={{ width: '100%', fontSize: 'var(--font-size-sm)' }}>
            Passport Expiry Date
            <Form.Item
              name="passportExpiryDate"
              valuePropName={'passportExpiryDate'}
            >
              <DatePicker
                defaultValue={form.getFieldValue("passportExpiryDate") ? moment(form.getFieldValue("passportExpiryDate")) : undefined}
                clearIcon
                style={{ width: '100%', border: '2px solid var(--color-border)', borderRadius: '0.25rem' }}
              />
            </Form.Item>
          </label>

        </div>

        <div>
          <Form.Item name="emergencyContactName">
            <CustomInput
              label="Emergency Contact Name"
              placeHolder="Enter Emergency Contact Name"
              size="w100"
            />
          </Form.Item>
          <Form.Item name="emergencyContactRelationship">
            <SelectWithSearch
              asterisk={false}
              label={"Emergency Contact Relationship"}
              options={relationshipOptions.map((item) => ({
                label: item, value: item
              }))}
              onSearch={(value) => handleSearch(value, "emergencyContactRelationship")}
              onBlur={() => handleOnBlur("emergencyContactRelationship")}
              notFoundDescription="Pro Tip: If relationship is not available in the list, continue typing it will be added automatically"
            />
          </Form.Item>

        </div>
        <div>
          <Form.Item name="emergencyContactAddress">
            <CustomInput
              label="Emergency Contact Address"
              placeHolder="Enter Emergency Contact Address"
              size="w100"
            />
          </Form.Item>
          <Form.Item name="emergencyContactNumber">
            <CustomInput
              label="Emergency Contact Number"
              placeHolder="Enter Emergency Contact Number"
              size="w100"
            />
          </Form.Item>

        </div>
        <div>
          <Form.Item name="labourCardNumber">
            <CustomInput
              label="Labour Card Number"
              placeHolder="Enter Labour Card Number"
              size="w100"
              disabled={!manageAllUser}
            />
          </Form.Item>
        </div>


        <div className={styles.footer}>
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
            Submit
          </CustomButton>
        </div>
      </Form>
    ))
}