import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { CountryTypes } from "./types";

export class CountryModule {
	private readonly endPoint = "country";
	private allEndpoint = "country/all";

	getAllRecords = () => {
		return apiInstance.get(this.allEndpoint);
	};

	getAvailableRecords = () => {
		return apiInstance.get(`${this.endPoint}/available-country`);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | CountryTypes) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<CountryTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};
}
