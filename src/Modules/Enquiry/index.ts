import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { AutoCreateLeadTypes, EnquiryStatusCounts, EnquiryType } from "./types";
import { FormDataHeader } from "@modules/Common/config";

export class EnquiryModule {
    private readonly endPoint = "enquiry";

    /**Get all enquiry records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<EnquiryType[]>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get enquiry record by id
     * @param id - enquiry id
     */
    getRecordById = <Type extends GetResponseTypes<EnquiryType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find/${id}`);
    };

    /**Find Duplicate Company
     * @param id - enquiry id
     */
    findDuplicateCompany = (id: number) => {
        return apiInstance.get(`${this.endPoint}/findDuplicateCompany/${id}`);
    }

    /**Create new enquiry record
     * @param data - enquiry data
     */
    createRecord = (data: any) => {
        return apiInstance.post<{ data: EnquiryType }>(this.endPoint, data);
    };

    /**Auto Create Lead
     * @param data - lead data
     */
    autoCreateLead = (data: AutoCreateLeadTypes) => {
        return apiInstance.post(this.endPoint + "/autoCreateLeadFromEnquiry", data);
    }

    /**Update enquiry record
     * @param data - enquiry data
     * @param id - enquiry id
     */
    updateRecord = (data: Partial<EnquiryType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/update/${id}`, data);
    };

    /**Change enquiry status
     * @param id - enquiry id
     * @param status - enquiry status
     */
    changeStatus = (id: number, status: number) => {
        return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, { status });
    }

    /**Get enquiry logs
     * @param id - enquiry id
     * @param query - query params
     */
    getLogsById = (id: number, query?: any) => {
        return apiInstance.get(`${this.endPoint}/logs/${id}`, { params: query });
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

    /**Assign Lead
     * @param data.assignedToId - user id
     * @param id - enquiry id
     */
    assignLead = (data: { assignedToId: number }, id: number,) => {
        return apiInstance.patch(`${this.endPoint}/assignLead/${id}`, data);
    }

    /**Assign Enquiry to a user
     * @param data.assignedToId - user id
     * @param id - enquiry id
     */
    assignEnquiry = (data: { assignedToId: number }, id: number,) => {
        return apiInstance.patch(`${this.endPoint}/assignEnquiry/${id}`, data);
    }

    /**Delete enquiry record
     * @param id - enquiry id
     */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/remove/${id}`);
    };

    /**Remove note from enquiry
     * @param id - Note id
     */
    removeNote = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/removeNote/${id}`);
    }

    /** Upload enquiry file
     * @property `file` - file to upload
     * @property `enquiryId` - enquiry id
     */
    uploadFile = (data: FormData) => {
        return apiInstance.post(`${this.endPoint}/uploadEnquiryDocuments`, data, {
            headers: FormDataHeader
        });
    }

    /** Remove enquiry file by id
     * @param id - file id
     */
    removeFile = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/removeDocument/${id}`);
    }

    /**Mark Concern As Resolved
     * @param id - note id
     */
    markConcernAsResolved = (id: number) => {
        return apiInstance.patch(`${this.endPoint}/markConcernAsResolved/${id}`);
    }

    /** Get Enquiry Statuses Total Counts */
    getCounts = () => {
        return apiInstance.get<{ data: EnquiryStatusCounts }>(`${this.endPoint}/getCounts`);
    }
}
