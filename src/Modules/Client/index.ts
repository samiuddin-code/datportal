import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { ClientParams, ClientType } from "./types";

export class ClientModule {
    private readonly endPoint = "client";

    /**Get all Client records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<ClientType[], ClientParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get Client record by id
     * @param id - Client id
     */
    getRecordById = <Type extends GetResponseTypes<ClientType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Find published client records
     * @param query - query params
     */
    findPublished = <Type extends GetResponseTypes<ClientType[], ClientParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-published`, { params: query });
    }

    /**Delete Client record
    * @param id - Client id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new Client record
     * @param data - Client data
     */
    createRecord = (data: Partial<ClientType>) => {
        return apiInstance.post<{ data: ClientType }>(this.endPoint, data);
    };

    /**Update Client record
    * @param data - Client data
    * @param id - Client id
    */
    updateRecord = (data: Partial<ClientType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };
}