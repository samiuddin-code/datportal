
import { Empty, Form, message, Select, InputNumber, DatePicker } from "antd";
import {
  CustomInput, CustomErrorAlert, CustomButton, CustomSelect, ImageUploader,
} from "@atoms/";
import styles from "@organisms/Common/styles.module.scss";
import componentStyles from './styles.module.scss'
import { useEffect, useCallback, useMemo, useState, Dispatch, SetStateAction, FC } from "react";
import { RESOURCE_BASE_URL } from "@helpers/constants";
import { HandleServerErrors } from "@atoms/ServerErrorHandler";
import { errorHandler } from "@helpers/";
import { UserModule } from "@modules/User";
import { UserResponseObject, UserTypes } from "@modules/User/types";
import { CountryModule } from "@modules/Country";
import { PropTypes } from "@organisms/Common/common-types";
import { useDebounce } from "@helpers/useDebounce";
import { OrganizationType } from "@modules/Organization/types";
import { OrganizationModule } from "@modules/Organization";
import { CountryTypes } from "@modules/Country/types";
import { RoleTypes } from "@modules/Roles/types";
import { RolesModule } from "@modules/Roles";
import { DepartmentModule } from "@modules/Department";
import { DepartmentType } from "@modules/Department/types";
import { UserStatus } from "@helpers/commonEnums";
import Skeletons from "@organisms/Skeletons";
import { handleError } from "@helpers/common";
import moment from "moment";
const { Option } = Select;

type EmployeeBasicFormProps = PropTypes & {
  record: number,
  createUser: boolean,
  updateUser: boolean,
  manageAllUser: boolean,
  setCurrentForm: Dispatch<SetStateAction<string>>
}

export const EmployeeBasicForm: FC<EmployeeBasicFormProps> = (props) => {
  const {
    type, record, openModal, onCancel, createUser,
    updateUser, manageAllUser, reloadTableData
  } = props;
  const [form] = Form.useForm();
  const module = useMemo(() => new UserModule(), []);

  const [organizations, setOrganizations] = useState<OrganizationType[]>([]);

  const [searchTermManager, setSearchTermManager] = useState("");
  const debouncedSearchTermManager = useDebounce(searchTermManager, 500);
  const [managers, setManagers] = useState<UserTypes[]>([]);

  const [searchTermDepartment, setSearchTermDepartment] = useState("");
  const debouncedSearchTermDepartment = useDebounce(searchTermDepartment, 500);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);

  const [isFirstRender, setIsFirstRnder] = useState(true);

  const orgModule = useMemo(() => new OrganizationModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const departmentModule = useMemo(() => new DepartmentModule(), []);
  const countryModule = useMemo(() => new CountryModule(), []);
  const rolesModule = useMemo(() => new RolesModule(), []);

  const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
  const [countries, setCountries] = useState<CountryTypes[]>([]);
  const [roles, setRoles] = useState<RoleTypes[]>([]);

  const onOrgSearch = () => {
    orgModule.findPublished().then((res) => {

      setOrganizations((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = res?.data?.data?.filter((item: OrganizationType) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong")
    })
  }

  useEffect(() => {
    onOrgSearch()
  }, [])

  const onManagerSearch = useCallback(() => {
    if (debouncedSearchTermManager) {
      userModule.getAllRecords({ name: debouncedSearchTermManager }).then((res) => {

        setManagers((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = res?.data?.data?.filter((item: UserTypes) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }, [orgModule, debouncedSearchTermManager])
  useEffect(() => {
    onManagerSearch()
  }, [onManagerSearch])

  const onDepartmentSearch = useCallback(() => {
    if (debouncedSearchTermDepartment || isFirstRender) {
      departmentModule.getAllPublishedRecords({ title: debouncedSearchTermDepartment }).then((res) => {

        setDepartments((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = res?.data?.data?.filter((item: DepartmentType) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
        setIsFirstRnder(false);
      }).catch((err) => {
        message.error(err.response.data.message)
        setIsFirstRnder(false);
      })
    }
  }, [orgModule, debouncedSearchTermDepartment])

  useEffect(() => {
    onDepartmentSearch()
  }, [onDepartmentSearch])

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
      const data = res?.data?.data;
      const organization = data?.Organization as OrganizationType;
      const manager = res?.data?.data?.Manager as UserTypes;
      const department = res?.data?.data?.Department as DepartmentType;
      const { dateOfJoining, lastWorkingDate } = data

      if (data) {
        Object.keys(data).forEach((key) => (data[key] === undefined || data[key] === null || data[key] === "undefined") ? delete data[key] : {});
        form.setFieldsValue({
          ...data,
          isPublished: data.isPublished,
          organizationId: organization?.id,
          managerId: manager?.id,
          departmentId: department?.id,
          status: String(data.status),
          dateOfJoining: dateOfJoining ? moment(data.dateOfJoining) : null,
          lastWorkingDate: lastWorkingDate ? moment(data.lastWorkingDate) : null,
        });
        setRecordData({ ...res.data, loading: false });
      }

      if (manager) {
        userModule.getRecordById(manager.id).then((res) => {
          setManagers([res?.data?.data])
        }).catch((err) => {
          message.error(err.response.data.message)
        })
      }
    }).catch((err) => {
      handleErrors(err);
    });

  }, [form, record, module, orgModule]);

  const getRoles = useCallback(() => {
    if (type === "edit") return;

    rolesModule.getAllRecords().then((res) => {
      if (res.data && res.data?.data) {
        setRoles(res.data?.data);
      }
    }).catch((err) => {
      handleErrors(err);
    });
  }, [rolesModule, type]);

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
      // fetch data by slug or id
      getDataBySlug();
      // fetch the countries
      getCountryList();
    } else {
      // fetch the countries
      getCountryList();
      form.resetFields();
      getRoles();
    }
    setSearchTermDepartment("")
  }, [openModal, type, form, getDataBySlug, getCountryList, getRoles]);

  const onFinish = (formValues: any) => {
    /** 
    * save the role ids in a variable and delete it from the formValues
    * so that it doesn't get sent to the server as a part of the form 
    * data when creating a new user
    * */
    const roleIds: number[] = formValues.roleIds
    delete formValues.roleIds;

    // set default value for displayOrgContact
    if (formValues.displayOrgContact === undefined) {
      formValues.displayOrgContact = false;
    }

    setRecordData({ ...recordData, buttonLoading: true });
    const formData = new FormData();
    const excludeFields = ["profile", "translations"];
    Object.entries(formValues).forEach((ele: any) => {
      if (!excludeFields.includes(ele[0]) && ele[1]) {
        formData.append(ele[0], ele[1]);
      }
    });

    if (
      formValues["profile"] &&
      typeof formValues["profile"] !== "string" &&
      formValues["profile"]["fileList"].length > 0
    ) {
      formData.append("profile", formValues["profile"]["fileList"][0]["originFileObj"]);
    }

    if (formValues.translations) {
      formValues.translations.forEach(
        (item: { language: string; title: string }, index: number) => {
          formData.append(`translations[${index + 1}][language]`, item.language);
          formData.append(`translations[${index + 1}][title]`, item.title);
        }
      );
    }

    if(formValues.allDataAccessRestrictedTo && formValues.allDataAccessRestrictedTo.length > 0){
      formValues.allDataAccessRestrictedTo.forEach((orgId : number, index: number) => {
        formData.append(`dataAccessRestrictedTo[${index}]`, String(orgId));
      })
    }else{
      formData.append(`dataAccessRestrictedTo[]`, '');
    }

    //TODO: Fix phone and phone code input group
    formData.append('phoneCode', "971")

    switch (type) {
      case "edit": {
        if (updateUser === true) {
          module.updateRecord(formData, recordData?.data?.id).then(() => {
            reloadTableData();
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            message.success("User updated successfully");
          }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          message.error("You don't have permission to update this user");
        }
        break;
      }
      case "new": {
        if (createUser === true) {
          module.createRecord(formData).then(async (res) => {
            // user id
            const id = res.data?.data?.id;
            await module.addRoles({ roleIds: roleIds }, id).then(() => {
              reloadTableData();
              setRecordData((prev) => ({ ...prev, buttonLoading: false }));
              message.success("User created successfully");
            }).catch((err) => {
              handleErrors(err);
              setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            })
          }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          message.error("You don't have permission to create a new user");
        }
        break;
      }
    }
  };

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
          <Form.Item
            name="firstName"
            rules={[
              { required: type === "new" ? true : false, message: "Please add first name" },
            ]}
          >
            <CustomInput size="w100" label={"First Name"} asterisk={type === "new"} type="text" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: type === "new" ? true : false, message: "Please add last name" }]}
          >
            <CustomInput size="w100" label={"Last Name"} asterisk={type === "new"} type="text" />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            name="email"
            rules={[
              { required: type === "new" ? true : false, message: "Please add email" },
              { type: "email", message: "Please add valid email" },
            ]}
          >
            <CustomInput disabled={!manageAllUser} size="w100" label={"Email"} asterisk={type === "new"} type="email" />
          </Form.Item>

          {type === "new" && (
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please add password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <CustomInput size="w100" label={"Password"} asterisk type="password" />
            </Form.Item>
          )}
        </div>

        <div>
          <div>
            <label className={"font-size-sm"}>
              Phone  <span className='color-red-yp'>*</span>
              <Form.Item
                name="phone"
                rules={[{ required: true, message: "Please add phone" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  type={"number"}
                  addonBefore={
                    <Select
                      style={{ width: 98 }}
                      placeholder="Select phone code"
                      defaultValue={type === "new" ? "971" : recordData?.data?.phoneCode || "971"}
                    >
                      {countries?.map((item) => (
                        <Option
                          key={item.id}
                          value={item.phoneCode}
                        >
                          <span>{item.flag}</span>
                          {/* <Image
                               src={`${RESOURCE_BASE_URL}${item.flag}`}
                               width={20}
                               height={20}
                               preview={false}
                               style={{ objectFit: "contain" }}
                            />
                          */}
                          <span className="ml-1">{`${item.phoneCode}`}</span>
                        </Option>)
                      )}
                    </Select>
                  }
                  placeholder="Enter phone number"
                  defaultValue={type === "new" ? "" : recordData?.data?.phone}
                  controls={false}
                />
              </Form.Item>
            </label>
          </div>

          <Form.Item
            name="address"
          >
            <CustomInput size="w100" label={"Address"} type="text" />
          </Form.Item>
        </div>

        <div>

          <Form.Item
            name="designation"
          >
            <CustomInput disabled={!manageAllUser} size="w100" label={"Designation"} type="text" />
          </Form.Item>

          <div>

            <label className={"font-size-sm"}>
              Department  <span className='color-red-yp'>*</span>
              <Form.Item
                name="departmentId"
                rules={[{ required: true, message: "Please select a department" }]}
              >

                <Select
                  disabled={!manageAllUser}
                  allowClear
                  style={{ width: "100%" }}
                  defaultValue={recordData?.data?.Department?.id}
                  placeholder="Search for the department"
                  className="selectAntdCustom"
                  onChange={(value) => form.setFieldsValue({ departmentId: value })}
                  showSearch
                  onSearch={(value) => setSearchTermDepartment(value)}
                  optionFilterProp="label"
                  options={departments?.map((item) => {
                    return {
                      label: item.title,
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
                          No data found, Please search for the department
                        </span>
                      }
                    />
                  }
                />
              </Form.Item>
            </label>
          </div>
        </div>


        <div>
          <Form.Item name="whatsapp">
            <CustomInput
              label="WhatsApp Number"
              placeHolder="Enter WhatsApp Number"
              size="w100"
            />
          </Form.Item>

          <Form.Item
            name="status"
            initialValue={form.getFieldValue("status") || UserStatus.active}
          >
            <CustomSelect
              label={"User Status"}
              disabled={!manageAllUser}
              options={[
                { value: UserStatus.active, label: "Active" },
                { value: UserStatus.suspended, label: "Suspended" },
              ]}
              placeholder="Select User Status"
            />
          </Form.Item>
        </div>

        <div>
          <div>
            <label className={"font-size-sm"}>
              Organization  <span className='color-red-yp'>*</span>
              <Form.Item
                name="organizationId"
                rules={[{ required: true, message: "Please select an organization" }]}
              >
                <Select
                  disabled={!manageAllUser}
                  allowClear
                  style={{ width: "100%" }}
                  defaultValue={recordData?.data?.Organization?.id}
                  placeholder="Search for the organization"
                  className="selectAntdCustom"
                  onChange={(value) => form.setFieldsValue({ organizationId: value })}
                  showSearch
                  optionFilterProp="label"
                  options={organizations?.map((item) => {
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
                          No data found, Please search for the organization
                        </span>
                      }
                    />
                  }
                />
              </Form.Item>
            </label>
          </div>

          <div>
            <label className={"font-size-sm"}>
              Manager  <span className='color-red-yp'>*</span>
              <Form.Item
                name="managerId"
                rules={[{ required: true, message: "Please select a manager" }]}
              >
                <Select
                  disabled={!manageAllUser}
                  allowClear
                  style={{ width: "100%" }}
                  defaultValue={recordData?.data?.Manager?.id}
                  placeholder="Search for the manager"
                  className="selectAntdCustom"
                  onChange={(value) => value ? form.setFieldsValue({ managerId: value }) : {}}
                  showSearch
                  onSearch={(value) => setSearchTermManager(value)}
                  optionFilterProp="label"
                  options={managers?.map((item) => {
                    return {
                      label: item.firstName + " " + item.lastName,
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
                          No data found, Please search for the manager
                        </span>
                      }
                    />
                  }
                />
              </Form.Item>
            </label>
          </div>
        </div>


        <div className="mb-4">
          {type === "new" && (
            <div>
              <label className={"font-size-sm"}>
                Select Roles <span className="color-red-yp">*</span>
                <Form.Item
                  name="roleIds"
                  rules={[{ required: true, message: "Please select at least one role" }]}
                  help={
                    <small className="color-dark-main">
                      Select roles for this user!. You can select multiple roles.
                    </small>
                  }
                >
                  <Select
                    disabled={!manageAllUser}
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select at least one role"
                    className="selectAntdCustom"
                    onChange={(value) => form.setFieldsValue({ roleIds: value })}
                    showSearch
                    optionFilterProp="label"
                    options={roles.map((role) => ({
                      label: role?.title,
                      value: role?.id,
                    }))}
                  />
                </Form.Item>
              </label>
            </div>
          )}

          <div>
            <label className={"font-size-sm"}>
              Date of Joining  <span className='color-red-yp'>*</span>
              <Form.Item
                name="dateOfJoining"
              >
                <DatePicker className={componentStyles.date_picker} />
              </Form.Item>
            </label>
          </div>

          {type === "edit" && (
            <div>
              <label className={"font-size-sm"}>
                Last Working Date
                <Form.Item name="lastWorkingDate">
                  <DatePicker className={componentStyles.date_picker} />
                </Form.Item>
              </label>
            </div>
          )}
        </div>

        <div>
            <label className={"font-size-sm"}>
              Limit Data Access to
              <Form.Item
                name="allDataAccessRestrictedTo"
                help="If any organization/branch is chosen then the data will be restricted to the chosen organization. Empty meaning no restriction"
              >
                <Select
                  mode="multiple"
                  disabled={!manageAllUser}
                  allowClear
                  style={{ width: "100%" }}
                  defaultValue={recordData?.data?.dataAccessRestrictedTo}
                  placeholder="Search for the organization"
                  className="selectAntdCustom"
                  onChange={(value) => form.setFieldsValue({ dataAccessRestrictedTo: value })}
                  showSearch
                  optionFilterProp="label"
                  options={organizations?.map((item) => {
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
                          No data found, Please search for the organization
                        </span>
                      }
                    />
                  }
                />
              </Form.Item>
            </label>
          </div>

        <div className="mt-5">
          <ImageUploader
            name="profile"
            defaultFileList={
              type === "edit" &&
              recordData &&
              recordData.data?.profile && [
                {
                  uid: recordData.data?.id,
                  name: recordData.data?.profile,
                  status: "done",
                  url: RESOURCE_BASE_URL + recordData.data?.profile,
                },
              ]
            }
          />
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