import apiInstance from "../../../services/axiosInstance";
import { BulkUploadFormatTypes } from "./types";

export class BulkUploadFormatModule {
    private readonly endPoint = "bulk-upload-format";

    getAllRecords = (queryData?: any) => {
        return apiInstance.get(this.endPoint, { params: queryData });
    };
    getAllPublishedRecords = (queryData?: any) => {
        return apiInstance.get(this.endPoint+"/find-published", { params: queryData });
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: BulkUploadFormatTypes) => {
        return apiInstance.post(this.endPoint + "/", data);
    };

    updateRecord = (data: Partial<BulkUploadFormatTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}
