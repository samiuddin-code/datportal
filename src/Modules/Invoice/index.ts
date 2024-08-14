import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { InvoiceParams, InvoiceStatusCounts, InvoiceTypes } from "./types";
import { FormDataHeader } from "@modules/Common/config";

export class InvoiceModule {
    private readonly endPoint = "invoice"

    /**Get all Invoice records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<InvoiceTypes[], InvoiceParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get Invoice record by id
     * @param id - Invoice id
     */
    getRecordById = <Type extends GetResponseTypes<InvoiceTypes>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/findOne/${id}`);
    };

    /**Create new Invoice record
     * @param data - Invoice data
     */
    createRecord = (data: any) => {
        return apiInstance.post<{ data: InvoiceTypes }>(this.endPoint, data, {
            headers: FormDataHeader
        });
    };

    /**Update Invoice record
     * @param data - Invoice data
     * @param id - Invoice id
     */
    updateRecord = (data: Partial<InvoiceTypes>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/updateOne/${id}`, data, {
            headers: FormDataHeader
        });
    };

    /**Submit Invoice by id
     * @param id - Invoice id
     */
    submitInvoice = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/submitInvoice/${id}`);
    }

    /**Change Invoice status
     * @param id - Invoice id
     * @param status - Invoice status
     */
    changeStatus = (id: number, data: { status: number; resumeProject?: boolean }) => {
        console.log(data)
        return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, data);
    }

    /**Delete Invoice record
     * @param id - Invoice id
     */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/remove/${id}`);
    };

    /** Mark As Sent 
     * @param id - Invoice id
    */
    markAsSent = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/markAsSent/${id}`);
    }

    /**Prepare Unique Quote Number */
    prepareUniqueInvoiceNumber = () => {
        return apiInstance.get<{ data: { invoiceNumber: string } }>(`${this.endPoint}/prepareUniqueInvoiceNumber`);
    }

    /** Check for duplicacy */
    checkForDuplicacy = (query: { invoiceNumber: string, excludeId?: number }) => {
        return apiInstance.get<{ data: { isDuplicate: boolean } }>(`${this.endPoint}/checkForDuplicacy`, { params: query });
    }

    /** Quick Update
     * @param id - Invoice id
     * @param data - Invoice data
     * @param projectId - project id
     */
    quickUpdate = (id: number, data: { projectId: number }) => {
        return apiInstance.patch(`${this.endPoint}/quickUpdate/${id}`, data);
    }

    /**Add note to enquiry
   * @param id - enquiry id
   * @param data - note data
   * @property `data.note` - note text
   * @property `data.isConcern` - is concern note
   */
    addNote = (id: number, data: { note: string, isConcern: boolean }) => {
        return apiInstance.post(`${this.endPoint}/addNote/${id}`, data);
    }

    /** Get Note by id 
     * @param id - note id
    */
    getNoteById = (id: number) => {
        return apiInstance.get(`${this.endPoint}/notes/${id}`);
    }

    /**Remove note from enquiry
    * @param id - Note id
    */
    removeNote = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/removeNote/${id}`);
    }
    /**Get enquiry logs
    * @param id - enquiry id
    * @param query - query params
    */
    getLogsById = (id: number, query?: any) => {
        return apiInstance.get(`${this.endPoint}/logs/${id}`, { params: query });
    }
    /**Mark Concern As Resolved
     * @param id - note id
     */
    markConcernAsResolved = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/markConcernAsResolved/${id}`);
    }

    /** Get Invoice Statuses Total Counts */
    getCounts = () => {
        return apiInstance.get<{ data: InvoiceStatusCounts }>(`${this.endPoint}/getCounts`);
    }
}
