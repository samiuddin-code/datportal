import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { QuotationFormType, QuotationParams, QuotationTypes } from "./types";
import { FormDataHeader } from "@modules/Common/config";
import { AutoCreateFromApprovedQuotationTypes } from "@modules/Project/types";

export class QuotationModule {
    private readonly endPoint = "quotation";

    /**Get all quotation records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<QuotationTypes[], QuotationParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get quotation record by id
     * @param id - quotation id
     */
    getRecordById = <Type extends GetResponseTypes<QuotationTypes>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/findOne/${id}`);
    };

    /**Create new quotation record
     * @param data - quotation data
     */
    createRecord = (data: Partial<QuotationFormType>) => {
        return apiInstance.post<{ data: QuotationTypes }>(this.endPoint, data, {
            headers: FormDataHeader
        });
    };

    /**autoCreateFromApprovedQuotation
     * @param {AutoCreateFromApprovedQuotationTypes} data - Data to be created
     */
    autoCreateFromApprovedQuotation = (data: AutoCreateFromApprovedQuotationTypes) => {
        return apiInstance.post(`${this.endPoint}/autoCreateProjectFromApprovedQuotation/`, data);
    }

    /**Update quotation record
     * @param data - quotation data
     * @param id - quotation id
     */
    updateRecord = (data: Partial<QuotationFormType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/updateOne/${id}`, data);
    };

    /**Submit quotation by id
     * @param id - quotation id
     */
    submitQuotation = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/submitQuotation/${id}`);
    }

    /**Change quotation status
     * @param id - quotation id
     * @param status - quotation status
     */
    changeStatus = (id: number, status: number) => {
        return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, { status });
    }

    /**Delete quotation record
     * @param id - quotation id
     */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/remove/${id}`);
    };

    /**Mark Milestone as completed
     * @param id - milestone id
     */
    completeMilestone = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/completeMilestone/${id}`);
    }

    /** Mark As Sent 
     * @param id - quotation id
    */
    markAsSent = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/markAsSent/${id}`);
    }

    /**Prepare Unique Quote Number */
    prepareUniqueQuoteNumber = (query?: { revisionId?: number }) => {
        return apiInstance.get<{ data: { quoteNumber: string } }>(`${this.endPoint}/prepareUniqueQuoteNumber`, { params: query });
    }

    /** Check for duplicacy */
    checkForDuplicacy = (query: { quoteNumber: string, excludeId?: number }) => {
        return apiInstance.get<{ data: { isDuplicate: boolean } }>(`${this.endPoint}/checkForDuplicacy`, { params: query });
    }

    /** Quick Update 
     * @param id - quotation id
     * @param data.projectId - project id
     * @param data.submissionById - submission by id
     * */
    quickUpdate = (id: number, data: { projectId: number, submissionById: number }) => {
        return apiInstance.patch(`${this.endPoint}/quickUpdate/${id}`, data);
    }
}
