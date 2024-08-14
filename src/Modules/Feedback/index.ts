import { FormDataHeader } from "@modules/Common/config";
import apiInstance, { BASE_URL } from "../../services/axiosInstance";
import { APIResponseObject } from "../Common/common.interface";
import { FeedbackType } from "./types";

export class  FeedbackModule {
	private readonly endPoint = "feedback";

	getAllRecords = (query?: any) => {
		return apiInstance.get<APIResponseObject & { data: FeedbackType[] }>(BASE_URL + this.endPoint, {
			params: {
				sortByField: 'addedDate',
				sortOrder: 'asc',
				perPage: 25,
				...query
			}
		});
	};

	getRecordById = (id: number) => {
		return apiInstance.get<{ data: FeedbackType }>(BASE_URL + this.endPoint + "/findOne/" + id);
	};


	createRecord = (data: FormData) => {
		return apiInstance.post(BASE_URL + this.endPoint, data, { headers: FormDataHeader });
	};


}