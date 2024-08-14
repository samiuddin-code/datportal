import { Card, Form, message } from 'antd';
import { FC, useMemo, useState } from 'react';
import { AuthModule } from '../../../../Modules/Auth';
import { CustomButton, CustomErrorAlert, CustomInput, Typography } from '../../../Atoms';
import styles from "./styles.module.scss";

interface SecurityProps { }

const Security: FC<SecurityProps> = () => {
    const [form] = Form.useForm();
    const [password, setPassword] = useState<{
        newPassword: string;
        confirmNewPassword: string;
        error: string;
        loading: boolean;
    }>({
        newPassword: '',
        confirmNewPassword: '',
        error: '',
        loading: false,
    });

    const handleAlertClose = () => {
        setPassword({ ...password, error: '' });
    };

    const authModule = useMemo(() => new AuthModule(), []);

    const onFinish = (formValues: any) => {
        setPassword({ ...password, loading: true });

        if (formValues.newPassword !== formValues.confirmNewPassword) {
            setPassword({ ...password, error: 'Passwords do not match', loading: false });
            return;
        }

        const data = {
            password: formValues.currentPassword,
            newPassword: formValues.newPassword
        };

        authModule.changePassword(data).then((res) => {
            message.success(res.data?.message);
            setPassword({ ...password, loading: false, error: '' });
        }).catch((err) => {
            const error = err.response?.data?.message;
            setPassword({ ...password, error: error, loading: false });
        })
    }

    return (
        <div>
            {/**About And Additional Information section */}
            <Card className={styles.AccountSettingsSecurity}>
                <Typography color='dark-main' size='md' className='mb-5'>
                Change Your Password
                </Typography>

                <Form className={styles.form} onFinish={onFinish} form={form}>
                    {password.error && (
                        <CustomErrorAlert
                            description={password.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}

                    <div>
                        <Form.Item
                            name="currentPassword"
                            rules={[{ required: true, message: "Please enter current password" }]}
                        >
                            <CustomInput
                                size="w100"
                                label='Current Password'
                                placeHolder='Enter current password'
                                asterisk
                                type="password"
                                className='w-100'
                            />
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item
                            name="newPassword"
                            rules={[{ required: true, message: "Please enter new password" }]}
                        >
                            <CustomInput
                                size="w100"
                                label='Enter New Password'
                                placeHolder='Enter new password'
                                asterisk
                                type="password"
                            />
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item
                            name="confirmNewPassword"
                            rules={[{ required: true, message: "Please confirm new password" }]}
                        >
                            <CustomInput
                                size="w100"
                                label='Confirm New Password'
                                placeHolder='Confirm new password'
                                asterisk
                                type="password"
                            />
                        </Form.Item>
                    </div>

                    <div className='d-flex justify-end'>
                        <CustomButton
                            type='primary'
                            htmlType='submit'
                            loading={password.loading}
                        >
                            Save Changes
                        </CustomButton>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
export default Security;