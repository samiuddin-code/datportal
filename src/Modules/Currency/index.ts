import apiInstance from "../../services/axiosInstance";
import { CurrencyTypes } from "./types";

export class CurrencyModule {
    private readonly endPoint = "currency";

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: CurrencyTypes) => {
        return apiInstance.post(this.endPoint + "/", data);
    };

    updateRecord = (data: Partial<CurrencyTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}
