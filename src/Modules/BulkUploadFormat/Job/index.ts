import apiInstance from "../../../services/axiosInstance";
import { FormDataHeader } from "../../Common/config";
import { BulkUploadJobTypes } from "./types";

export class BiometricsBulkUploadJobModule {
    private readonly endPoint = "biometrics-job";

    getAllRecords = (queryData?: any) => {
        return apiInstance.get(this.endPoint, { params: queryData });
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    /**Get process by id
     * @param id - process id
     */
    getProcessById = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/process/${id}`);
    }

    stopProcess = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/stop/${id}`);
    }

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: FormData | BulkUploadJobTypes) => {
        return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
    };

    updateRecord = (data: Partial<BulkUploadJobTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}
