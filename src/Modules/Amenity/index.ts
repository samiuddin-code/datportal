import apiInstance from "../../services/axiosInstance";
import { FormDataHeader } from "../Common/config";
import { Amenity } from "./types";

export class AmenityModule {
	private readonly endPoint = "amenity";

	getAllRecords = () => {
		return apiInstance.get(this.endPoint);
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}?all=true`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: FormData | Amenity) => {
		return apiInstance.post(this.endPoint + "/", data, { headers: FormDataHeader });
	};

	updateRecord = (data: FormData | Partial<Amenity>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data, { headers: FormDataHeader });
	};
}
