import apiInstance from "../../services/axiosInstance";
import { AlertsTypes } from "./types";

export class AlertsTypeModule {
    private readonly endPoint = "alerts-type";

    getAllRecords = () => {
        return apiInstance.get(`${this.endPoint}`);
    }

    getPublishedAlerts = () => {
        return apiInstance.get(`${this.endPoint}/find-published`);
    }

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    }

    getRecordBySlug = (slug: string) => {
        return apiInstance.get(`${this.endPoint}/find-by-slug/${slug}`);
    }

    createRecord = (data: Partial<AlertsTypes>) => {
        return apiInstance.post(this.endPoint, data);
    }

    updateRecord = (data: any, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    }

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    }
}