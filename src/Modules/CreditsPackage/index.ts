import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { CreditsPackageTypes } from "./types";

export class CreditsPackageModule {
    private readonly endPoint = "credit-package";

    createRecord = (data: FormData | CreditsPackageTypes) => {
        return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
    };

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    };

    getAllPublished = () => {
        return apiInstance.get(this.endPoint + "/findPublished");
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}?all=true`);
    };

    updateRecord = (data: FormData | Partial<CreditsPackageTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };
}

export class CreditsPackagePromotion {
    private readonly endPoint = "credit-package-promotions";

    createRecord = (data: { promotionId: number; creditPackageIds: number[] }) => {
        return apiInstance.post(this.endPoint + "/", data);
    }

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    }

    getRecordById = (promotionId: number) => {
        return apiInstance.get(`${this.endPoint}/${promotionId}`);
    }

    deleteMultipleRecords = (promotionId: number, packageIds: number[]) => {
        return apiInstance.delete(`${this.endPoint}/removeMultiple/${promotionId}`, { params: { packageIds } });
    }

    deleteRecordById = (promotionId: number, creditPackageId: number) => {
        return apiInstance.delete(`${this.endPoint}/${promotionId}/${creditPackageId}`);
    }

    updateRecord = (data: { promotionId: number; creditPackageIds: number[] }) => {
        return apiInstance.patch(this.endPoint + "/", data);
    }
}
