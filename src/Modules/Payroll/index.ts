import { GetResponseTypes } from "@modules/Common/common.interface";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { PayrollReportType, PayrollType } from "./types";

export class PayrollModule {
	private readonly endPoint = "payroll";

	/**Get all Biometric records
	 * @param query - query params
	 */
	getAllRecords = <Type extends GetResponseTypes<PayrollType[]>>(query?: Type['query']) => {
		return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/findOne/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | PayrollType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: Partial<PayrollType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/update/" + id, data);
	};
	markAsPaid = (data: { ids: number[] }) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/markAsPaid", data);
	};
	recalculateRecord = (id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/recalculate/" + id);
	};

	generateReport = (data: PayrollReportType) => {
		return apiInstance.post(`${this.endPoint}/generateReport`, data, { responseType: 'blob' });
	}
}