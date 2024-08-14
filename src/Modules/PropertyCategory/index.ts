import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { PropertyCategoryType } from "./types";

export class PropertyCategoryModule {
	private readonly endPoint = "project-type";

	getAllRecords = () => {
		return apiInstance.get(BASE_URL + this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | PropertyCategoryType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<PropertyCategoryType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}