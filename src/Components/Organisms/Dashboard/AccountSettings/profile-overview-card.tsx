import { FC, useState } from 'react';
import { Avatar, Card, Divider, Progress, Tooltip, Dropdown, Modal, Upload, UploadFile, UploadProps, message } from 'antd';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { RESOURCE_BASE_URL } from '../../../../helpers/constants';
import { UserTypes } from '../../../../Modules/User/types';
import { Typography } from '../../../Atoms';
import { CheckMarkIcon, XMarkIcon } from '../../../Icons';
import styles from "./styles.module.scss";
import Skeletons from '../../Skeletons';
// import { ProfileScoringStatus } from '../../../../helpers/commonEnums';
import api from '../../../../services/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchType } from '../../../../Redux/Reducers/commonTypes';
import { getLoggedInUser } from '../../../../Redux/Reducers/UsersReducer/action';
import { RootState } from '../../../../Redux/store';

interface ProfileOverviewCardProps {
    defaultData: UserTypes;
    drawer?: boolean;
}

const ProfileOverviewCard: FC<ProfileOverviewCardProps> = ({ defaultData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [images, setImages] = useState<UploadFile[]>([]);
    const dispatch = useDispatch<dispatchType>();

    const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);

    const userData = loggedInUserData?.data
    const name = `${userData?.firstName} ${userData?.lastName}`
    const initials = userData?.firstName?.charAt(0)! + userData?.lastName?.charAt(0)!;
    const profilePicture = userData?.profile
    // const userScoring = defaultData?.userScoring;

    const handleVisibleChange = (flag: boolean) => setVisible(flag);

    const showModal = () => setIsModalOpen(true);

    const handleCancel = () => setIsModalOpen(false);

    /** Upload Image to server */
    const uploadImage = async (options: any) => {
        const { onSuccess, onError, file } = options;
        const fmData = new FormData();
        const config = {
            headers: { "content-type": "multipart/form-data" },
        };
        fmData.append("profile", file);
        try {
            const res = await api.patch("user/update-me", fmData, config);

            const data = await res.data?.data;
            onSuccess("ok");

            if (data) {
                message.success("Profile picture updated successfully");
                // update the user data
                dispatch(getLoggedInUser({ reload: true }));
                // clear the upload file list after success upload 
                setImages([]);
            }
        } catch (err) {
            onError({ err });
        }
    };

    const propsForUpload: UploadProps = {
        beforeUpload: file => {
            const isPNG = file.type === 'image/png';
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg';
            if (!isPNG && !isJPG) {
                message.error('You can only upload PNG or JPG file!');
            }

            return isPNG || isJPG;
        },
        onChange: info => {
            if (info.file.status === 'done') {
                setImages(info.fileList)
            }
        },
        name: 'profile',
        multiple: false,
        maxCount: 1,
        customRequest: uploadImage,
        fileList: images,
    };

    const overlay = (
        <Card className={styles.overlay}>
            <div className={styles.overlay_content}>
                <button
                    className={styles.overlay_content_btn}
                    onClick={() => {
                        handleVisibleChange(false);
                        showModal();
                    }}
                >
                    View Photo
                </button>
                <Divider className='my-0' />
                <Upload {...propsForUpload}>
                    <button
                        className={styles.overlay_content_btn}
                        onClick={() => handleVisibleChange(false)}
                    >
                        Upload a photo
                    </button>
                </Upload>
            </div>
        </Card>
    )

    return (
        <div className={styles.profile}>
            <Card className='rounded-5'>
                <div className={styles.profile_header}>
                    <Dropdown
                        trigger={['click']}
                        dropdownRender={() => overlay}
                        placement="bottom"
                        arrow={{ pointAtCenter: true }}
                        onOpenChange={handleVisibleChange}
                        open={visible}
                    >
                        <Avatar
                            size={80}
                            src={profilePicture ? `${RESOURCE_BASE_URL}${profilePicture}` : ""}
                            alt={name}
                            className='d-flex mx-auto'
                        >
                            {initials ? initials : 'Loading...'}
                        </Avatar>
                    </Dropdown>

                    <Modal
                        title={name}
                        visible={isModalOpen}
                        onCancel={handleCancel}
                        footer={null}
                    >
                        <img
                            src={profilePicture ? `${RESOURCE_BASE_URL}${profilePicture}` : ""}
                            alt={name}
                            className={styles.profile_viewer}
                        />
                    </Modal>

                    <Typography color='dark-main' className='text-center mt-2'>
                        {!userData?.firstName ? '' : name}
                    </Typography>
                </div>

                <div className='ma-3'>
                    <Typography color='dark-main' className='text-center'>
                        Profile Completeness
                    </Typography>

                    {/* <Progress
                        percent={!defaultData?.profileScore ? 0 : defaultData?.profileScore}
                        strokeColor='#00875A'
                    /> */}
                </div>

                <Divider className='mt-0' />

                <div className='ma-3'>
                    {/* {userScoring ? userScoring?.map((item, index) => (
                        <div key={index} className='mb-2'>
                            {ProfileScoringStatus[item.status] === 'can_be_improved' && (
                                <div className='d-flex justify-space-between color-yellow-dark'>
                                    <div className='d-flex align-center'>
                                        <p className='mb-0'>{item.title}</p>

                                        <Tooltip title={item.message}>
                                            <InfoCircleOutlined className='ml-2' />
                                        </Tooltip>
                                    </div>
                                    <WarningOutlined />
                                </div>
                            )}

                            {ProfileScoringStatus[item.status] === 'success' && (
                                <div className='d-flex justify-space-between color-green-yp'>
                                    <p className='mb-0'>{item.title}</p>
                                    <CheckMarkIcon />
                                </div>
                            )}

                            {ProfileScoringStatus[item.status] === 'error' && (
                                <div className='d-flex justify-space-between color-red-yp'>
                                    <div className='d-flex align-center'>
                                        <p className='mb-0'>{item.title}</p>

                                        <Tooltip title={item.message}>
                                            <InfoCircleOutlined className='ml-2' />
                                        </Tooltip>
                                    </div>
                                    <XMarkIcon />
                                </div>
                            )}
                        </div>
                    )) : (
                        <div>
                            <Skeletons items={4} fullWidth />
                        </div>
                    )} */}
                </div>
            </Card>
        </div>
    );
}
export default ProfileOverviewCard;