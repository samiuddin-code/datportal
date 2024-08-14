import apiInstance from "../../services/axiosInstance";
//import { UserAlertsTypes } from "./types";

export class UserAlertsModule {
    private readonly endPoint = "user-alerts";

    getAllRecords = (query?: { [key: string]: any }) => {
        return apiInstance.get(`${this.endPoint}`, { params: query });
    }

    // getAlerts = (alertTypeId: number) => {
    //     return apiInstance.get(`${this.endPoint}/${alertTypeId}`);
    // }

    // getAlertsSettingsBySlug = (alertTypeSlug: string) => {
    //     return apiInstance.get(`${this.endPoint}/find-user-alert-by-slug/${alertTypeSlug}`);
    // }

    // subscribeAlertsUnsubscribe = (data: Partial<UserAlertsTypes>) => {
    //     return apiInstance.post(`${this.endPoint}/subscribe-unsubscribe`, data);
    // }

    unsubscribeAlertsAll = () => {
        return apiInstance.patch(`${this.endPoint}/unsubscribe-all`);
    }
}