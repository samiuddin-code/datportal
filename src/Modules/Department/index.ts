import apiInstance from "@services/axiosInstance";
import { DepartmentType } from "./types";

export class DepartmentModule {
	private readonly endPoint = "department";

	getAllRecords = (queryData?: any) => {
		return apiInstance.get<{ data: DepartmentType[] }>(this.endPoint, { params: queryData });
	};

	getAllPublishedRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint + "/find-published", { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | DepartmentType) => {
		return apiInstance.post(this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<DepartmentType>, id: number) => {
		return apiInstance.patch(this.endPoint + "/" + id, data);
	};
}