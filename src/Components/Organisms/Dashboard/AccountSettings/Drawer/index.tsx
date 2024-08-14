import { Drawer, Skeleton } from 'antd';
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { UserModule } from '../../../../../Modules/User';
import { UserResponseObject } from '../../../../../Modules/User/types';
import { XMarkIcon } from '../../../../Icons';
import Profile from '../profile';
import styles from '../styles.module.scss';

interface ProfileDrawerProps {
    userId: number
    action: ReactNode,
}

const ProfileDrawer: FC<ProfileDrawerProps> = ({ userId, action }) => {
    const userModule = useMemo(() => new UserModule(), []);
    const [open, setOpen] = useState(false);
    const width = window.innerWidth;

    const showDrawer = () => setOpen(true);

    const onClose = () => setOpen(false);

    const getWidth = () => {
        if (width >= 768 && width <= 1024) {
            return (width - 70);
        } else if (width > 1024) {
            return 1100;
        }
        return (width - 20);
    }

    const [userData, setUserData] = useState<UserResponseObject>();

    const getData = useCallback(() => {
        if (userId && open) {
            userModule.getRecordById(userId).then((res) => {
                setUserData(res?.data.data)
            }).catch((err) => {
                setUserData(undefined)
            })
        }
    }, [userModule, userId, open])

    useEffect(() => {
        getData()
    }, [getData])

    return (
        <>
            <div>
                <span onClick={showDrawer}>{action}</span>
            </div>
            <Drawer
                placement="right"
                closable={false}
                onClose={onClose}
                open={open}
                width={getWidth()}
            >
                <XMarkIcon
                    className={styles.closeIcon}
                    onClick={onClose}
                    width={25}
                    height={25}
                />
                <div className='mx-3 my-12'>
                    {userData ? (
                        <Profile
                            drawer={true}
                            defaultData={userData?.data}
                            reload={getData}
                        />
                    ) : (
                        <Skeleton active />
                    )}
                </div>
            </Drawer>
        </>
    );
}
export default ProfileDrawer;