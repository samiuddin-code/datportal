import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { DashboardElementType } from "./types";

export class DashboardElementModule {
	private readonly endPoint = "dashboard-elements";

	/**Get all Biometric records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<DashboardElementType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};
	getDashboardContent = () => {
		return apiInstance.get(this.endPoint + "/get-dashboard-content");
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | DashboardElementType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<DashboardElementType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}