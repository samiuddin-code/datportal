import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { AccountType } from "./types";

export class AccountModule {
    private readonly endPoint = "account";

    /**Get all Account records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<AccountType[]>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get Account record by id
     * @param id - Account id
     */
    getRecordById = <Type extends GetResponseTypes<AccountType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Delete Account record
    * @param id - Account id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new Account record
     * @param data - Account data
     */
    createRecord = (data: Partial<AccountType>) => {
        return apiInstance.post<{ data: AccountType }>(this.endPoint, data);
    };

    /**Update Account record
    * @param data - Account data
    * @param id - Account id
    */
    updateRecord = (data: Partial<AccountType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}