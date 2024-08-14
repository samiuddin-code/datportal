import apiInstance from "../../services/axiosInstance";
import { PackageTypes } from "./types";

export class PackageModule {
    private readonly endPoint = "package";

    createRecord = (data: PackageTypes) => {
        return apiInstance.post(this.endPoint + "/", data);
    };

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    };

    getAllPublished = () => {
        return apiInstance.get(this.endPoint + "/findPublished");
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    updateRecord = (data: Partial<PackageTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    // validate package by coupon code and credit package id
    validatePackage = (data: { packageId: number; couponCode: string }) => {
        return apiInstance.post(`${this.endPoint}/validate-coupon-code`, data);
    }
}

export class PackagePromotion {
    private readonly endPoint = "package-promotions";

    createRecord = (data: { promotionId: number; packageIds: number[] }) => {
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

    deleteRecordById = (promotionId: number, packageId: number) => {
        return apiInstance.delete(`${this.endPoint}/${promotionId}/${packageId}`);
    }

    updateRecord = (data: { promotionId: number; creditPackageIds: number[] }) => {
        return apiInstance.patch(this.endPoint + "/", data);
    }
}
