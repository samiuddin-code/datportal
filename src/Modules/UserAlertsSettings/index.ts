import apiInstance from "../../services/axiosInstance";
import { UserAlertsSetting } from "./types";

export class UserAlertsSettingsModule {
    private readonly endPoint = "user-alerts-setting";

    getAlertsSettings = (alertTypeId: number) => {
        return apiInstance.get(`${this.endPoint}/${alertTypeId}`);
    }

    getAlertsSettingsBySlug = (alertTypeSlug: string) => {
        return apiInstance.get(`${this.endPoint}/find-user-alert-by-slug/${alertTypeSlug}`);
    }

    subscribeAlertsUnsubscribe = (data: Partial<UserAlertsSetting>) => {
        return apiInstance.post(`${this.endPoint}/subscribe-unsubscribe`, data);
    }

    unsubscribeAlertsAll = () => {
        return apiInstance.patch(`${this.endPoint}/unsubscribe-all`);
    }
}