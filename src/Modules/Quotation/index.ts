import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance from "@services/axiosInstance";
import { QuotationFormType, QuotationParams, QuotationTypes } from "./types";
import { FormDataHeader } from "@modules/Common/config";
import { AutoCreateFromApprovedQuotationTypes } from "@modules/Project/types";

export class QuotationModule {
  private readonly endPoint = "quotation";

  /** Get all quotation records
   * @param query - query params
   */
  getAllRecords = <Type extends GetResponseTypes<QuotationTypes[], QuotationParams>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
  };

  fetchTasksAssignedToMe = <Type extends GetResponseTypes<any, any>>(query?: Type['query']) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/tasks/assignedToMe`, { params: query });
  };
  async fetchPaymentTermsByProjectId(projectId: number): Promise<string[]> {
    try {
      // Fetch data from API
      const response = await this.getAllRecords({ projectId });
  
      // Log the entire response and response.data to inspect the format
      console.log("API Response:", response);
      console.log("Response Data:", response.data);
  
      // Check if response.data is an object with a specific property containing the array
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const quotations = response.data.data as QuotationTypes[];
  
        // Extract payment terms from each quotation and flatten the array
        const paymentTerms = quotations.flatMap(q => q.paymentTerms || []);
        
        return paymentTerms;
      } else {
        // Handle unexpected data format
        console.error("Unexpected response data format:", response);
        throw new Error("Unexpected response data format");
      }
    } catch (error) {
      console.error("Error fetching payment terms:", error);
      throw error; // Re-throw error for further handling if necessary
    }
  }
  

  /** Get quotation record by id
   * @param id - quotation id
   */
  getRecordById = <Type extends GetResponseTypes<QuotationTypes>>(id: number) => {
    return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/findOne/${id}`);
  };

  /** Create new quotation record
   * @param data - quotation data
   */
  createRecord = (data: Partial<QuotationFormType>) => {
    return apiInstance.post<{ data: QuotationTypes }>(this.endPoint, data, {
      headers: FormDataHeader
    });
  };

  /** autoCreateFromApprovedQuotation
   * @param {AutoCreateFromApprovedQuotationTypes} data - Data to be created
   */
  autoCreateFromApprovedQuotation = (data: AutoCreateFromApprovedQuotationTypes) => {
    return apiInstance.post(`${this.endPoint}/autoCreateProjectFromApprovedQuotation/`, data);
  }

  /** Update quotation record
   * @param data - quotation data
   * @param id - quotation id
   */
  updateRecord = (data: Partial<QuotationFormType>, id: number) => {
    return apiInstance.patch(`${this.endPoint}/updateOne/${id}`, data);
  };

  /** Submit quotation by id
   * @param id - quotation id
   */
  submitQuotation = (id: number) => {
    return apiInstance.patch(`${this.endPoint}/submitQuotation/${id}`);
  }

  /** Change quotation status
   * @param id - quotation id
   * @param status - quotation status
   */
  changeStatus = (id: number, status: number) => {
    return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, { status });
  }

  /** Delete quotation record
   * @param id - quotation id
   */
  deleteRecord = (id: number) => {
    return apiInstance.delete(`${this.endPoint}/remove/${id}`);
  };

  /** Mark Milestone as completed
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

  /** Prepare Unique Quote Number */
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
   */
  quickUpdate = (id: number, data: { projectId: number, submissionById: number }) => {
    return apiInstance.patch(`${this.endPoint}/quickUpdate/${id}`, data);
  }
}
