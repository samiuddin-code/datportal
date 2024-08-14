import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PromotionTypes } from "./types";

export class PromotionModule {
    private readonly endPoint = "promotion";

    getAllRecords = (queryData?: any) => {
        return apiInstance.get(this.endPoint, { params: queryData });
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}?all=true`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: FormData | PromotionTypes) => {
        return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
    };

    updateRecord = (data: FormData | Partial<PromotionTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
    };
}
