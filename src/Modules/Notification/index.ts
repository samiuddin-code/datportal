import { FormDataHeader } from "@modules/Common/config";
import apiInstance from "@services/axiosInstance";
import { NotificationTypes } from "./types";

export class NotificationModule {
    private readonly endPoint = "notification";

    getAllRecords = (query?: any) => {
        return apiInstance.get<{ data: NotificationTypes[] }>(this.endPoint, { params: query });
    };
    getAnnouncements = (query?: any) => {
        return apiInstance.get<{ data: NotificationTypes[] }>(this.endPoint + "/announcement", { params: query });
    };

    /**
     * Mark a notification as read when clicked and redirect to the notification link
     * @param id - Notification id
     */
    updateRecord = (id: number) => {
        return apiInstance.patch<{ data: NotificationTypes }>(`${this.endPoint}/read/${id}`);
    }

    /**
     * Delete a notification
     * @param id - Notification id
     */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    }

    /** Create a notification
     * @param data - Notification data
     * */
    createRecord = (data: FormData) => {
        return apiInstance.post(this.endPoint, data, { headers: FormDataHeader });
    }

    /** Mark all notifications as read */
    readAllRecords = () => {
        return apiInstance.patch<{ data: NotificationTypes }>(`${this.endPoint}/read/all`);
    }
}