import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { FormDataHeader } from "@modules/Common/config";
import { OrganizationParams, OrganizationType } from "./types";

export class OrganizationModule {
    private readonly endPoint = "organization";

    /**Get all organization records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<OrganizationType[], OrganizationParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get all organization records
     * @param query - query params
     */
    findPublished = <Type extends GetResponseTypes<OrganizationType[], OrganizationParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint+"/find-published", { params: query });
    };

    /**Get organization record by id
     * @param id - organization id
     */
    getRecordById = <Type extends GetResponseTypes<OrganizationType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Delete organization record
    * @param id - organization id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new organization record
     * @param data - organization data
     */
    createRecord = (data: FormData | Partial<OrganizationType>) => {
        return apiInstance.post<{ data: OrganizationType }>(this.endPoint, data, {
            headers: FormDataHeader
        });
    };

    /**Update organization record
    * @param data - organization data
    * @param id - organization id
    */
    updateRecord = (data: FormData | Partial<OrganizationType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data, {
            headers: FormDataHeader
        });
    };

    getTenants = () => {
        return apiInstance.get(`xero/getTenants`);
    }
}