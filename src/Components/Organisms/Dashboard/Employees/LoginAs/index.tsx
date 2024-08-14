import { FC, useMemo } from 'react';
import { Button, message, Modal } from 'antd';
import { AuthModule } from '../../../../../Modules/Auth';
import { UserTypes } from '../../../../../Modules/User/types';
import { Typography } from '../../../../Atoms';
import TokenService from '../../../../../services/tokenService';

interface LoginAsModalProps {
    isOpen: boolean;
    handleCancel: () => void;
    record: UserTypes;
    loginAsOtherUser: boolean;
}

const LoginAsModal: FC<LoginAsModalProps> = ({ isOpen, handleCancel, record, loginAsOtherUser }) => {
    const authModule = useMemo(() => new AuthModule(), [])

    const onContinueClick = () => {
        if (loginAsOtherUser === true) {
            authModule.loginAsUser(record?.id).then((res) => {
                const data = res?.data?.data
                if (data?.token) {
                    const msg = `Login as ${record?.firstName} ${record?.lastName} successfully`

                    // Get current data from local storage
                    const currentUser = TokenService.getUserData()
                    const currentAccessToken = TokenService.getLocalAccessToken() || ""
                    const currentRefreshToken = TokenService.getLocalRefreshToken() || ""

                    // Save old data in temp variable in local storage
                    TokenService.saveTempUserData(currentUser);
                    TokenService.updateTempAccessToken(currentAccessToken);
                    TokenService.updateTempRefreshToken(currentRefreshToken);

                    // Update user data and token in local storage with new data
                    TokenService.updateLocalAccessToken(data?.token?.access_token);
                    TokenService.updateLocalRefreshToken(data?.token?.refresh_token);
                    TokenService.saveUserData(res.data.data?.userData);

                    message.success(msg)
                    handleCancel()

                    // Redirect to dashboard
                    window.location.href = '/'
                }
            }).catch((err) => {
                const errorMessage = err?.response?.data?.message || `Login as ${record?.firstName} ${record?.lastName} failed`
                message.error(errorMessage)
            })
        } else {
            const msg = `You don't have permission to login as 
            ${record?.firstName} ${record?.lastName},
             please contact your administrator`
            message.error(msg)
        }
    }

    return (
        <Modal
            title={`Login as ${record?.firstName} ${record?.lastName}`}
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
                        onClick={() => onContinueClick()}
                    >
                        Continue
                    </Button>
                </div>
            )}
        >
            <Typography
                color="dark-main"
                size="normal"
                className="text-center my-4"
            >
                {`When logging in as ${record?.firstName} ${record?.lastName},
                    we'll send them an email to let them know you've logged in
                    as them. including your name and email address.`}
            </Typography>
        </Modal>
    );
}
export default LoginAsModal;