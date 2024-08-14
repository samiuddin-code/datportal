import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { SystemModulesType } from "./types";

export class SystemModulesModule {
	private readonly endPoint = "system-modules";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | SystemModulesType) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<SystemModulesType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, {
			headers: FormDataHeader
		});
	};
}
