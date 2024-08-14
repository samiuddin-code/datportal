import { Form, InputNumber, Select } from "antd";
import {
    CustomInput,
    CustomModal,
    CustomErrorAlert,
    CustomButton,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { UserRatingModule } from "../../../../Modules/UserRating";
import { UserRatingResponseObject, UserRatingTypes } from "../../../../Modules/UserRating/types";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";

const { Option } = Select;

type ModalProps = PropTypes & { record: number; }

export const UserRatingModal = (props: ModalProps) => {
    const { openModal, onCancel, type, record, reloadTableData } = props;
    const [form] = Form.useForm();

    const module = useMemo(() => new UserRatingModule(), []);
    const countryModule = useMemo(() => new CountryModule(), []);

    const [recordData, setRecordData] = useState<Partial<UserRatingResponseObject>>();
    const [countries, setCountries] = useState<CountryTypes[]>([]);

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

    const getDataById = useCallback(() => {
        module.getRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                form.setFieldsValue({
                    translations: res.data.data.localization,
                    ...res.data.data,
                    isPublished: res.data.data.isPublished,
                });
                setRecordData({ ...res.data, loading: false });
            }
        }).catch((err) => {
            handleErrors(err);
        });
    }, [form, record, module]);

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
            getDataById();
            // fetch the countries
            getCountryList();
        } else {
            form.resetFields();
        }
    }, [openModal, type, form, getDataById, getCountryList]);

    const onFinish = (formValues: UserRatingTypes) => {
        setRecordData({ ...recordData, buttonLoading: true });
        formValues.phoneCode = formValues?.phoneCode || "971";
        formValues.phone = String(formValues?.phone) || "";

        if (type === "edit") {
            module.updateRecord(formValues, recordData?.data.id).then((res) => {
                if (res?.data?.data) {
                    reloadTableData();
                }
                onCancel();
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            }).catch((err) => {
                handleErrors(err);
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
        } else {
            module.createRecord(formValues).then((res) => {
                reloadTableData();
                onCancel();
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            }).catch((err) => {
                handleErrors(err);
                setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            });
        }
    };

    return (
        <CustomModal
            visible={openModal}
            closable={true}
            onCancel={onCancel}
            titleText={type === "edit" ? "Edit User Rating" : "Add New User Rating"}
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
                        <Form.Item name="name" rules={[{ required: true, message: "Please add currency name" }]}>
                            <CustomInput
                                size="w100"
                                label={"Name"}
                                asterisk
                                type="text"
                            />
                        </Form.Item>
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
                                        type={"number"}
                                        addonBefore={
                                            <Select
                                                style={{ width: 98 }}
                                                placeholder="Select phone code"
                                                defaultValue={type === "new" ? "971" : recordData?.data?.phoneCode || "971"}
                                            // onChange={(value) => {
                                            //     form.setFieldsValue({ phoneCode: value });
                                            // }}
                                            >
                                                {countries?.map((item) => {
                                                    return (
                                                        <Option
                                                            value={item.phoneCode}
                                                        >
                                                            <span>{item.flag}</span>
                                                            <span className="ml-1">{`${item.phoneCode}`}</span>
                                                        </Option>
                                                    )
                                                })}
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
                            name="email"
                            rules={[{ required: type === "new" ? true : false, message: "Please add email" }]}
                        >
                            <CustomInput size="w100" label={"Email"} asterisk={type === "new"} type="text" />
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item
                            name="message"
                            rules={[{ required: true, message: "Please add currency symbol" }]}
                        >
                            <CustomInput
                                size="w100"
                                label={"Message"}
                                asterisk
                                type="textArea"
                                defaultValue={type === "new" ? "" : recordData?.data?.message}
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
            )}
        </CustomModal>
    );
};
