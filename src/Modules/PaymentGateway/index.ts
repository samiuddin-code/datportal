import apiInstance from "../../services/axiosInstance";
import { PaymentGatewayTypes } from "./types";

export class PaymentGatewayModule {
    private readonly endPoint = "payment-gateway";

    getAllRecords = () => {
        return apiInstance.get(this.endPoint);
    };

    getRecordById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/${id}`);
    };

    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    createRecord = (data: PaymentGatewayTypes) => {
        return apiInstance.post(this.endPoint + "/", data);
    };

    updateRecord = (data: Partial<PaymentGatewayTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}
