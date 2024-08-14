import apiInstance from "../../services/axiosInstance";
import { SaveSearchTypes } from "./types";

export class SaveSearchesModule {
	private readonly endPoint = "saved-searches";

	/** Get Admin Panel Saved Searches */
	getAllRecords = (queryData?: { perPage: number }) => {
		return apiInstance.get(this.endPoint + "/findAdminPanelFilters", { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	/** Create Admin Panel Saved Searches */
	createRecord = (data: SaveSearchTypes) => {
		return apiInstance.post(this.endPoint + "/admin", data);
	};

	updateRecord = (data: Partial<SaveSearchTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
