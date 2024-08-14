import apiInstance from "../../services/axiosInstance";
import { CreditsRate } from "./types";

export class CreditsRateModule {
	private readonly endPoint = "credits-rate";

	getAllRecords = (query?: any) => {
		return apiInstance.get(this.endPoint, { params: query });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	createRecord = (data: CreditsRate) => {
		return apiInstance.post(this.endPoint + "/", data);
	};
}
