import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { message, Radio, RadioChangeEvent, Skeleton } from "antd";
import styles from "./styles.module.scss";
import { UserAlertsSettingsModule } from '../../../../Modules/UserAlertsSettings';
import { AlertsTypeModule } from '../../../../Modules/AlertsType';
import { FindAlerts, UserAlertsSetting } from '../../../../Modules/UserAlertsSettings/types';
import { DefaultAlertSettings, manageNotificationsSubscriptions } from '../../../../helpers/commonEnums';

interface ManageNotificationsProps { }

const ManageNotifications: FC<ManageNotificationsProps> = () => {
    const [isLoading, setIsLoading] = useState(false);

    const module = useMemo(() => new AlertsTypeModule(), []);
    const userAlertsSettingsModule = useMemo(() => new UserAlertsSettingsModule(), []);

    const [manageNotifications, setManageNotifications] = useState<FindAlerts[]>([]);

    const getAlertsData = useCallback(() => {
        setIsLoading(true)

        module.getPublishedAlerts().then((res) => {
            setManageNotifications(res.data?.data)
            setIsLoading(false)
        }).catch((err) => {
            console.error(err?.response?.data)
            setManageNotifications([])
            setIsLoading(false)
        })
    }, [module])

    useEffect(() => {
        getAlertsData()
    }, [])

    const onPreferenceChange = ({
        target: { value } }: RadioChangeEvent,
        radioItem: { type: "app" | "email" | "desktop" | "mobile" },
        alertsTypeId: number
    ) => {
        userAlertsSettingsModule.subscribeAlertsUnsubscribe({
            alertsTypeId: alertsTypeId,
            [radioItem.type]: value
        }).then((res) => {
            message.success(res.data.message)
        }).catch((err) => {
            message.error(err?.response?.data?.message)
        })
    };

    const onUnsubscribeAll = () => {
        userAlertsSettingsModule.unsubscribeAlertsAll().then((res) => {
            message.success(res.data.message)
            getAlertsData()
        }).catch((err) => {
            message.error(err?.response?.data?.message)
        })
    };

    const findDefaultPreferenceValue = (
        userAlertsSetting: UserAlertsSetting[],
        radioItem: { type: "app" | "email" | "desktop" | "mobile" }
    ) => {
        if (userAlertsSetting.length === 0) {
            return DefaultAlertSettings[radioItem.type]
        } else {
            return userAlertsSetting[0][radioItem.type]
        }
    }

    return (
        <section className={styles.manageNotificationsWrap}>
            <div className={styles.heading}>
                <p className={styles.title}>Manage Subscription</p>
                <p onClick={onUnsubscribeAll} className={styles.unsubscribe}>Unsubscribe All</p>
            </div>
            {isLoading ? <Skeleton active /> : <div className={styles.subscriptionsTypeWrap}>
                {manageNotifications?.map((item, index) => (
                    <div key={index} className={styles.subscriptionType}>
                        <p style={{margin:0}}>{item?.title}</p>
                        <p className={styles.description}>{item?.description}</p>
                        <div className={styles.subscriptionsWrap}>
                            {manageNotificationsSubscriptions.map((radioItem, radioIndex) => (
                                <div key={radioIndex} className={styles.subscription}>
                                    <div className={styles.textWrap}>
                                        <p className={styles.subscriptionTitle}>{radioItem.title}</p>
                                        <p className={styles.subscriptionDescription}>{radioItem.description}</p>
                                    </div>
                                    <div className="manageNotificationOverrides">
                                        <Radio.Group
                                            options={[
                                                { label: 'Off', value: false },
                                                { label: 'On', value: true },
                                            ]}
                                            onChange={(e) => onPreferenceChange(e, radioItem, item.id)}
                                            defaultValue={findDefaultPreferenceValue(item.UserAlertsSetting, radioItem)}
                                            optionType="button"
                                            buttonStyle="solid"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>}

        </section>
    )
}
export default ManageNotifications;