import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { AuthoritiesType } from "./types";

export class AuthoritiesModule {
	private readonly endPoint = "authorities";

	/**Get all Biometric records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<AuthoritiesType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	publishedRecords = <Type extends GetResponseTypes<AuthoritiesType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/find-published`, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | AuthoritiesType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<AuthoritiesType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}