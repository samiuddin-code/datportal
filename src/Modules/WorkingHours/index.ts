import apiInstance from "@services/axiosInstance";
import { CreateUpdateWorkingHourType, WorkingHourType } from "./types";

export class WorkingHoursModule {
	private readonly endPoint = "working-hours";

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(this.endPoint + "/" + id);
	};

	createRecord = (data: CreateUpdateWorkingHourType) => {
		return apiInstance.post(this.endPoint, data);
	};

	updateRecord = (data: CreateUpdateWorkingHourType, id: number) => {
		return apiInstance.patch(this.endPoint + "/" + id, data);
	};
}