import { FC } from 'react';
import styles from "./styles.module.scss";
import AboutCard from './about-card';
import AdditionalInfoCard from './additional-info-card';
import ProfileOverviewCard from './profile-overview-card';
import { UserTypes } from '../../../../Modules/User/types';

interface ProfileProps {
    defaultData: UserTypes;
    /** function to reload the user data */
    reload?: () => void
    drawer?: boolean
}

const Profile: FC<ProfileProps> = ({ defaultData, reload, drawer }) => {
    return (
        <div className={styles.AccountSettingsWrapper}>
            {/**About And Additional Information section */}
            <div className={styles.AccountSettingsWrapper_item1}>
                <div>
                    <AboutCard
                        defaultData={defaultData}
                        reload={reload}
                        loading={!defaultData}
                        drawer={drawer}
                    />
                </div>
                <div className='mt-10'>
                    {/* <AdditionalInfoCard
                        defaultData={defaultData?.userMeta}
                        reload={reload}
                        drawer={drawer}
                    /> */}
                </div>
            </div>

            {/**Profile Card Overview section */}
            <div className={styles.AccountSettingsWrapper_item2}>
                <ProfileOverviewCard
                    defaultData={defaultData!}
                    drawer={drawer}
                />
            </div>
        </div>
    );
}
export default Profile;