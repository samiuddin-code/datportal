import { Alert, Card, Form, Input, message } from 'antd';
import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { UserModule } from '../../../../Modules/User';
import { UserTypes } from '../../../../Modules/User/types';
import { CustomButton, CustomInput, Typography } from '../../../Atoms';
import styles from "../../Common/styles.module.scss";
import componentStyle from "./styles.module.scss";

interface AboutCardProps {
    defaultData: UserTypes
    loading?: boolean
    /** function to reload the user data */
    reload?: () => void
    drawer?: boolean
}

const AboutCard: FC<AboutCardProps> = ({ defaultData, reload, drawer }) => {
    const [form] = Form.useForm();
    // loading state for submit button
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    const userModule = useMemo(() => new UserModule(), []);

    const onFinish = (formValues: any) => {
        // remove the email field from the form values
        delete formValues.email;
        setBtnLoading(true);

        userModule.updateRecord(formValues, defaultData.id).then((res: any) => {
            message.success(res?.data?.message);
            setBtnLoading(false);
            reload && reload();
        }).catch((err: any) => {
            message.error(err.response?.data?.message);
            setBtnLoading(false);
        })
    }

    const setDefaultValues = useCallback(() => {
        if (Object.keys(defaultData).length > 0) {
            form.setFieldsValue({
                firstName: defaultData.firstName,
                lastName: defaultData.lastName,
                email: defaultData.email,
                phone: defaultData.phone,
                // whatsapp: defaultData.whatsapp,
            })
        }
    }, [defaultData, form])

    useEffect(() => {
        setDefaultValues()
    }, [setDefaultValues])

    return (
        <div>
            {!drawer && (
                <>
                    <Alert
                        message="Your admin now manages your account. Contact your admin to change your account details."
                        description={<a href='/'>Learn more about managed accounts</a>}
                        type="info"
                        showIcon
                        closable
                        className={componentStyle.alert}
                    />

                    <div>
                        <Typography color='dark-main' size='lg' className='my-5'>
                            Profile and Visibility
                        </Typography>

                        <div>
                            <p className='mb-2'>
                                Manage your personal information, and control which information other people see and apps may access.
                            </p>

                            <a href='/'>Learn more about your profile and visibility or view our privacy policy.</a>
                        </div>
                    </div>
                </>
            )}

            {/**About You Card */}
            <div>
                <Typography color='dark-main' size='lg' className={`${!drawer && 'mt-5'}`}>
                    About You
                </Typography>

                <Card className='rounded-5 mt-4 pa-5'>
                    <Form
                        className={styles.form}
                        onFinish={onFinish}
                        form={form}
                    >
                        <div>
                            <Form.Item
                                name="firstName"
                                rules={[{ required: true, message: "Please enter first name" }]}

                            >
                                <CustomInput
                                    size="w100"
                                    label='First Name'
                                    placeHolder='Enter first name'
                                    asterisk
                                    type="text"
                                    defaultValue={defaultData.firstName}
                                />
                            </Form.Item>

                            <Form.Item
                                name="lastName"
                                rules={[{ required: true, message: "Please enter last name" }]}
                            >
                                <CustomInput
                                    size="w100"
                                    label='Last Name'
                                    placeHolder='Enter last name'
                                    asterisk
                                    type="text"
                                    defaultValue={defaultData.lastName}
                                />
                            </Form.Item>
                        </div>

                        <div>
                            {/** TODO: make country code and flag dynamic */}
                            <Form.Item
                                name="phone"
                                rules={[{ required: true, message: "Please enter phone number" }]}
                            >
                                <label className='color-dark-main font-size-sm'>
                                    Phone
                                    <span className='color-red-yp ml-1'>*</span>
                                    <Input
                                        type='tel'
                                        placeholder='Enter your phone number'
                                        addonBefore="🇦🇪 +971"
                                        defaultValue={defaultData.phone}
                                    />
                                </label>
                            </Form.Item>

                            <Form.Item
                                name="whatsapp"
                                rules={[{ required: true, message: "Please enter whatsapp number" }]}
                            >
                                <label className='color-dark-main font-size-sm'>
                                    WhatsApp
                                    <span className='color-red-yp ml-1'>*</span>
                                    <Input
                                        type='tel'
                                        placeholder='Enter your whatsapp number'
                                        addonBefore="🇦🇪 +971"
                                    // defaultValue={defaultData.whatsapp}
                                    />
                                </label>
                            </Form.Item>
                        </div>

                        <div>
                            <Form.Item name="email">
                                <CustomInput
                                    size="w100"
                                    label='Email'
                                    placeHolder='Enter email'
                                    asterisk
                                    type="email"
                                    defaultValue={defaultData.email}
                                    disabled
                                />
                            </Form.Item>
                        </div>

                        <div className='d-flex justify-end'>
                            <CustomButton
                                type='primary'
                                size='sm'
                                htmlType='submit'
                                loading={btnLoading}
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
export default AboutCard;