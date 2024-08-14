import apiInstance, { BASE_URL } from "../../services/axiosInstance";

export class LeaveCreditModule {
	private readonly endPoint = "leave-credit";

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: any) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: any, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}