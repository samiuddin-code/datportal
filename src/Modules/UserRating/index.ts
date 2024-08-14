import apiInstance from "../../services/axiosInstance";
import { UserRatingTypes, UserRating_QUERY_TYPES } from "./types";

export class UserRatingModule {
	private readonly endPoint = "user-rating";

	getAllRecords = (queryData?: Partial<UserRating_QUERY_TYPES>) => {
		return apiInstance.get(this.endPoint, { params: queryData });
	};

	getRecordById = (id: number) => {
		return apiInstance.get(`${this.endPoint}/${id}`);
	};

	createRecord = (data: UserRatingTypes) => {
		return apiInstance.post(this.endPoint + "/", data);
	};

	updateRecord = (data: Partial<UserRatingTypes>, id: number) => {
		return apiInstance.patch(`${this.endPoint}/${id}`, data);
	};

	deleteRecord = (id: number) => {
		return apiInstance.delete(`${this.endPoint}/${id}`);
	}
}
