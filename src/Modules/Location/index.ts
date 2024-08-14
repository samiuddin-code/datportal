import apiInstance from "../../services/axiosInstance";
import { LocationType } from "./types";

export class LocationModule {
	private readonly endPoint = "location";

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	getAllRecordsByLocation = () => {
		return apiInstance.get(`${this.endPoint}/find-location-in-a-country`);
	};

	getAllRecordsByLocationId = (id: number) => {
		return apiInstance.get(`${this.endPoint}/searchLocation/${id}`);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	};

	createRecord = (data: LocationType) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<LocationType>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};
}
