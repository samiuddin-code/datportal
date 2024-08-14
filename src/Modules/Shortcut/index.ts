import apiInstance from "../../services/axiosInstance";
import { ShortcutTypes } from "./types";

export class ShortcutModule {
	private readonly endPoint = "shortcut";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: ShortcutTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<ShortcutTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
