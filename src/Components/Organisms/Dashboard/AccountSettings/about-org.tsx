import { Card, Form, Input, message, Tabs } from 'antd';
import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { enabledLanguages, RESOURCE_BASE_URL } from '../../../../helpers/constants';
import { OrganizationModule } from '../../../../Modules/Organization';
import { OrganizationResponseObject } from '../../../../Modules/Organization/types';
import { RootState } from '../../../../Redux/store';
import { CustomButton, CustomInput, ImageUploader, Typography } from '../../../Atoms';
import styles from "../../Common/styles.module.scss";
import Skeletons from '../../Skeletons';
import componentStyle from "./styles.module.scss";

interface AboutOrganizationProps { }

const AboutOrganization: FC<AboutOrganizationProps> = () => {
    const [form] = Form.useForm();
    // loading state for submit button
    const [loading, setLoading] = useState<boolean>(false);
    const { loggedInUserData, userPermissions } = useSelector((state: RootState) => state.usersReducer);

    const updatePermission: boolean = useMemo(() => {
        // return userPermissions?.updateOrganization 
        return false
    }, [userPermissions])

    const orgModule = useMemo(() => new OrganizationModule(), []);
    const [current, setCurrent] = useState<string>(enabledLanguages[0].iso);
    const [orgData, setOrgData] = useState<Partial<OrganizationResponseObject>>();

    const [translations, setTranslations] = useState<{
        "en": { name: string, description: string },
        "ar": { name: string, description: string }
    }>({
        "en": { name: "", description: "" },
        "ar": { name: "", description: "" }
    })

    const getOrgData = useCallback(() => {
        setOrgData({ ...orgData, loading: true })

        const organizationId = loggedInUserData?.data?.Organization?.id

        if (organizationId) {
            orgModule.getRecordById(organizationId).then((res) => {
                setOrgData({ data: res.data?.data, loading: false })
            }).catch((err) => {
                message.error(err?.response?.data?.message)
                setOrgData({ data: undefined, loading: false })
            })
        }
    }, [orgModule, loggedInUserData])

    useEffect(() => {
        getOrgData()
    }, [getOrgData])


    const onFinish = (formValues: any) => {
        // remove the email, name and description field from the form values
        delete formValues.email;
        delete formValues.name;
        delete formValues.description

        const formData = new FormData();

        setLoading(true);

        const excludeFields = ["logo"];
        Object.entries(formValues).forEach((ele: any) => {
            if (!excludeFields.includes(ele[0])) {
                formData.append(ele[0], ele[1]);
            }
        });

        if (
            formValues["logo"] &&
            typeof formValues["logo"] !== "string" &&
            formValues["logo"]["fileList"].length > 0
        ) {
            formData.append("logo", formValues["logo"]["fileList"][0]["originFileObj"]);
        }

        Object.entries(translations).map(([key, value], index) => {
            const englighName = orgData?.data?.localization[0]?.name;
            const englishDescription = value.description || orgData?.data?.localization[0]?.description;
            const arabicName = value.name || orgData?.data?.localization[1]?.name;
            const arabicDescription = value.description || orgData?.data?.localization[1]?.description;

            formData.append(`translations[${index}][name]`, key === "en" ? englighName : arabicName);
            formData.append(`translations[${index}][description]`, key === "en" ? englishDescription! : arabicDescription!);
            formData.append(`translations[${index}][language]`, key);
        })

        if (updatePermission === false) {
            message.error("You don't have permission to update organization details, please contact your organization admin");
            setLoading(false);
            return;
        } else {
            orgModule.updateRecord(formData, orgData?.data?.id).then((res: any) => {
                message.success(res?.data?.message);
                setLoading(false);
                getOrgData();
            }).catch((err: any) => {
                message.error(err.response?.data?.message);
                setLoading(false);
            })
        }
    }

    const setDefaultValues = useCallback(() => {
        if (!orgData?.data) return;

        if (Object.keys(orgData?.data).length > 0) {
            form.setFieldsValue({
                email: orgData?.data?.email,
                phone: orgData?.data?.phone,
                locationMap: orgData?.data?.locationMap,
                whatsapp: orgData?.data?.whatsapp,
                address: orgData?.data?.address,
            })
        }
    }, [orgData?.data, form])

    useEffect(() => {
        setDefaultValues()
    }, [setDefaultValues])

    return (
        <div className={componentStyle.orgWrapper}>
            <div>
                <Typography color='dark-main' size='lg' className='my-5'>
                    Organization Details
                </Typography>
            </div>

            <div>
                <Card className='rounded-5 mt-4 pa-5'>
                    <Form
                        className={styles.form}
                        onFinish={onFinish}
                        form={form}
                    >
                        <Tabs
                            type='card'
                            defaultActiveKey={enabledLanguages[0].iso}
                            onChange={(item: string) => setCurrent(item)}
                        >
                            <Tabs.TabPane
                                tab="English"
                                key={enabledLanguages[0].iso}
                            >
                                <Form.Item name="name">
                                    {orgData?.loading ? (
                                        <Skeletons items={1} fullWidth />
                                    ) : (
                                        <CustomInput
                                            label="Name"
                                            placeHolder="Add organization name"
                                            size="w100"
                                            asterisk
                                            disabled
                                            defaultValue={orgData?.data?.localization[0]?.name}
                                            onChange={(e: any) => {
                                                setTranslations({
                                                    ...translations,
                                                    [current]: {
                                                        ...translations["en"],
                                                        name: e.target.value,
                                                    }
                                                })
                                            }}
                                        />
                                    )}
                                </Form.Item>

                                <Form.Item name="description">
                                    {orgData?.loading ? (
                                        <Skeletons items={1} fullWidth />
                                    ) : (
                                        <CustomInput
                                            showCount
                                            label="Description"
                                            placeHolder="description"
                                            type="textArea"
                                            rows={15}
                                            maxLength={2000}
                                            asterisk
                                            defaultValue={orgData?.data?.localization[0]?.description!}
                                            onChange={(e: any) => {
                                                setTranslations({
                                                    ...translations,
                                                    [current]: {
                                                        ...translations["en"],
                                                        description: e.target.value,
                                                    }
                                                })
                                            }}
                                            disabled={updatePermission === false}
                                        />
                                    )}
                                </Form.Item>
                            </Tabs.TabPane>

                            <Tabs.TabPane
                                tab="Arabic"
                                key={enabledLanguages[1].iso}
                            >
                                <Form.Item name="name">
                                    {orgData?.loading ? (
                                        <Skeletons items={1} fullWidth />
                                    ) : (
                                        <CustomInput
                                            label="Name"
                                            placeHolder="Add organization name"
                                            size="w100"
                                            asterisk
                                            defaultValue={orgData?.data?.localization[1]?.name}
                                            onChange={(e: any) => {
                                                setTranslations({
                                                    ...translations,
                                                    [current]: {
                                                        ...translations["ar"],
                                                        name: e.target.value,
                                                    }
                                                })
                                            }}
                                            disabled={updatePermission === false}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item name="description">
                                    {orgData?.loading ? (
                                        <Skeletons items={1} fullWidth />
                                    ) : (
                                        <CustomInput
                                            showCount
                                            label="Description"
                                            placeHolder="description"
                                            type="textArea"
                                            rows={15}
                                            maxLength={2000}
                                            asterisk
                                            defaultValue={orgData?.data?.localization[1]?.description!}
                                            onChange={(e: any) => {
                                                setTranslations({
                                                    ...translations,
                                                    [current]: {
                                                        ...translations["ar"],
                                                        description: e.target.value,
                                                    }
                                                })
                                            }}
                                            disabled={updatePermission === false}
                                        />
                                    )}
                                </Form.Item>
                            </Tabs.TabPane>
                        </Tabs>

                        <div>
                            {/** TODO: make country code and flag dynamic */}
                            <Form.Item
                                name="phone"
                                rules={[{ required: true, message: "Please enter phone number" }]}
                            >
                                <label className='color-dark-main font-size-sm'>
                                    Phone
                                    <span className='color-red-yp ml-1'>*</span>
                                    {orgData?.loading ? (
                                        <Skeletons items={1} fullWidth />
                                    ) : (
                                        <Input
                                            type='tel'
                                            placeholder='Enter your phone number'
                                            addonBefore="🇦🇪 +971"
                                            defaultValue={orgData?.data?.phone}
                                            disabled={updatePermission === false}
                                        />
                                    )}
                                </label>
                            </Form.Item>

                            <Form.Item name="email">
                                {orgData?.loading ? (
                                    <>
                                        <label className='color-dark-main font-size-sm'>
                                            Email
                                            <span className='color-red-yp ml-1'>*</span>
                                        </label>
                                        <Skeletons items={1} fullWidth />
                                    </>
                                ) : (
                                    <CustomInput
                                        size="w100"
                                        label='Email'
                                        placeHolder='Enter email'
                                        asterisk
                                        type="email"
                                        defaultValue={orgData?.data?.email}
                                        disabled
                                    />
                                )}
                            </Form.Item>
                        </div>

                        <div>
                            <Form.Item
                                name="locationMap"
                                rules={[{ required: true, message: "Please enter google maps location link" }]}
                            >
                                {orgData?.loading ? (
                                    <>
                                        <label className='color-dark-main font-size-sm'>
                                            Location Map
                                            <span className='color-red-yp ml-1'>*</span>
                                        </label>
                                        <Skeletons items={1} fullWidth />
                                    </>
                                ) : (
                                    <CustomInput
                                        label='Location Map'
                                        placeHolder='Enter google maps location link'
                                        asterisk
                                        defaultValue={orgData?.data?.locationMap}
                                        size="w100"
                                        disabled={updatePermission === false}
                                    />
                                )}
                            </Form.Item>

                            <Form.Item
                                name="whatsapp"
                                rules={[{ required: true, message: "Please enter whatsapp number" }]}
                            >
                                {orgData?.loading ? (
                                    <>
                                        <label className='color-dark-main font-size-sm'>
                                            Whatsapp
                                            <span className='color-red-yp ml-1'>*</span>
                                        </label>
                                        <Skeletons items={1} fullWidth />
                                    </>
                                ) : (
                                    <CustomInput
                                        label='WhatsApp Number'
                                        placeHolder='Enter whatsapp number'
                                        asterisk
                                        defaultValue={orgData?.data?.whatsapp}
                                        size="w100"
                                        disabled={updatePermission === false}
                                    />
                                )}
                            </Form.Item>
                        </div>

                        <div>
                            <Form.Item
                                name="address"
                                rules={[{ required: true, message: "Please enter address" }]}
                            >
                                {orgData?.loading ? (
                                    <>
                                        <label className='color-dark-main font-size-sm'>
                                            Address
                                            <span className='color-red-yp ml-1'>*</span>
                                        </label>
                                        <Skeletons items={1} fullWidth />
                                    </>
                                ) : (
                                    <CustomInput
                                        type="textArea"
                                        label='Address'
                                        placeHolder='Enter address'
                                        asterisk
                                        defaultValue={orgData?.data?.address}
                                        disabled={updatePermission === false}
                                    />
                                )}
                            </Form.Item>

                            {orgData?.loading ? (
                                <Skeletons items={1} fullWidth />
                            ) : (
                                <ImageUploader
                                    title='Logo'
                                    name="logo"
                                    defaultFileList={[
                                        {
                                            uid: String(orgData?.data?.id),
                                            name: orgData?.data.logo || "image.png",
                                            status: "done",
                                            url: RESOURCE_BASE_URL + orgData?.data?.logo || "",
                                        },
                                    ]}
                                    disabled={updatePermission === false}
                                />
                            )}
                        </div>

                        <div className='d-flex justify-end'>
                            <CustomButton
                                type='primary'
                                size='sm'
                                htmlType='submit'
                                loading={loading}
                                disabled={updatePermission === false}
                            >
                                Save
                            </CustomButton>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
export default AboutOrganization;