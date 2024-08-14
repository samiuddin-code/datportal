import { FC } from "react";
import { Input, Form, Tabs } from 'antd';
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { CustomButton, CustomSelect, PageHeader, RichTextEditor } from "../../../Atoms";
import styles from "./styles.module.scss";

const { TextArea } = Input;

const breadCrumbsData = [
    {
        text: "Home",
        isLink: true,
        path: "/",
    },
    {
        isLink: true,
        text: "Site Settings",
        path: "/siteSettings",
    },
    {
        isLink: false,
        text: "Template",
    },
];

const Templates: FC = () => {
    // const module = new SiteMapModule();
    const [form] = Form.useForm();

    // const [moduleData, setModuleData] = useState<any>({
    //     isLoading: false,
    //     error: {},
    //     data: [],
    // });

    // const reloadTableData = useCallback(() => {
    //     setModuleData({ ...moduleData, loading: true });
    //     module.getAllRecords().then((res) => {
    //         setModuleData(res.data);
    //         form.setFieldsValue({
    //             data: res.data?.data,
    //         })
    //     }).catch((err) => {
    //         const errorMessage = err?.response?.data?.message || "Something went wrong"
    //         message.error(errorMessage);
    //     });
    // }, [module]);

    // useEffect(() => {
    //     reloadTableData();
    // }, []);

    // const onFinish = (formValues: { data: string }) => {
    //     setModuleData({ ...moduleData, buttonLoading: true });

    //     module.updateRecord(formValues).then((res) => {

    //         setModuleData({ ...moduleData, buttonLoading: false });
    //         message.success("Site Map updated successfully");
    //     }).catch((err) => {
    //         const errorMessage = err?.response?.data?.message || "Something went wrong"
    //         message.error(errorMessage);
    //         setModuleData({ ...moduleData, buttonLoading: false });
    //     });
    // }

    return (
        <SiteSettingsTemplate>
            <PageHeader
                heading="Template"
                breadCrumbData={breadCrumbsData}
            />
            <Tabs type="card">
                {/** Email Template */}
                <Tabs.TabPane tab="Email" key="1">
                    <div className={styles.templates}>
                        <Form
                            form={form}
                        // onFinish={onFinish}
                        >
                            <Form.Item
                                name="template"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a template",
                                    },
                                ]}
                            >
                                <CustomSelect
                                    options={[
                                        {
                                            label: "Template 1",
                                            value: "template1",
                                        },
                                        {
                                            label: "Template 2",
                                            value: "template2",
                                        },
                                        {
                                            label: "Template 3",
                                            value: "template3",
                                        },
                                    ]}
                                    label="Template"
                                    placeholder="Select a template"
                                    asterisk
                                />
                            </Form.Item>

                            <RichTextEditor
                                name="templateValue"
                                form={form}
                            />

                            <Form.Item>
                                <CustomSelect
                                    mode="tags"
                                    options={[
                                        {
                                            label: "Tag 1",
                                            value: "tag1",
                                        },
                                        {
                                            label: "Tag 2",
                                            value: "tag2",
                                        },
                                        {
                                            label: "Tag 3",
                                            value: "tag3",
                                        },
                                    ]}
                                    placeholder="Select user"
                                    label="User"
                                    asterisk
                                />
                            </Form.Item>

                            <div className="mt-4 d-flex justify-end">
                                <CustomButton
                                    type="primary"
                                    fontSize="sm"
                                    htmlType="submit"
                                //loading={moduleData?.buttonLoading}
                                >
                                    Send
                                </CustomButton>
                            </div>
                        </Form>
                    </div>
                </Tabs.TabPane>

                {/** SMS Template */}
                <Tabs.TabPane tab="SMS" key="2">
                    <div className={styles.templates}>
                        <Form form={form} // onFinish={onFinish}
                        >
                            <Form.Item
                                name="template"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a template",
                                    },
                                ]}
                            >
                                <CustomSelect
                                    options={[
                                        {
                                            label: "Template 1",
                                            value: "template1",
                                        },
                                        {
                                            label: "Template 2",
                                            value: "template2",
                                        },
                                        {
                                            label: "Template 3",
                                            value: "template3",
                                        },
                                    ]}
                                    label="Template"
                                    placeholder="Select a template"
                                    asterisk
                                />
                            </Form.Item>

                            <TextArea
                                rows={4}
                                placeholder="Enter template"
                                className="mb-3"

                            />

                            <Form.Item>
                                <CustomSelect
                                    mode="tags"
                                    options={[
                                        {
                                            label: "Tag 1",
                                            value: "tag1",
                                        },
                                        {
                                            label: "Tag 2",
                                            value: "tag2",
                                        },
                                        {
                                            label: "Tag 3",
                                            value: "tag3",
                                        },
                                    ]}
                                    placeholder="Select user"
                                    label="User"
                                    asterisk
                                />
                            </Form.Item>

                            <div className="mt-4 d-flex justify-end">
                                <CustomButton
                                    type="primary"
                                    fontSize="sm"
                                    htmlType="submit"
                                //loading={moduleData?.buttonLoading}
                                >
                                    Send
                                </CustomButton>
                            </div>
                        </Form>
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </SiteSettingsTemplate>
    );
}
export default Templates;
