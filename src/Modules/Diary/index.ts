import apiInstance from "../../services/axiosInstance";
import { DiaryType } from "./types";

export class DiaryModule {
    private readonly endPoint = "diary";

    getAllRecords = (queryData?: any) => {
        return apiInstance.get<{ data: DiaryType[] }>(this.endPoint, { params: queryData });
    };

    getRecordById = (id: number) => {
        return apiInstance.get<{ data: DiaryType }>(`${this.endPoint}/${id}?all=true`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: any) => {
        return apiInstance.post<{ data: DiaryType }>(this.endPoint, data);
    };

    updateRecord = (data: Partial<DiaryType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}
