import apiInstance from "../../services/axiosInstance";
import { SMSLogsFiltersTypes, SMSTypes } from "./types";

export class SMSModule {
    private readonly endPoint = "sms";

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: SMSTypes) => {
        return apiInstance.post(this.endPoint + "/", data);
    };

    updateRecord = (data: Partial<SMSTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };

    //make default sms gateway
    makeDefault = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/makeDefaultSMSGateway/${id}`);
    }

    /** Read sms logs */
    getLogs = (query?: Partial<SMSLogsFiltersTypes> & { page?: number; perPage?: number; }) => {
        return apiInstance.get(`${this.endPoint}/readSmsSentLogs`, { params: query });
    }
}
