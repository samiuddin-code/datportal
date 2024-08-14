import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { TaxRateType } from "./types";

export class TaxRateModule {
    private readonly endPoint = "tax-rate";

    /**Get all TaxRate records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<TaxRateType[]>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get TaxRate record by id
     * @param id - TaxRate id
     */
    getRecordById = <Type extends GetResponseTypes<TaxRateType>>(id: number) => {
        return apiInstance.get<Omit<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Delete TaxRate record
    * @param id - TaxRate id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new TaxRate record
     * @param data - TaxRate data
     */
    createRecord = (data: Partial<TaxRateType>) => {
        return apiInstance.post<{ data: TaxRateType }>(this.endPoint, data);
    };

    /**Update TaxRate record
    * @param data - TaxRate data
    * @param id - TaxRate id
    */
    updateRecord = (data: Partial<TaxRateType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}