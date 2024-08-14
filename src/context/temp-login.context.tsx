import { ReactNode, createContext, useEffect } from 'react'
import { notification } from 'antd';
import TokenService from '../services/tokenService'
import styles from './styles.module.scss'

//TempLogin context
const TempLoginContext = createContext<any>(null)

//TempLogin provider
export const TempLoginProvider = ({ children }: { children: ReactNode }) => {
    const temp_access_token = TokenService.getTempAccessToken();
    const temp_user_data = TokenService.getUserData();

    const onSwitchBack = () => {
        // Get current data from local storage
        const currentUser = TokenService.getTempUserData()
        const currentAccessToken = TokenService.getTempAccessToken() || ""
        const currentRefreshToken = TokenService.getTempRefreshToken() || ""

        // Update user data and token in local storage with data from temp variable
        TokenService.updateLocalAccessToken(currentAccessToken);
        TokenService.updateLocalRefreshToken(currentRefreshToken);
        TokenService.saveUserData(currentUser);

        // Remove temp data from local storage
        localStorage.removeItem("temp_access_token");
        localStorage.removeItem("temp_refresh_token");
        localStorage.removeItem("temp_user");

        // redirect to dashboard
        window.location.href = '/'
    }

    const openNotification = () => {
        notification.open({
            message: '',
            description: (
                <div className={styles.notification}>
                    <p className='mb-0'>
                        You are temporarily logged in as {temp_user_data?.firstName} {temp_user_data?.lastName}.
                    </p>
                    <p className='mb-0'>
                        Please  {''}
                        <span
                            className={styles.notification_switchBack}
                            onClick={onSwitchBack}
                        >
                            switch back
                        </span> {''}
                        to your account when you are done.
                    </p>
                </div>
            ),
            duration: 0,
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width={24}
                    height={24}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
                    />
                </svg>
            ),
        });
    };

    useEffect(() => {
        if (temp_access_token) {
            openNotification()
        }
    }, [temp_access_token]);

    return (
        <TempLoginContext.Provider value={{}}>
            {children}
        </TempLoginContext.Provider>
    )
}