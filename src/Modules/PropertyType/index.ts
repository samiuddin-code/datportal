import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { PropertyType } from "./types";

export class PropertyTypeModule {
	private readonly endPoint = "property-type";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | PropertyType) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: FormData | Partial<PropertyType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};
}
