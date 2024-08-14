import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { Skeleton } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { UserModule } from '@modules/User';
import { UserResponseObject } from '@modules/User/types';
import AccountSettingsTemplate from './layout';
import Profile from './profile';
import Security from './security';
// import AboutOrganization from './about-org';
import ManageNotifications from './manage-notifications';
import TokenService from '@services/tokenService';

interface AccountSettingsProps { }

const AccountSettings: FC<AccountSettingsProps> = () => {
    const userModule = useMemo(() => new UserModule(), []);
    const user = TokenService.getUserData();

    const [userData, setUserData] = useState<UserResponseObject>();

    const [searchParams] = useSearchParams()
    const tab = searchParams.get('tab');
    if (tab === "profile") {
        window.location.href = "/employees/" + user.id
    }

    const getData = useCallback(() => {
        userModule.getUserProfileScores().then((res) => {
            setUserData(res?.data)
        }).catch((err) => {
            console.error(err?.response?.data)
            setUserData(undefined)
        })
    }, [userModule])

    useEffect(() => {
        getData()
    }, [getData])

    return (
        <AccountSettingsTemplate>
            {/* {tab === "organization" && <AboutOrganization />} */}
            {tab === "security" && <Security />}
            {tab === "manage_notifications" && <ManageNotifications />}
            {(tab === "profile" || tab === null) && (
                <>
                    {userData ? (
                        <Profile
                            defaultData={userData?.data}
                            reload={getData}
                        />
                    ) : (
                        <Skeleton active />
                    )}
                </>
            )}
        </AccountSettingsTemplate>
    );
}
export default AccountSettings;