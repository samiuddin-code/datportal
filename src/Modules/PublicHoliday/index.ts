import apiInstance from "@services/axiosInstance";
import { CreatePublicHolidayType, PublicHolidayType } from "./types";

export class PublicHolidayModule {
	private readonly endPoint = "public-holiday";

	getAllRecords = (queryData?: any) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(this.endPoint + "/" + id);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(this.endPoint + "/" + id);
	};

	createRecord = (data: FormData | CreatePublicHolidayType) => {
		return apiInstance.post(this.endPoint, data);
	};

	updateRecord = (data: FormData | Partial<PublicHolidayType>, id: number) => {
		return apiInstance.patch(this.endPoint + "/" + id, data);
	};
}