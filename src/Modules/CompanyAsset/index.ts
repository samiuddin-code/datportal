import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { CompanyAssetParams, CompanyAssetType } from "./types";

export class CompanyAssetModule {
    private readonly endPoint = "company-asset";

    /**Get all CompanyAsset records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<CompanyAssetType[], CompanyAssetParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };
    /**Get all CompanyAsset records
     * @param query - query params
     */
    getCars = <Type extends GetResponseTypes<CompanyAssetType[], CompanyAssetParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint + "/findCompanyCars", { params: query });
    };

    /**Get CompanyAsset record by id
     * @param id - CompanyAsset id
     */
    getRecordById = <Type extends GetResponseTypes<CompanyAssetType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };

    /**Delete CompanyAsset record
    * @param id - CompanyAsset id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new CompanyAsset record
     * @param data - CompanyAsset data
     */
    createRecord = (data: FormData | Partial<CompanyAssetType>) => {
        return apiInstance.post<{ data: CompanyAssetType }>(this.endPoint, data);
    };

    /**Update CompanyAsset record
    * @param data - CompanyAsset data
    * @param id - CompanyAsset id
    */
    updateRecord = (data: FormData | Partial<CompanyAssetType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };

    allocateResources = (data: any) => {
        return apiInstance.post<{ data: CompanyAssetType }>(`${this.endPoint}/allocate`, data);
    };
    revokeResources = (id: any) => {
        return apiInstance.delete<{ data: CompanyAssetType }>(`${this.endPoint}/revoke/${id}`);
    };
}