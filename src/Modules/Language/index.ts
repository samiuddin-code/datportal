import apiInstance from "../../services/axiosInstance";
import { LanguageType } from "./types";

export class LanguageModule {
	private readonly endPoint = "language";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	getPublished = () => {
		return apiInstance.get(`${this.endPoint}/find-published`);
	}

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: LanguageType) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<LanguageType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
