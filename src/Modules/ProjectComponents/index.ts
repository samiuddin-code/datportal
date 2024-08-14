import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { ProjectComponentsType } from "./types";

export class ProjectComponentsModule {
	private readonly endPoint = "project-components";

	getAllRecords = () => {
		return apiInstance.get(BASE_URL + this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(BASE_URL + this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(BASE_URL + this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | ProjectComponentsType) => {
		return apiInstance.post(BASE_URL + this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<ProjectComponentsType>, id: number) => {
		return apiInstance.patch(BASE_URL + this.endPoint + "/" + id, data);
	};
}