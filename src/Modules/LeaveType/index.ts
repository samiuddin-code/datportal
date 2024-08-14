import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { LeaveTypeType } from "./types";

export class LeaveTypeModule {
	private readonly endPoint = "leave-type";

	/**Get all Biometric records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<LeaveTypeType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};
	getAllPublishedRecords = <Type extends GetResponseTypes<LeaveTypeType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint + "/find-published", { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | LeaveTypeType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<LeaveTypeType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}