import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { BiometricParams, BiometricType } from "./types";

export class BiometricModule {
    private readonly endPoint = "biometrics";

    /** Get all Biometric records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<BiometricType[], BiometricParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get Biometric record by id
     * @param id - Biometric id
     */
    getRecordById = <Type extends GetResponseTypes<BiometricType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Find published Biometric records
     * @param query - query params
     */
    findPublished = <Type extends GetResponseTypes<BiometricType[], BiometricParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/published`, { params: query });
    }

    /**Delete Biometric record
    * @param id - Biometric id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new Biometric record
     * @param data - Biometric data
     */
    createRecord = (data: Partial<BiometricType>) => {
        return apiInstance.post<{ data: BiometricType }>(this.endPoint, data);
    };

    /**Update Biometric record
    * @param data - Biometric data
    * @param id - Biometric id
    */
    updateRecord = (data: Partial<BiometricType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}