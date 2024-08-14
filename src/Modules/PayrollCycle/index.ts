import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { PayrollCycleType } from "./types";

export class PayrollCycleModule {
	private readonly endPoint = "payroll-cycle";

	/**Get all Biometric records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<PayrollCycleType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | PayrollCycleType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<PayrollCycleType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};

	processRecord = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/process/" + id);
	};
}