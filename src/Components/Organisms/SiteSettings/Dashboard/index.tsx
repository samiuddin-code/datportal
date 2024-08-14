import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Typography } from '../../../Atoms';
import { CardWithIcon } from './Cards';
// import NotificationModal from '../../NotificationModal';
import {
    NetworkIcon,
    HouseVerifyIcon,
    FeedbackIcon,
    ClipboardIcon,
    ClipboardTagIcon,
    //ReloadIcon,
} from '../../../Icons';
import styles from './styles.module.scss';
import { UserModule } from '../../../../Modules/User';
import { YallahDashboardTypes, } from '../../../../Modules/User/types';
import Skeletons from '../../Skeletons';
import SiteSettingsTemplate from '../../../Templates/SiteSettings';
import { Link } from 'react-router-dom';

interface DashboardOverviewProps { }

const DashboardOverview: FC<DashboardOverviewProps> = () => {
    const width = window.innerWidth;

    const module = useMemo(() => new UserModule(), []);

    const [moduleData, setModuleData] = useState<{
        loading: boolean,
        data: Partial<YallahDashboardTypes>,
        error?: string | null
    }>({
        loading: true,
        data: {},
        error: null
    });

    // const GetSiteStats = useCallback(() => {
    //     module.getYallahDashboardStats().then((res) => {
    //         setModuleData({
    //             ...moduleData,
    //             loading: false,
    //             data: res.data.data,
    //         });
    //     }).catch((err) => {
    //         setModuleData({
    //             ...moduleData,
    //             loading: false,
    //             error: err.response?.data?.message || 'Something went wrong',
    //         });
    //     })
    // }, [module, moduleData])

    // useEffect(() => {
    //     GetSiteStats()
    // }, [])

    return (
        <SiteSettingsTemplate className={styles.dashboardBody}>
            <div>
                <Typography color='dark-main' size='lg' weight='semi' className='ml-10 mb-4'>
                    Site  Overview
                </Typography>

                <div className={styles.overview}>
                    {moduleData.loading ? (
                        <Skeletons items={4} />
                    ) : (
                        <>
                            <div className={styles.overview_cards}>
                                {(moduleData.data?.transaction?._sum?.amount !== null && moduleData.data?.transaction?._sum?.amount !== undefined) && (
                                    <Link to={"/orders"}>
                                        <CardWithIcon
                                            title={moduleData.data?.transaction?._sum?.amount}
                                            subtitle='Transactions this month'
                                            icon={<NetworkIcon width={50} height={50} />}
                                        />
                                    </Link>
                                )}
                                {(moduleData.data?.creditsHistory?._sum?.creditsUsed !== null && moduleData.data?.creditsHistory?._sum?.creditsUsed !== undefined) && (
                                    <Link to={"/credits/history"}>
                                        <CardWithIcon
                                            title={moduleData.data?.creditsHistory?._sum?.creditsUsed}
                                            subtitle='Credits spent this month'
                                            icon={<NetworkIcon width={50} height={50} />}
                                        />
                                    </Link>
                                )}
                                {moduleData.data?.activePackages !== null && moduleData.data?.activePackages !== undefined && (
                                    <Link to={"/orders"}>
                                        <CardWithIcon
                                            title={moduleData.data.activePackages}
                                            subtitle='Active packages'
                                            icon={<ClipboardTagIcon width={50} height={50} />}
                                        />
                                    </Link>
                                )}
                                {moduleData.data?.organization !== null && moduleData.data?.organization !== undefined && (
                                    <Link to={"/siteSettings/organization"}>
                                        <CardWithIcon
                                            title={moduleData.data?.organization}
                                            subtitle='Total organization'
                                            icon={<HouseVerifyIcon width={50} height={50} />}
                                        />
                                    </Link>
                                )}
                            </div>
                            {/* 
                            <div
                                className={!moduleData.data?.creditsHistory && width > 767 ? styles.overview_main_full : styles.overview_main}>
                                <NotificationModal dropdown={false} />
                                {moduleData.data?.property !== null && moduleData.data?.property !== undefined && (
                                    <PropertiesAnalytics
                                        property={moduleData?.data?.property}
                                    />
                                )}
                            </div> */}

                            <div className={styles.overview_cards}>
                                {moduleData.data?.verifiedAgents !== null && moduleData.data?.verifiedAgents !== undefined && (
                                    <Link to={"/siteSettings/user"}>
                                        <CardWithIcon
                                            title={moduleData.data.verifiedAgents}
                                            subtitle='Total agents'
                                            icon={<ClipboardIcon width={50} height={50} />}
                                            lightSubtitle
                                        />
                                    </Link>
                                )}
                                {moduleData.data?.activeUsers !== null && moduleData.data?.activeUsers !== undefined && (
                                    <Link to={"/siteSettings/user"}>
                                        <CardWithIcon
                                            title={moduleData.data.activeUsers}
                                            subtitle='Total users'
                                            icon={<ClipboardIcon width={50} height={50} />}
                                            lightSubtitle
                                        />
                                    </Link>
                                )}

                                {moduleData.data?.leads !== null && moduleData.data?.leads !== undefined && (
                                    <Link to={"/siteSettings/leads"}>
                                        <CardWithIcon
                                            title={moduleData.data.leads}
                                            subtitle='Total leads'
                                            icon={<ClipboardTagIcon width={50} height={50} />}
                                            lightSubtitle
                                        />
                                    </Link>
                                )}

                                {moduleData.data?.reviews !== null && moduleData.data?.reviews !== undefined && (
                                    <Link to={"/siteSettings/user-ratings"}>
                                        <CardWithIcon
                                            title={moduleData.data.reviews}
                                            subtitle='Reviews this month'
                                            icon={<FeedbackIcon width={50} height={50} />}
                                            lightSubtitle
                                        />
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SiteSettingsTemplate>
    );
}
export default DashboardOverview;