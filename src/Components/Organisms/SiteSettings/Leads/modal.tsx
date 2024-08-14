import { Form, InputNumber, Select, Image, Tabs, message, Empty, Skeleton } from "antd";
import {
    CustomInput,
    CustomModal,
    CustomErrorAlert,
    CustomButton,
    CustomSelect,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import componentStyles from "./styles.module.scss";
import logsStyles from "./Notes/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Components/Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { LeadsModule } from "../../../../Modules/Leads";
import { LeadsResponseObject, LeadsTypes } from "../../../../Modules/Leads/types";
import { CountryModule } from "../../../../Modules/Country";
import { CountryTypes } from "../../../../Modules/Country/types";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import LogsTable from "./Notes/logs-table";
import { convertDate } from "../../../../helpers/dateHandler";
import { PropertiesType } from "../../../../Modules/Properties/types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { PropertiesModule } from "../../../../Modules/Properties";
// import { LeadsSource } from "../../../../helpers/commonEnums";
import { LeadsPermissionsEnum } from "../../../../Modules/Leads/permissions";

const { Option } = Select;

type ModalProps = PropTypes & {
    record: number;
    permissions: { [key in LeadsPermissionsEnum]: boolean };
}

export const LeadsModal = (props: ModalProps) => {
    const {
        openModal, onCancel, type, record, reloadTableData,
        permissions: { createLeads, updateLeads }
    } = props;
    const [form] = Form.useForm();

    const module = useMemo(() => new LeadsModule(), []);
    const countryModule = useMemo(() => new CountryModule(), []);
    // properties module
    const propertiesModule = useMemo(() => new PropertiesModule(), [])

    const [recordData, setRecordData] = useState<Partial<LeadsResponseObject>>();
    const [countries, setCountries] = useState<CountryTypes[]>([]);
    const [fetchNoteLogs, setFetchNoteLogs] = useState<boolean>(false);
    const [leadsLogs, setLeadsLogs] = useState<Partial<LeadsTypes[]>>([]);
    const [properties, setProperties] = useState<{
        data: PropertiesType[];
        loading: boolean;
    }>({
        data: [],
        loading: false,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

    const handleAlertClose = () => setRecordData({ ...recordData, error: "" });

    const getDataById = useCallback(() => {
        module.getRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                // form.setFieldsValue({
                //     translations: res.data.data.localization,
                //     ...res.data.data,
                //     isPublished: res.data.data.isPublished,
                // });
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

    const getNoteLogs = useCallback((query?: any) => {
        if (type === "notes" && fetchNoteLogs) {
            module.notelogs(record, query).then((res) => {
                if (res.data && res.data.data) {
                    setLeadsLogs(res.data.data);
                }
            }).catch((err) => {
                handleErrors(err);
            });
        }
    }, [module, record, type, fetchNoteLogs]);

    useEffect(() => {
        getNoteLogs()
    }, [getNoteLogs]);

    // Get the locations data from the api when the user searches for a location
    const onPropertySearch = useCallback(() => {
        if (debouncedSearchTerm) {
            setProperties((prev) => ({ ...prev, loading: true }));
            propertiesModule.getAllRecords({ title: debouncedSearchTerm }).then((res) => {
                if (res.data.data) {
                    const data = res.data.data as PropertiesType[]
                    setProperties((prev) => {
                        // if the data is already present in the state, then don't add it again
                        const filteredData = data.filter((item) => {
                            return !prev.data.some((prevItem) => prevItem.id === item.id)
                        })

                        return {
                            ...prev,
                            data: [...prev.data, ...filteredData],
                            loading: false,
                        }
                    })
                }
            }).catch((err) => {
                message.error(err.response.data.message || "Something went wrong while fetching the properties")
                setProperties((prev) => ({ ...prev, loading: false }));
            })
        }
    }, [debouncedSearchTerm])

    useEffect(() => {
        onPropertySearch()
    }, [onPropertySearch])

    useEffect(() => {
        if (type === "edit") {
            setRecordData({ loading: true });
            // fetch data by slug or id
            getDataById();
            // fetch the countries
            getCountryList();
        } else if (type === "notes") {
            // fetch data by slug or id
            getDataById();
        } else {
            form.resetFields();
        }
    }, [openModal, type, form, getDataById, getCountryList]);

    const onFinish = (formValues: LeadsTypes & { note: string }) => {
        setRecordData({ ...recordData, buttonLoading: true });
        // formValues.phoneCode = formValues?.phoneCode || "971";
        // formValues.phone = String(formValues?.phone) || "";

        switch (type) {
            case "edit": {
                if (updateLeads === true) {
                    module.updateRecord(formValues, record).then((res) => {
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
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                    message.error("You don't have enough permission to update leads")
                }
                break;
            }
            case "notes": {
                // if (updateLeads === true) {
                //     module.addNote(record, formValues.note).then((res) => {
                //         if (res?.data?.data) {
                //             reloadTableData();
                //         }
                //         onCancel();
                //         setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                //     }).catch((err) => {
                //         handleErrors(err);
                //         setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                //     })
                // } else {
                //     setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                //     message.error("You don't have enough permission to add notes")
                // }
                break;
            }
            case "new": {
                if (createLeads === true) {
                    // module.createRecord({ ...formValues, slug: "admin-panel" }).then(() => {
                    //     reloadTableData();
                    //     onCancel();
                    //     setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                    // }).catch((err) => {
                    //     handleErrors(err);
                    //     setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                    // });
                } else {
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                    message.error("You don't have enough permission to create leads")
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
            titleText={type === "edit" ? "Edit Lead" : type === "notes" ? "Notes" : "Add Lead"}
            showFooter={false}
            size={type === "notes" ? "1000px" : "600px"}
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

                    {type === "notes" ? (
                        <Tabs
                            type='card'
                            defaultActiveKey="addNote"
                            onChange={(key) => key === "logs" ? setFetchNoteLogs(true) : setFetchNoteLogs(false)}
                            className={componentStyles.tabs}
                        >
                            <Tabs.TabPane tab="Notes" key="addNote">
                                <div>
                                    {recordData?.data?.leadNotes?.map((note: any) => (
                                        <div
                                            className={logsStyles.note}
                                            key={`note-${note?.id}`}
                                        >
                                            <div className={logsStyles.note_content}>
                                                {note?.note}
                                            </div>

                                            <div className={logsStyles.note_footer}>
                                                <div className={logsStyles.note_footer_name}>
                                                    {note?.addedBy?.firstName} {note?.addedBy?.lastName}
                                                </div>
                                                <div className={logsStyles.note_footer_date}>
                                                    {convertDate(note?.addedDate, "dd M,yy-t")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Form.Item
                                    name="note"
                                    rules={[{
                                        required: true,
                                        message: "Please add notes"
                                    }]}
                                >
                                    <CustomInput
                                        size="w100"
                                        label={"Notes"}
                                        type="textArea"
                                        name="note"
                                        placeHolder="Add notes here...."
                                    />
                                </Form.Item>
                            </Tabs.TabPane>

                            <Tabs.TabPane tab="Logs" key="logs">
                                <LogsTable data={leadsLogs} />
                            </Tabs.TabPane>
                        </Tabs>
                    ) : (
                        <>
                            {type === "new" && (
                                <>
                                    <div>
                                        <Form.Item
                                            name="propertyId"
                                            rules={[{ required: true, message: "Please select a property" }]}
                                            style={{ marginTop: 10 }}
                                        >
                                            <label className={"font-size-sm"}>
                                                Property <span className='color-red-yp'>*</span>
                                            </label>

                                            <Select
                                                allowClear
                                                style={{ width: "100%" }}
                                                placeholder="Search for a property"
                                                className="selectAntdCustom"
                                                onChange={(value) => form.setFieldsValue({ propertyId: value })}
                                                showSearch
                                                onSearch={(value) => setSearchTerm(value)}
                                                optionFilterProp="label"
                                                options={properties?.data?.map((item) => {
                                                    return {
                                                        label: item.localization[0].title,
                                                        value: item.id,
                                                    }
                                                })}
                                                notFoundContent={properties?.loading === true ? <Skeleton /> : (
                                                    <Empty
                                                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                                        imageStyle={{ height: 100 }}
                                                        description={<span>No data found, Please search for a property</span>}
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </div>

                                    <div>
                                        <Form.Item
                                            name="source"
                                            rules={[{ required: true, message: "Please select source" }]}
                                        >
                                            <CustomSelect
                                                asterisk
                                                label={"Source"}
                                                options={Object.entries([]).map(([key, value]) => ({ label: value, value: key }))}
                                                placeholder={"Select source"}
                                            />
                                        </Form.Item>
                                    </div>
                                </>
                            )}

                            <div>
                                <Form.Item name="name" rules={[{ required: true, message: "Please add name" }]}>
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
                                    rules={[{ required: true, message: "Please add message" }]}
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
                        </>
                    )}

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
