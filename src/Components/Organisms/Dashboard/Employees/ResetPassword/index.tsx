import { Button, Form, message, Modal, Radio, Typography as AntdTypography } from 'antd';
import { FC, useMemo, useState } from 'react';
import { generatePassword } from '../../../../../helpers/common';
import { UserModule } from '../../../../../Modules/User';
import { UserTypes } from '../../../../../Modules/User/types';
import { CustomInput, Typography } from '../../../../Atoms';
import styles from '../styles.module.scss';

const { Paragraph } = AntdTypography;

interface ResetPasswordModalProps {
    isOpen: boolean;
    handleCancel: () => void;
    record: UserTypes,
    updateUser: boolean;
}

const ResetPasswordModal: FC<ResetPasswordModalProps> = ({ isOpen, handleCancel, record, updateUser }) => {
    const [selectedOption, setSelectedOption] = useState<"auto" | "create">("auto");
    const [step, setStep] = useState<"select" | "next">("select");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const userModule = useMemo(() => new UserModule(), [])

    const onResetClick = () => {
        if (updateUser === true) {
            const generatedPassword = generatePassword();

            if (selectedOption === "auto") {
                setPassword(generatedPassword);
            }

            setStep("next");

            userModule.updateRecord({
                password: selectedOption === "auto" ? generatedPassword : password,
            }, record?.id).then((res) => {
                setStep("next");
            }).catch((err) => {
                const msg = err?.response?.data?.message || "Something went wrong";
                message.error(msg);
            })
        } else {
            const msg = `You don't have permission to reset password for
             ${record?.firstName} ${record?.lastName}, please contact
             your administrator`;
            message.error(msg);
        }
    }

    return (
        <Modal
            title={`Reset password for ${record?.firstName} ${record?.lastName}`}
            visible={isOpen}
            onCancel={handleCancel}
            footer={(
                <div>
                    <Button
                        className='rounded-5'
                        type='text'
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        className='ml-2 rounded-5'
                        type='primary'
                        onClick={() => step === "select" ? onResetClick() : handleCancel()}
                    >
                        {step === "select" ? "Reset" : "Done"}
                    </Button>
                </div>
            )}
        >
            {step === "select" ? (
                <Radio.Group
                    name="password-reset-options"
                    style={{ display: "flex", flexDirection: "column" }}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    defaultValue={selectedOption}
                >
                    <Radio
                        value={"auto"}
                        className='font-size-md color-dark-main'
                    >
                        Automatically generate a password
                        <p className='font-size-sm color-dark-sub mb-0'>
                            You will be able to view and copy the password in the next step.
                        </p>
                    </Radio>

                    <Radio
                        value={"create"}
                        className='font-size-md color-dark-main mt-2'
                    >
                        Create password
                    </Radio>
                    {selectedOption === "create" && (
                        <div className='mt-1 ml-6'>
                            <Form>
                                <CustomInput
                                    label='Password'
                                    placeHolder='Enter password'
                                    type='password'
                                    className='mb-2'
                                    onChange={(e: any) => setPassword(e.target.value)}
                                />
                            </Form>
                        </div>
                    )}
                </Radio.Group>
            ) : (
                <div>
                    <img
                        src="/images/forgot-password.svg"
                        className={styles.forgotPasswordImg}
                        alt="forgot-password"
                    />
                    <Typography
                        color="dark-sub"
                        size="md"
                        weight="semi"
                        className="text-center my-4"
                    >
                        Password has been reset successfully.
                    </Typography>
                    <Paragraph
                        copyable={{ text: password }}
                        className='font-size-md color-dark-main text-center mb-0'
                    >
                        Password: {""}
                        <span className='font-weight-bold'>
                            {showPassword ? password : "********"}
                        </span>
                    </Paragraph>
                    <p
                        className='font-size-sm color-dark-sub text-center mb-0 mt-2 cursor-pointer'
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Hide Password" : "Show Password"}
                    </p>
                </div>
            )}
        </Modal>
    );
}
export default ResetPasswordModal;