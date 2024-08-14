import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "../Common/common.interface";
import { LeadsTypes, LeadsParamTypes, LeadsStatusCounts } from "./types";
import { FormDataHeader } from "@modules/Common/config";

export class LeadsModule {
	private readonly endPoint = "leads";

	/**Get all lead records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<LeadsTypes[], LeadsParamTypes>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	/**Get lead record by id
	 * @param id - lead id
	 */
	getRecordById = <Type extends GetResponseTypes<LeadsTypes>>(id: number) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
	};

	/** Get Note by id 
	 * @param id - note id
	*/
	getNoteById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/notes/${id}`);
	}

	/**Create new lead record
	 * @param data - lead data
	 */
	createRecord = (data: LeadsTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	/**Update lead record
   * @param data - lead data
   * @param id - lead id
   */
	updateRecord = (data: Partial<LeadsTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};

	/**Change lead status
	 * @param id - lead id
	 * @param status - lead status
	 */
	changeStatus = (id: number, status: number) => {
		return apiInstance.patch(`${this.endPoint}/changeStatus/${id}`, { status });
	}

	/**Add note to lead
	 * @param id - lead id
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
	notelogs = (id: number, query?: any) => {
		return apiInstance.get(`${this.endPoint}/logs/${id}`, { params: query });
	}

	/**Assign Lead
	* @param data.assignedToId - user id
	* @param id - lead id
	*/
	assignLead = (data: { assignedToId: number }, id: number,) => {
		return apiInstance.patch(`${this.endPoint}/assignLead/${id}`, data);
	}

	/**Delete record by id
	 * @param id - lead id
	*/
	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/remove/${id}`);
	};

	/**Remove note from lead
	 * @param id - Note id
	 */
	removeNote = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/removeNote/${id}`);
	}

	/** Upload lead file
	 * @property `file` - file to upload
	 * @property `leadId` - lead id
	 */
	uploadFile = (data: FormData) => {
		return apiInstance.post(`${this.endPoint}/uploadLeadsDocuments`, data, {
			headers: FormDataHeader
		})
	}

	/** Remove lead file by id
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

	/** Get Lead Statuses Total Counts */
	getCounts = () => {
		return apiInstance.get<{ data: LeadsStatusCounts }>(`${this.endPoint}/getCounts`);
	}
}
