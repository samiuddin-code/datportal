import { useCallback, useEffect, useState } from "react";
import { Input, Form, message } from 'antd';
import SiteSettingsTemplate from "../../../Templates/SiteSettings";
import { CustomButton, PageHeader } from "../../../Atoms";
import { SiteMapModule } from "../../../../Modules/SiteMap";

const { TextArea } = Input;

const breadCrumbsData = [
    {
        text: "Home",
        isLink: true,
        path: "/"
    },
    {
        isLink: true,
        text: "Site Settings",
        path: "/siteSettings",
    },
    {
        isLink: false,
        text: "Site Map",
    },
];

function SiteMap() {
    const module = new SiteMapModule();
    const [form] = Form.useForm();

    const [moduleData, setModuleData] = useState<any>({
        isLoading: false,
        error: {},
        data: [],
    });

    const reloadTableData = useCallback(() => {
        setModuleData({ ...moduleData, loading: true });
        module.getAllRecords().then((res) => {
            setModuleData(res.data);
            form.setFieldsValue({
                data: res.data?.data,
            })
        }).catch((err) => {
            const errorMessage = err?.response?.data?.message || "Something went wrong"
            message.error(errorMessage);
        });
    }, [module]);

    useEffect(() => {
        reloadTableData();
    }, []);

    const onFinish = (formValues: { data: string }) => {
        setModuleData({ ...moduleData, buttonLoading: true });

        module.updateRecord(formValues).then((res) => {

            setModuleData({ ...moduleData, buttonLoading: false });
            message.success("Site Map updated successfully");
        }).catch((err) => {
            const errorMessage = err?.response?.data?.message || "Something went wrong"
            message.error(errorMessage);
            setModuleData({ ...moduleData, buttonLoading: false });
        });
    }

    return (
        <SiteSettingsTemplate>
            <PageHeader
                heading="Site Map"
                breadCrumbData={breadCrumbsData}
            />
            <div>
                <Form onFinish={onFinish} form={form}>
                    <Form.Item
                        name="data"
                        rules={[{
                            required: true,
                            message: 'Please input Site Map!',
                        }]}
                    >
                        <TextArea
                            rows={30}
                            placeholder="Paste Site Map here......"
                        />
                    </Form.Item>

                    <div className="mt-5 d-flex justify-end">
                        <CustomButton
                            type="primary"
                            fontSize="sm"
                            htmlType="submit"
                            loading={moduleData?.buttonLoading}
                        >
                            Save
                        </CustomButton>
                    </div>
                </Form>
            </div>
        </SiteSettingsTemplate>
    );
}
export default SiteMap;
